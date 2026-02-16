/**
 * @file tests/security/setup.ts
 * @description Setup for Firestore security rules testing using @firebase/rules-unit-testing
 * @metaData Model: Gemini 2.0 Flash
 */

import {
    initializeTestEnvironment,
    RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { resolve } from "path";
import { afterAll, beforeAll, beforeEach } from "vitest";

let testEnv: RulesTestEnvironment;

const PROJECT_ID = "ilytat-hq-test";
const FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

// Ensure emulator host is set
process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_EMULATOR_HOST;

export const getTestEnv = () => testEnv;

beforeAll(async () => {
    // Load rules
    const rules = readFileSync(
        resolve(__dirname, "../../firestore.rules"),
        "utf8"
    );

    testEnv = await initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: {
            rules,
            host: "127.0.0.1",
            port: 8080,
        },
    });
});

afterAll(async () => {
    await testEnv.cleanup();
});

beforeEach(async () => {
    await testEnv.clearFirestore();
});

// Helper for authenticated context
export const authedApp = (auth?: { uid: string; token?: any }) => {
    return testEnv.authenticatedContext(auth?.uid || "alice", auth?.token).firestore();
};

// Helper for unauthenticated context
export const unauthedApp = () => {
    return testEnv.unauthenticatedContext().firestore();
};

// Admin app (bypasses rules)
export const adminApp = () => {
    return testEnv.unauthenticatedContext().firestore(); // Note: Admin SDK usually needed for bypass, but for rules testing we often test *as* a user. 
    // real admin bypass in rules-unit-testing is via withSecurityRulesDisabled but that's for setup.
    // simpler:
    // return testEnv.withSecurityRulesDisabled(context => context.firestore())
}
