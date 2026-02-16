/**
 * @file tests/security/firestore.rules.test.ts
 * @description Security tests for Firestore rules
 * @metaData Model: Gemini 2.0 Flash
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import { logVulnerability } from './reporter';

let testEnv: RulesTestEnvironment;

const PROJECT_ID = 'ilytat-hq-test';

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: {
            rules: fs.readFileSync('firestore.rules', 'utf8'),
            host: '127.0.0.1',
            port: 8080
        }
    });
});

afterAll(async () => {
    await testEnv.cleanup();
});

beforeEach(async () => {
    await testEnv.clearFirestore();
});

// Helper to assert failure and log vulnerability if it succeeds
async function assertSecurityFails(promise: Promise<any>, description: string) {
    try {
        await assertFails(promise);
    } catch (e) {
        logVulnerability('hack/firestore security', `FAILED: ${description} - Operation succeeded unexpectedly.`);
        throw new Error(`Security Vulnerability: ${description}`);
    }
}

describe('Firestore Security Rules', () => {

    describe('Tenants Collection', () => {
        it('should allow tenant member to read tenant data', async () => {
            const alice = testEnv.authenticatedContext('alice', { tenantId: 'tenant-1' });
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().doc('tenants/tenant-1').set({ name: 'Tenant 1' });
            });
            await assertSucceeds(alice.firestore().doc('tenants/tenant-1').get());
        });

        it('should deny non-tenant member from reading tenant data', async () => {
            // Mock data exists
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().doc('tenants/tenant-1').set({ name: 'Tenant 1' });
            });
            const bob = testEnv.authenticatedContext('bob', { tenantId: 'tenant-2' });
            await assertSecurityFails(bob.firestore().doc('tenants/tenant-1').get(), 'Non-tenant member read tenant data');
        });
    });

    describe('Projects Collection', () => {
        it('should allow tenant member to create project', async () => {
            const alice = testEnv.authenticatedContext('alice', { tenantId: 'tenant-1' });
            await assertSucceeds(alice.firestore().collection('projects').add({
                tenantId: 'tenant-1',
                name: 'Project 1'
            }));
        });

        it('should deny creation with wrong tenantId', async () => {
            const alice = testEnv.authenticatedContext('alice', { tenantId: 'tenant-1' });
            await assertSecurityFails(alice.firestore().collection('projects').add({
                tenantId: 'tenant-2',
                name: 'Project 1'
            }), 'User created project for another tenant');
        });

        it('should deny unauthenticated user from reading projects', async () => {
            const unauthed = testEnv.unauthenticatedContext();
            await assertSecurityFails(unauthed.firestore().collection('projects').get(), 'Unauthenticated user read projects');
        });
    });

    describe('Goals, Tasks, Notes (Flattened)', () => {
        const collections = ['goals', 'tasks', 'notes'];

        collections.forEach(col => {
            describe(`${col} collection`, () => {
                it(`should allow tenant member to create ${col}`, async () => {
                    const alice = testEnv.authenticatedContext('alice', { tenantId: 'tenant-1' });
                    await assertSucceeds(alice.firestore().collection(col).add({
                        tenantId: 'tenant-1',
                        title: 'Item 1'
                    }));
                });

                it(`should deny non-tenant member from reading ${col}`, async () => {
                    await testEnv.withSecurityRulesDisabled(async (context) => {
                        await context.firestore().doc(`${col}/item-1`).set({ tenantId: 'tenant-1' });
                    });
                    const bob = testEnv.authenticatedContext('bob', { tenantId: 'tenant-2' });
                    await assertSecurityFails(bob.firestore().doc(`${col}/item-1`).get(), `Non-tenant member read ${col}`);
                });
            });
        });
    });

    describe('Users Collection', () => {
        it('should allow user to write their own document', async () => {
            const alice = testEnv.authenticatedContext('alice');
            await assertSucceeds(alice.firestore().doc('users/alice').set({ name: 'Alice' }));
        });

        it('should deny user from writing another user document', async () => {
            const alice = testEnv.authenticatedContext('alice');
            await assertSecurityFails(alice.firestore().doc('users/bob').set({ name: 'Bob' }), 'User wrote to another user profile');
        });

        it('should allow user to read their own inbox', async () => {
            const alice = testEnv.authenticatedContext('alice');
            await assertSucceeds(alice.firestore().doc('users/alice/inbox/msg1').set({ text: 'hi' }));
            await assertSucceeds(alice.firestore().doc('users/alice/inbox/msg1').get());
        });

        it('should deny user from reading another inbox', async () => {
            // Setup bob's inbox
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().doc('users/bob/inbox/msg1').set({ text: 'hi bob' });
            });
            const alice = testEnv.authenticatedContext('alice');
            await assertSecurityFails(alice.firestore().doc('users/bob/inbox/msg1').get(), 'User read another user inbox');
        });
    });

    describe('Recursive Wildcards', () => {
        // This tests the rule: match /{path=**}/tasks/{taskId} { allow read: if isAuth(); }
        // This rule seems VERY permissive (allows any authed user to read ANY task).
        // The flattened rule is stricter: allow read: if isTenantMember(...)
        // Let's see which one wins (or if they both apply). 
        // In Firestore, if ANY rule allows access, access is granted.
        // So the recursive wildcard might be a vulnerability.

        it('should allow cross-tenant reading of tasks due to recursive wildcard (VULNERABILITY CHECK)', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().doc('tasks/task-1').set({ tenantId: 'tenant-1', secret: 'data' });
            });

            // Bob is in tenant-2. He should NOT be able to read tenant-1 task.
            const bob = testEnv.authenticatedContext('bob', { tenantId: 'tenant-2' });

            // If the recursive rule exists and allows read for isAuth(), this will SUCCEED.
            // If it succeeds, it's a security hole based on our tenant isolation goals.

            // We expect this to FAIL for strict security. 
            // However, the rule explicitly says: match /{path=**}/tasks/{taskId} { allow read: if isAuth(); }
            // So currently, the rules ALLOW it. 
            // We want to detect this as a vulnerability?

            // If I assertFails, and it succeeds (because of the loose rule), it catches it.
            await assertSecurityFails(bob.firestore().doc('tasks/task-1').get(), 'Recursive wildcard allowed cross-tenant task read');
        });
    });
});
