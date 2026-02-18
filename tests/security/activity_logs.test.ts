/**
 * @file tests/security/activity_logs.test.ts
 * @description Security tests for Activity Logs
 * @metaData Model: Gemini 2.0 Flash
 */

import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import * as fs from 'fs';

let testEnv: RulesTestEnvironment;
const PROJECT_ID = 'ilytat-hq-activity-logs-test';

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

describe('Activity Logs Security', () => {

    // --- WRITE Tests ---

    it('should deny user from writing logs for another user (spoofing)', async () => {
        const alice = testEnv.authenticatedContext('alice');
        // Alice tries to write a log claiming to be Bob
        // CURRENTLY: This passes because rules are too open.
        // EXPECTATION: Once fixed, this should fail.
        await assertFails(alice.firestore().collection('activity_logs').add({
            userId: 'bob',
            action: 'fake_action',
            timestamp: new Date()
        }));
    });

    it('should allow user to write logs for themselves', async () => {
        const alice = testEnv.authenticatedContext('alice');
        await assertSucceeds(alice.firestore().collection('activity_logs').add({
            userId: 'alice',
            action: 'real_action',
            timestamp: new Date()
        }));
    });

    // --- READ Tests ---

    it('should deny user from reading logs of another user', async () => {
        // Setup: Create a log for Bob
        await testEnv.withSecurityRulesDisabled(async (context) => {
             await context.firestore().collection('activity_logs').add({
                 userId: 'bob',
                 action: 'secret_action',
                 timestamp: new Date()
             });
        });

        const alice = testEnv.authenticatedContext('alice');
        // Alice tries to read Bob's logs
        const query = alice.firestore().collection('activity_logs').where('userId', '==', 'bob');

        // CURRENTLY: This passes because rules allow read: isAuth()
        // EXPECTATION: Once fixed, this should fail.
        await assertFails(query.get());
    });

    it('should allow user to read their own logs', async () => {
         // Setup: Create a log for Alice
         await testEnv.withSecurityRulesDisabled(async (context) => {
             await context.firestore().collection('activity_logs').add({
                 userId: 'alice',
                 action: 'my_action',
                 timestamp: new Date()
             });
        });

        const alice = testEnv.authenticatedContext('alice');
        const query = alice.firestore().collection('activity_logs').where('userId', '==', 'alice');
        await assertSucceeds(query.get());
    });

    it('should allow super admin to read any logs', async () => {
        // Setup: Create a log for Bob
        await testEnv.withSecurityRulesDisabled(async (context) => {
             await context.firestore().collection('activity_logs').add({
                 userId: 'bob',
                 action: 'secret_action'
             });
        });

        // Super Admin (simulated by email)
        const superAdmin = testEnv.authenticatedContext('superUser', { email: 'admin@ilytat.com' });
        const query = superAdmin.firestore().collection('activity_logs');
        await assertSucceeds(query.get());
    });
});
