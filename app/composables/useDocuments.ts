import { Document as DocumentModel } from '~/models/Document';
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
import { useFirestore } from 'vuefire';
import { useUser } from './useUser';
import { useTenant } from './useTenant';
export interface R2File {
    key: string;
    size: number;
    lastModified: string;
}

export const useDocuments = () => {
    const {
        getById,
        create,
        update,
        remove
    } = useFirestoreRepository<DocumentModel>('documents', (data) => new DocumentModel(data));

    const db = useFirestore();
    const { user } = useUser();
    const { tenantId } = useTenant();

    const documents = ref<DocumentModel[]>([]);
    const currentDocument = ref<DocumentModel | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // R2-backed document listing
    const r2Files = ref<R2File[]>([]);
    const isLoadingR2 = ref(false);
    const r2Error = ref<string | null>(null);

    const fetchDocuments = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!user.value) {
                documents.value = [];
                return;
            }

            const docsRef = collection(db, 'documents');
            const promises = [];

            // 1. Personal Documents (Owner)
            const personalQuery = query(
                docsRef,
                where('ownerId', '==', user.value.uid)
            );
            promises.push(getDocs(personalQuery));

            // 2. Tenant Public Documents (if tenant exists)
            if (tenantId.value) {
                const tenantQuery = query(
                    docsRef,
                    where('tenantId', '==', tenantId.value),
                    where('access', '==', 'public')
                );
                promises.push(getDocs(tenantQuery));
            }

            const snapshots = await Promise.all(promises);
            const docMap = new Map<string, DocumentModel>();

            snapshots.forEach(snap => {
                snap.docs.forEach(docSnap => {
                    const data = docSnap.data();
                    data.id = docSnap.id;
                    // Provide a default for required fields if missing in raw data, though Model expects fully shaped data
                    // DocumentModel constructor should handle it.
                    docMap.set(docSnap.id, new DocumentModel(data));
                });
            });

            documents.value = Array.from(docMap.values());

        } catch (e: any) {
            Logger.error('Failed to fetch documents', e);
            error.value = e.message;
        } finally {
            isLoading.value = false;
        }
    };

    // Fetch documents for a specific project
    const fetchDocumentsByProject = async (projectId: string) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!user.value) {
                documents.value = [];
                return;
            }

            const docsRef = collection(db, 'documents');
            const promises = [];

            // 1. Personal Project Documents
            const personalQuery = query(
                docsRef,
                where('ownerId', '==', user.value.uid),
                where('projectId', '==', projectId)
            );
            promises.push(getDocs(personalQuery));

            // 2. Tenant Public Project Documents
            if (tenantId.value) {
                const tenantQuery = query(
                    docsRef,
                    where('tenantId', '==', tenantId.value),
                    where('projectId', '==', projectId),
                    where('access', '==', 'public')
                );
                promises.push(getDocs(tenantQuery));
            }

            const snapshots = await Promise.all(promises);
            const docMap = new Map<string, DocumentModel>();

            snapshots.forEach(snap => {
                snap.docs.forEach(docSnap => {
                    const data = docSnap.data();
                    data.id = docSnap.id;
                    docMap.set(docSnap.id, new DocumentModel(data));
                });
            });

            documents.value = Array.from(docMap.values());
        } catch (e: any) {
            Logger.error('Failed to fetch project documents', e);
            error.value = e.message;
        } finally {
            isLoading.value = false;
        }
    }

    const fetchDocumentById = async (id: string) => {
        isLoading.value = true;
        error.value = null;
        try {
            currentDocument.value = await getById(id);
        } catch (e: any) {
            error.value = e.message;
        } finally {
            isLoading.value = false;
        }
    };

    const createDocument = async (data: Partial<DocumentModel> & { title: string }) => {
        isLoading.value = true;
        error.value = null;
        try {
            // In strict mode, we might need tenantId if the document belongs to a tenant.
            // foundry/index.vue sets ownerId.
            // If the user wants documents to be tenant-scoped, we should add tenantId here.
            // Document model has tenantId | null.
            const { tenantId } = useTenant(); // Get tenantId here inside the function if possible, or assume it's available

            const rawData = {
                ...data,
                tenantId: tenantId.value || null,
                // Default timestamps
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Validate
            const docModel = new DocumentModel(rawData);

            // To support serverTimestamp, we would ideally pass it here. 
            // But useFirestoreRepository expects Model instance T. 
            // T.toJSON() returns Date. 
            // We rely on client-side timestamp for now to satisfy types, or cast.
            // Actually, if we want serverTimestamp, we need to override toJSON or something.
            // For now, let's just pass the model. Repository calls toJSON().

            const newDoc = await create(docModel);
            documents.value.push(newDoc);
            return newDoc;
        } catch (e: any) {
            Logger.error('Failed to create document', e);
            error.value = e.message;
            throw new AppError(e.message, 'DOCUMENT_CREATE_ERROR', e);
        } finally {
            isLoading.value = false;
        }
    };

    const updateDocument = async (id: string, updates: Partial<DocumentModel>) => {
        isLoading.value = true;
        error.value = null;
        try {
            await update(id, { ...updates, updatedAt: serverTimestamp() } as any);

            const index = documents.value.findIndex(d => d.id === id);
            if (index !== -1 && documents.value[index]) {
                const existingData = documents.value[index].toJSON();
                // Merge updates.
                const merged = { ...existingData, ...updates, updatedAt: new Date() };
                documents.value[index] = new DocumentModel(merged);
            }

            if (currentDocument.value && currentDocument.value.id === id) {
                const existingCurrentData = currentDocument.value.toJSON();
                const merged = { ...existingCurrentData, ...updates, updatedAt: new Date() };
                currentDocument.value = new DocumentModel(merged);
            }

        } catch (e: any) {
            Logger.error('Failed to update document', e);
            error.value = e.message;
            throw new AppError(e.message, 'DOCUMENT_UPDATE_ERROR', e);
        } finally {
            isLoading.value = false;
        }
    };

    const deleteDocument = async (id: string) => {
        isLoading.value = true;
        error.value = null;
        try {
            await remove(id);
            documents.value = documents.value.filter(d => d.id !== id);
            if (currentDocument.value && currentDocument.value.id === id) {
                currentDocument.value = null;
            }
        } catch (e: any) {
            Logger.error('Failed to delete document', e);
            error.value = e.message;
            throw new AppError(e.message, 'DOCUMENT_DELETE_ERROR', e);
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Fetch the list of files from the Cloudflare R2 'docs' bucket.
     * Uses the server-side /api/docs route so credentials stay on the server.
     */
    const fetchR2Documents = async (prefix?: string) => {
        isLoadingR2.value = true;
        r2Error.value = null;
        try {
            const params = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
            const data = await $fetch<{ files: R2File[]; count: number }>(`/api/docs${params}`);
            r2Files.value = data.files;
        } catch (e: any) {
            r2Error.value = e.data?.message || e.message || 'Failed to fetch R2 documents';
        } finally {
            isLoadingR2.value = false;
        }
    };

    /**
     * Upload a file to Cloudflare R2 via the server-side /api/docs endpoint.
     * Returns the key and metadata of the uploaded file.
     */
    const uploadR2Document = async (file: File, key?: string) => {
        isLoadingR2.value = true;
        r2Error.value = null;
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (key) {
                formData.append('key', key);
            }

            const result = await $fetch<{ success: boolean; key: string; size: number; contentType: string }>('/api/docs', {
                method: 'POST',
                body: formData
            });

            // Refresh the file list after upload
            await fetchR2Documents();
            return result;
        } catch (e: any) {
            r2Error.value = e.data?.message || e.message || 'Failed to upload file';
            throw e;
        } finally {
            isLoadingR2.value = false;
        }
    };

    /**
     * Delete a file from Cloudflare R2 via the server-side /api/docs endpoint.
     */
    const deleteR2Document = async (key: string) => {
        isLoadingR2.value = true;
        r2Error.value = null;
        try {
            await $fetch(`/api/docs?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
            r2Files.value = r2Files.value.filter(f => f.key !== key);
        } catch (e: any) {
            r2Error.value = e.data?.message || e.message || 'Failed to delete file';
            throw e;
        } finally {
            isLoadingR2.value = false;
        }
    };

    return {
        // Firestore documents
        documents,
        currentDocument,
        isLoading,
        error,
        fetchDocuments,
        fetchDocumentsByProject,
        fetchDocumentById,
        createDocument,
        updateDocument,
        deleteDocument,
        // R2 bucket documents
        r2Files,
        isLoadingR2,
        r2Error,
        fetchR2Documents,
        uploadR2Document,
        deleteR2Document
    };
};

