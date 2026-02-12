import { Project } from '../app/models/Project';
import { ProjectSchema } from '../app/schemas/ProjectSchema';

console.log('--- Testing Project Zod Validation ---');

try {
    console.log('Test 1: Valid Project');
    const validProject = new Project({
        name: 'Zod Project',
        tenantId: 'ilytat-hq',
        members: ['user1']
    });
    console.log('✅ Valid Project created:', validProject.name);
} catch (e: any) {
    console.error('❌ Test 1 Failed:', e.issues || e.message);
}

try {
    console.log('\nTest 2: Invalid Project (Missing Name)');
    const invalidProject = new Project({
        tenantId: 'ilytat-hq'
    });
    console.log('❌ Test 2 Failed (Should have thrown error)');
} catch (e: any) {
    console.log('✅ Test 2 Passed: Caught expected error:', e.issues?.[0]?.message || e.message);
}

try {
    console.log('\nTest 3: Invalid Project (Missing TenantId)');
    const invalidProject = new Project({
        name: 'No Tenant'
    });
    console.log('❌ Test 3 Failed (Should have thrown error)');
} catch (e: any) {
    console.log('✅ Test 3 Passed: Caught expected error:', e.issues?.[0]?.message || e.message);
}

console.log('\n--- Test Complete ---');
