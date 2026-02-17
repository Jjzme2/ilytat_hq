
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    type DocumentData,
    type QueryConstraint,
    type QueryCompositeFilterConstraint
} from 'firebase/firestore';
import { Logger } from '~/utils/Logger';
import { AppError, NetworkError, NotFoundError, PermissionError } from '~/utils/AppError';

/**
 * Generic Firestore Repository for CRUD operations.
 * Assumes models have a `toJSON()` method and take data in constructor.
 * Supports static string path or reactive ref/computed path.
 */
export const useFirestoreRepository = <T extends { id: string, toJSON: () => any }>(
    collectionOrRef: string | Ref<string | null> | ComputedRef<string | null>,
    modelFactory: (data: any) => T
) => {
    const { db } = useFirebase();

    const getCollectionName = () => {
        const path = toValue(collectionOrRef);
        if (!path) throw new AppError("Collection path is currently undefined", "CONFIG_ERROR", 500);
        return path;
    };

    const handleFirestoreError = (e: any, operation: string, context?: any) => {
        Logger.error(`[Firestore] ${operation} failed:`, e, context);

        if (e instanceof AppError) throw e;

        if (e?.code === 'permission-denied') {
            throw new PermissionError(`Permission denied for ${operation}`, context);
        }
        if (e?.code === 'unavailable' || e?.code === 'network-request-failed') {
            throw new NetworkError(`Network unreachable during ${operation}`, context);
        }

        throw new AppError(e?.message || 'Unknown Firestore Error', 'FIRESTORE_ERROR', 500, { originalError: e, ...context });
    };

    const withRetry = async <R>(fn: () => Promise<R>, retries = 3, delay = 1000): Promise<R> => {
        let lastError: any;
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (e: any) {
                lastError = e;
                if (e instanceof NetworkError || e?.code === 'unavailable') {
                    Logger.warn(`[Firestore] Retry ${i + 1}/${retries} after error:`, e.message);
                    await new Promise(r => setTimeout(r, delay * Math.pow(2, i))); // Exponential backoff
                    continue;
                }
                throw e; // Don't retry non-transient errors
            }
        }
        throw lastError;
    };

    const getAll = async (constraints: (QueryConstraint | QueryCompositeFilterConstraint)[] = []): Promise<T[]> => {
        const path = getCollectionName();
        return withRetry(async () => {
            try {
                Logger.debug(`[Firestore] getAll: ${path}`);
                const q = query(collection(db, path), ...constraints as any);
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return modelFactory({ ...data, id: doc.id });
                });
            } catch (e) {
                handleFirestoreError(e, 'getAll', { path });
                return []; // Unreachable due to throw, but typescript check
            }
        });
    };

    const getById = async (id: string): Promise<T | null> => {
        const path = getCollectionName();
        return withRetry(async () => {
            try {
                Logger.debug(`[Firestore] getById: ${path}/${id}`);
                const docRef = doc(db, path, id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return modelFactory({ ...docSnap.data(), id: docSnap.id });
                }
                return null;
            } catch (e) {
                handleFirestoreError(e, 'getById', { path, id });
                return null;
            }
        });
    };

    const create = async (item: T): Promise<T> => {
        const path = getCollectionName();
        return withRetry(async () => {
            try {
                Logger.info(`[Firestore] create: ${path}`);
                const json = item.toJSON();
                delete json.id; // Let Firestore generate ID

                const docRef = await addDoc(collection(db, path), json);
                return modelFactory({ ...json, id: docRef.id });
            } catch (e) {
                handleFirestoreError(e, 'create', { path });
                throw e;
            }
        });
    };

    const update = async (id: string, item: Partial<T>): Promise<void> => {
        const path = getCollectionName();
        return withRetry(async () => {
            try {
                Logger.info(`[Firestore] update: ${path}/${id}`);
                const docRef = doc(db, path, id);

                let dataToUpdate = item;
                if ((item as any).toJSON && typeof (item as any).toJSON === 'function') {
                    dataToUpdate = (item as any).toJSON();
                }
                delete (dataToUpdate as any).id;

                await updateDoc(docRef, dataToUpdate as DocumentData);
            } catch (e) {
                handleFirestoreError(e, 'update', { path, id });
            }
        });
    };

    const remove = async (id: string): Promise<void> => {
        const path = getCollectionName();
        return withRetry(async () => {
            try {
                Logger.info(`[Firestore] remove: ${path}/${id}`);
                await deleteDoc(doc(db, path, id));
            } catch (e) {
                handleFirestoreError(e, 'remove', { path, id });
            }
        });
    };

    const getDocRef = (id: string) => {
        const path = getCollectionName();
        return doc(db, path, id);
    }

    return {
        getAll,
        getById,
        create,
        update,
        remove,
        getDocRef
    };
};
