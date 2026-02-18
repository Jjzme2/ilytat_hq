import { getFirestore } from 'firebase-admin/firestore';
import { ensureAdminInitialized } from './adminAuth';

// Ensure the app is initialized before getting Firestore
const app = ensureAdminInitialized();

export const firestore = getFirestore(app);
