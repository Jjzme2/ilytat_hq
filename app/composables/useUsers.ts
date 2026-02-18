
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useFirestore } from 'vuefire';
import { User } from '~/models/User';
import { Logger } from '~/utils/Logger';

export const useUsers = () => {
    const db = useFirestore();

    const findUserByIdentifier = async (identifier: string): Promise<User | null> => {
        if (!identifier || !identifier.trim()) return null;

        const term = identifier.trim();
        Logger.debug(`[useUsers] Searching for user by identifier: ${term}`);

        // 1. Try Email
        if (term.includes('@')) {
            const q = query(collection(db, 'users'), where('email', '==', term), limit(1));
            const snap = await getDocs(q);
            const firstDoc = snap.docs[0];
            if (firstDoc) {
                return new User({ ...firstDoc.data(), uid: firstDoc.id });
            }
        }

        // 2. Try globalId (numeric)
        const globalId = parseInt(term, 10);
        if (!isNaN(globalId) && globalId.toString() === term) {
            const q = query(collection(db, 'users'), where('employeeId', '==', globalId), limit(1));
            const snap = await getDocs(q);
            const firstDoc = snap.docs[0];
            if (firstDoc) {
                return new User({ ...firstDoc.data(), uid: firstDoc.id });
            }
        }

        // 3. Try Username
        const q = query(collection(db, 'users'), where('username', '==', term), limit(1));
        const snap = await getDocs(q);
        const firstDoc = snap.docs[0];
        if (firstDoc) {
            return new User({ ...firstDoc.data(), uid: firstDoc.id });
        }

        Logger.warn(`[useUsers] No user found for identifier: ${term}`);
        return null;
    };

    return {
        findUserByIdentifier
    };
};
