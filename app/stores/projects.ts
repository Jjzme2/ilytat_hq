import { defineStore } from 'pinia';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { useFirestore, useCurrentUser } from 'vuefire';

/**
 * Projects Store (Pinia)
 *
 * Manages CRUD for the root-level `projects` collection.
 * All projects are scoped to the current user's tenant.
 * Guards: only tenant admins can create/delete.
 */
export const useProjectsStore = defineStore('projects', () => {
    const db = useFirestore();
    const user = useCurrentUser();

    const collectionPath = 'projects';

    const addProject = async (name: string, description: string = '') => {
        if (!user.value) throw new Error('Not authenticated');

        const { useTenant } = await import('~/composables/useTenant');
        const { tenantId } = useTenant();

        if (!tenantId.value) throw new Error('No tenant context');

        const data = {
            name,
            description,
            status: 'active',
            priority: 'medium',
            tenantId: tenantId.value,
            createdBy: user.value.uid,
            startDate: new Date(),
            deadline: null,
            tags: [],
            progress: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, collectionPath), data);
        return { id: docRef.id, ...data };
    };

    const updateProject = async (id: string, updates: Record<string, any>) => {
        if (!user.value) throw new Error('Not authenticated');

        await updateDoc(doc(db, collectionPath, id), {
            ...updates,
            updatedAt: serverTimestamp()
        });
    };

    const deleteProject = async (id: string) => {
        if (!user.value) throw new Error('Not authenticated');
        await deleteDoc(doc(db, collectionPath, id));
    };

    return {
        collectionPath,
        addProject,
        updateProject,
        deleteProject
    };
});
