import { Note } from '~/models/Note';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
    type QueryConstraint
} from 'firebase/firestore';

export const useNotes = () => {
    const { db } = useFirebase();
    const { tenantId } = useTenant();

    const notes = ref<Note[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const fetchNotes = async (projectId: string, constraints: QueryConstraint[] = []) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) return;

            const q = query(
                collection(db, 'notes'),
                where('tenantId', '==', tenantId.value),
                where('projectId', '==', projectId),
                orderBy('createdAt', 'desc'),
                ...constraints
            );
            const snapshot = await getDocs(q);
            notes.value = snapshot.docs.map(d => new Note({ ...d.data(), id: d.id }));
            return notes.value;
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const createNote = async (projectId: string, data: Partial<Note> & { title: string }) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) throw new Error("No tenant context");

            const noteData = new Note(data).toJSON();
            delete (noteData as any).id;
            noteData.tenantId = tenantId.value;
            noteData.projectId = projectId;
            noteData.createdAt = serverTimestamp() as any;
            noteData.updatedAt = serverTimestamp() as any;

            const docRef = await addDoc(collection(db, 'notes'), noteData);
            const created = new Note({ ...noteData, id: docRef.id });
            notes.value.unshift(created);
            return created;
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const updateNote = async (projectId: string, noteId: string, updates: Partial<Note>) => {
        isLoading.value = true;
        error.value = null;
        try {
            await updateDoc(doc(db, 'notes', noteId), {
                ...updates,
                updatedAt: serverTimestamp()
            });

            const index = notes.value.findIndex(n => n.id === noteId);
            if (index !== -1 && notes.value[index]) {
                notes.value[index] = new Note({ ...notes.value[index].toJSON(), ...updates });
            }
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteNote = async (projectId: string, noteId: string) => {
        isLoading.value = true;
        error.value = null;
        try {
            await deleteDoc(doc(db, 'notes', noteId));
            notes.value = notes.value.filter(n => n.id !== noteId);
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        notes,
        isLoading,
        error,
        fetchNotes,
        createNote,
        updateNote,
        deleteNote
    };
};
