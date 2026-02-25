import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
} from 'firebase/firestore';

/**
 * QuickLaunchLink — A user-defined external URL for fast access.
 * Stored as a root collection: `quicklinks`
 */
export interface QuickLaunchLink {
    id: string;
    label: string;
    url: string;
    projectId: string;
    createdAt: Date;
}

export const useQuickLaunchLinks = () => {
    const { db } = useFirebase();
    const links = ref<QuickLaunchLink[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const fetchLinks = async (projectId: string) => {
        isLoading.value = true;
        error.value = null;
        try {

            const q = query(
                collection(db, 'quicklinks'),
                where('projectId', '==', projectId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            links.value = snapshot.docs.map(d => ({
                id: d.id,
                label: d.data().label || '',
                url: d.data().url || '',
                projectId: d.data().projectId || '',
                createdAt: d.data().createdAt?.toDate?.() || new Date()
            }));
            return links.value;
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const createLink = async (projectId: string, data: { label: string; url: string }) => {
        isLoading.value = true;
        error.value = null;
        try {

            const docRef = await addDoc(collection(db, 'quicklinks'), {
                label: data.label,
                url: data.url,
                projectId,
                createdAt: serverTimestamp()
            });

            const newLink: QuickLaunchLink = {
                id: docRef.id,
                label: data.label,
                url: data.url,
                projectId,
                createdAt: new Date()
            };
            links.value.unshift(newLink);
            return newLink;
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteLink = async (projectId: string, linkId: string) => {
        isLoading.value = true;
        error.value = null;
        try {
            await deleteDoc(doc(db, 'quicklinks', linkId));
            links.value = links.value.filter(l => l.id !== linkId);
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        links,
        isLoading,
        error,
        fetchLinks,
        createLink,
        deleteLink
    };
};
