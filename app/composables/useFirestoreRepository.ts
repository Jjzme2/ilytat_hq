
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    type DocumentData,
    type QueryConstraint
} from 'firebase/firestore';

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
        if (!path) throw new Error("Collection path is currently undefined (waiting for parent context?)");
        return path;
    };

    const getAll = async (constraints: QueryConstraint[] = []): Promise<T[]> => {
        try {
            const path = getCollectionName();
            Logger.debug(`[Firestore] getAll: ${path} (constraints: ${constraints.length})`);
            const q = query(collection(db, path), ...constraints);
            const querySnapshot = await getDocs(q);
            Logger.debug(`[Firestore] getAll: ${path} returned ${querySnapshot.size} docs`);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return modelFactory({ ...data, id: doc.id });
            });
        } catch (e) {
            Logger.error(`[Firestore] Error fetching ${toValue(collectionOrRef)}:`, e);
            throw e;
        }
    };

    const getById = async (id: string): Promise<T | null> => {
        try {
            const path = getCollectionName();
            Logger.debug(`[Firestore] getById: ${path}/${id}`);
            const docRef = doc(db, path, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return modelFactory({ ...docSnap.data(), id: docSnap.id });
            }
            Logger.debug(`[Firestore] getById: ${path}/${id} - Not Found`);
            return null;
        } catch (e) {
            Logger.error(`[Firestore] Error fetching ${toValue(collectionOrRef)} by ID (${id}):`, e);
            throw e;
        }
    };

    const create = async (item: T): Promise<T> => {
        try {
            const path = getCollectionName();
            Logger.info(`[Firestore] create: ${path}`);
            const json = item.toJSON();
            // Remove id if it exists in JSON to let Firestore generate it
            delete json.id;

            const docRef = await addDoc(collection(db, path), json);
            Logger.info(`[Firestore] create: ${path}/${docRef.id} success`);
            return modelFactory({ ...json, id: docRef.id });
        } catch (e) {
            Logger.error(`[Firestore] Error creating ${toValue(collectionOrRef)}:`, e);
            throw e;
        }
    };

    const update = async (id: string, item: Partial<T>): Promise<void> => {
        try {
            const path = getCollectionName();
            Logger.info(`[Firestore] update: ${path}/${id}`);
            const docRef = doc(db, path, id);

            let dataToUpdate = item;
            if ((item as any).toJSON && typeof (item as any).toJSON === 'function') {
                dataToUpdate = (item as any).toJSON();
            }

            // Remove id from payload
            delete (dataToUpdate as any).id;

            await updateDoc(docRef, dataToUpdate as DocumentData);
            Logger.info(`[Firestore] update: ${path}/${id} success`);
        } catch (e) {
            Logger.error(`[Firestore] Error updating ${toValue(collectionOrRef)} (${id}):`, e);
            throw e;
        }
    };

    const remove = async (id: string): Promise<void> => {
        try {
            const path = getCollectionName();
            Logger.info(`[Firestore] remove: ${path}/${id}`);
            await deleteDoc(doc(db, path, id));
            Logger.info(`[Firestore] remove: ${path}/${id} success`);
        } catch (e) {
            Logger.error(`[Firestore] Error deleting ${toValue(collectionOrRef)} (${id}):`, e);
            throw e;
        }
    };

    // Helper to get doc reference
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
