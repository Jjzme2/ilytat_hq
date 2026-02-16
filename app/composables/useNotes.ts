import { Note } from '~/models/Note';
import { AppError } from '~/utils/AppError';
import { Logger } from '~/utils/Logger';
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
    const { db, auth } = useFirebase();
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
            Logger.error('Failed to fetch notes', e);
            error.value = e.message;
            throw new AppError(e.message, 'NOTE_FETCH_ERROR', e);
        } finally {
            isLoading.value = false;
        }
    };

    const createNote = async (projectId: string, data: Partial<Note> & { title: string }) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) throw new Error("No tenant context");

            const currentUser = auth?.currentUser;

            const rawData = {
                ...data,
                tenantId: tenantId.value,
                projectId: projectId,
                createdBy: currentUser?.uid || 'system',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const noteModel = new Note(rawData);
            const noteData = noteModel.toJSON();
            delete (noteData as any).id;
            (noteData as any).createdAt = serverTimestamp();
            (noteData as any).updatedAt = serverTimestamp();

            const docRef = await addDoc(collection(db, 'notes'), noteData);
            const created = new Note({ ...noteData, id: docRef.id, createdAt: new Date(), updatedAt: new Date() });
            notes.value.unshift(created);
            return created;
        } catch (e: any) {
            Logger.error('Failed to create note', e);
            error.value = e.message;
            throw new AppError(e.message, 'NOTE_CREATE_ERROR', e);
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
                const updatedData = { ...notes.value[index].toJSON(), ...updates, updatedAt: new Date() };
                notes.value[index] = new Note(updatedData);
            }
        } catch (e: any) {
            Logger.error('Failed to update note', e);
            error.value = e.message;
            throw new AppError(e.message, 'NOTE_UPDATE_ERROR', e);
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
            Logger.error('Failed to delete note', e);
            error.value = e.message;
            throw new AppError(e.message, 'NOTE_DELETE_ERROR', e);
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
