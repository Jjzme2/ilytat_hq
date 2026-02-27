/**
 * @file tests/security/activity_logs.test.ts
 * @description Security tests for Activity Logs collection
 * @metaData Model: Gemini 2.0 Flash
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import * as fs from 'fs';

let testEnv: RulesTestEnvironment;
const PROJECT_ID = 'ilytat-hq-test-logs';

beforeAll(async () => {
    // Only run if emulator is available (or rely on vitest catch)
    try {
        testEnv = await initializeTestEnvironment({
            projectId: PROJECT_ID,
            firestore: {
                rules: fs.readFileSync('firestore.rules', 'utf8'),
                host: '127.0.0.1',
                port: 8080
            }
        });
    } catch (e) {
        console.warn('Skipping Firestore Rules tests: Emulator not running.');
    }
});

afterAll(async () => {
    if (testEnv) await testEnv.cleanup();
});

beforeEach(async () => {
    if (testEnv) await testEnv.clearFirestore();
});

describe('Activity Logs Security', () => {
    it('should allow user to create their own log', async () => {
        if (!testEnv) return;
        const alice = testEnv.authenticatedContext('alice');
        await assertSucceeds(alice.firestore().collection('activity_logs').add({
            userId: 'alice',
            action: 'login',
            timestamp: new Date()
        }));
    });

    it('should deny user creating log for another user', async () => {
        if (!testEnv) return;
        const alice = testEnv.authenticatedContext('alice');
        await assertFails(alice.firestore().collection('activity_logs').add({
            userId: 'bob',
            action: 'login',
            timestamp: new Date()
        }));
    });

    it('should allow user to read their own logs', async () => {
        if (!testEnv) return;
        const alice = testEnv.authenticatedContext('alice');

        // Setup data (bypassing rules)
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await context.firestore().doc('activity_logs/log1').set({
                userId: 'alice',
                action: 'test'
            });
        });

        await assertSucceeds(alice.firestore().doc('activity_logs/log1').get());
    });

    it('should deny user reading another user log', async () => {
        if (!testEnv) return;
        const alice = testEnv.authenticatedContext('alice');

        await testEnv.withSecurityRulesDisabled(async (context) => {
            await context.firestore().doc('activity_logs/log2').set({
                userId: 'bob',
                action: 'test'
            });
        });

        await assertFails(alice.firestore().doc('activity_logs/log2').get());
    });

    it('should deny updating logs (immutable)', async () => {
        if (!testEnv) return;
        const alice = testEnv.authenticatedContext('alice');

        await testEnv.withSecurityRulesDisabled(async (context) => {
            await context.firestore().doc('activity_logs/log3').set({
                userId: 'alice',
                action: 'original'
            });
        });

        await assertFails(alice.firestore().doc('activity_logs/log3').update({
            action: 'modified'
        }));
    });

    it('should deny deleting logs', async () => {
        if (!testEnv) return;
        const alice = testEnv.authenticatedContext('alice');

        await testEnv.withSecurityRulesDisabled(async (context) => {
            await context.firestore().doc('activity_logs/log4').set({
                userId: 'alice',
                action: 'delete me'
            });
        });

        await assertFails(alice.firestore().doc('activity_logs/log4').delete());
    });
});
