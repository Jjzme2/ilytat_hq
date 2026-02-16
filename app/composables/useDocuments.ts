
import { Document } from '~/models/Document';
import { where } from 'firebase/firestore';
import { useTenant } from './useTenant';

/** Shape of a file entry returned by GET /api/docs */
export interface R2File {
    key: string;
    size: number;
    lastModified: string;
}

export const useDocuments = () => {
    const {
        getAll,
        getById,
        create,
        update,
        remove
    } = useFirestoreRepository<Document>('documents', (data) => new Document(data));

    const { tenantId } = useTenant();
    const documents = ref<Document[]>([]);
    const currentDocument = ref<Document | null>(null);
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
            if (!tenantId.value) {
                documents.value = [];
                return;
            }
            // OPTIMIZATION: Filter by tenantId to prevent loading all documents
            documents.value = await getAll([where('tenantId', '==', tenantId.value)]);
        } catch (e: any) {
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
            if (!tenantId.value) {
                documents.value = [];
                return;
            }
            // OPTIMIZATION: Use Firestore query instead of client-side filtering
            documents.value = await getAll([
                where('tenantId', '==', tenantId.value),
                where('projectId', '==', projectId)
            ]);
        } catch (e: any) {
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

    const createDocument = async (doc: Document) => {
        isLoading.value = true;
        error.value = null;
        try {
            if (!tenantId.value) throw new Error("No tenant context");
            doc.tenantId = tenantId.value;

            const newDoc = await create(doc);
            documents.value.push(newDoc);
            return newDoc;
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const updateDocument = async (id: string, updates: Partial<Document>) => {
        isLoading.value = true;
        error.value = null;
        try {
            await update(id, { ...updates, updatedAt: new Date() });

            const index = documents.value.findIndex(d => d.id === id);
            if (index !== -1 && documents.value[index]) {
                const existingData = documents.value[index].toJSON();
                documents.value[index] = new Document({ ...existingData, ...updates });
            }

            if (currentDocument.value && currentDocument.value.id === id) {
                const existingCurrentData = currentDocument.value.toJSON();
                currentDocument.value = new Document({ ...existingCurrentData, ...updates });
            }

        } catch (e: any) {
            error.value = e.message;
            throw e;
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
            error.value = e.message;
            throw e;
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
            const token = await user.value?.getIdToken();
            const headers: Record<string, string> = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const params = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
            const data = await $fetch<{ files: R2File[]; count: number }>(`/api/docs${params}`, {
                headers
            });
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
            const token = await user.value?.getIdToken();
            const headers: Record<string, string> = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const formData = new FormData();
            formData.append('file', file);
            if (key) {
                formData.append('key', key);
            }

            const result = await $fetch<{ success: boolean; key: string; size: number; contentType: string }>('/api/docs', {
                method: 'POST',
                body: formData,
                headers
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
            const token = await user.value?.getIdToken();
            const headers: Record<string, string> = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            await $fetch(`/api/docs?key=${encodeURIComponent(key)}`, {
                method: 'DELETE',
                headers
            });
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

