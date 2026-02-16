
import { User } from '~/models/User';
import { type User as FirebaseUser, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


export const useUser = () => {
    const { auth } = useFirebase();

    // Shared state across all instances of the composable
    const user = useState<User | null>('auth-user', () => null);
    const firebaseUser = useState<FirebaseUser | null>('auth-firebase-user', () => null);
    const isLoading = useState<boolean>('auth-loading', () => true);
    const isInitialized = useState<boolean>('auth-initialized', () => false);
    const isReady = useState<boolean>('auth-is-ready', () => false);
    const readyPromise = ref<Promise<User | null> | null>(null);

    // Mock role check for now
    const isAdmin = computed(() => {
        if (!user.value) return false;
        return user.value.roles.includes('admin') ||
            user.value.roles.includes('super') ||
            user.value.email === 'admin@ilytat.com' ||
            user.value.email === 'zettler.jj@ilytat.com';
    });

    const isSuper = computed(() => {
        if (!user.value) return false;
        // Super access requires 'super' role AND 'ilytat-hq' tenant membership
        return (user.value.roles.includes('super') && user.value.tenantId === 'ilytat-hq') ||
            user.value.email === 'admin@ilytat.com' ||
            user.value.email === 'zettler.jj@ilytat.com';
    });

    const initUser = (): Promise<User | null> => {
        if (readyPromise.value) return readyPromise.value;

        readyPromise.value = new Promise((resolve) => {
            if (isInitialized.value && isReady.value) {
                resolve(user.value);
                return;
            }

            isInitialized.value = true;
            isLoading.value = true;

            auth.onAuthStateChanged(async (fUser) => {
                firebaseUser.value = fUser;
                if (fUser) {
                    try {
                        Logger.debug(`[useUser] Auth state changed: ${fUser.uid}. Fetching profile...`);
                        // Fetch user profile from Firestore
                        const db = useFirestore();
                        const userDocRef = doc(db, 'users', fUser.uid);
                        const userSnapshot = await getDoc(userDocRef);
                        const userData = userSnapshot.exists() ? userSnapshot.data() : {};

                        user.value = new User({
                            uid: fUser.uid,
                            email: fUser.email,
                            displayName: userData.displayName || fUser.displayName || 'Operator',
                            photoURL: userData.photoURL || fUser.photoURL,
                            roles: userData.roles || ['user'],
                            tenantId: userData.tenantId || null,
                            bio: userData.bio || ''
                        });
                        Logger.info(`[useUser] User profile loaded for ${fUser.email}`);
                    } catch (e) {
                        Logger.error('[useUser] Error fetching profile:', e);
                        user.value = null;
                    }
                } else {
                    Logger.debug('[useUser] Auth state changed: No user.');
                    user.value = null;
                }
                isLoading.value = false;
                isReady.value = true;
                resolve(user.value);
            });
        });

        return readyPromise.value;
    };

    // Auto-init on composable usage if client-side
    if (import.meta.client) {
        initUser();
    }

    const signIn = async (email: string, password: string) => {
        isLoading.value = true;
        Logger.info(`[useUser] Attempting sign in for ${email}`);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            if (result.user) {
                Logger.info(`[useUser] Sign in successful for ${email}`);
                firebaseUser.value = result.user;

                // Fetch user profile from Firestore
                const db = useFirestore();
                const userDocRef = doc(db, 'users', result.user.uid);
                const userSnapshot = await getDoc(userDocRef);
                const userData = userSnapshot.exists() ? userSnapshot.data() : {};

                // Immediate local update to ensure state is ready before redirect
                user.value = new User({
                    uid: result.user.uid,
                    email: result.user.email,
                    displayName: userData.displayName || result.user.displayName || 'Operator',
                    photoURL: userData.photoURL || result.user.photoURL,
                    roles: userData.roles || ['user'],
                    tenantId: userData.tenantId || null,
                    bio: userData.bio || ''
                });
            }
        } catch (e) {
            Logger.error(`[useUser] Sign in failed for ${email}`, e);
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const signOutUser = async () => {
        Logger.info('[useUser] Signing out...');
        await signOut(auth);
        user.value = null;
        firebaseUser.value = null;
        navigateTo('/login');
    };

    const resetPassword = async (email: string) => {
        if (!email) return;
        await sendPasswordResetEmail(auth, email);
    };

    const verifyEmail = async () => {
        if (firebaseUser.value) {
            await sendEmailVerification(firebaseUser.value);
        }
    };

    return {
        user,
        firebaseUser,
        isAdmin,
        isSuper,
        isLoading,
        signIn,
        signOut: signOutUser,
        resetPassword,
        verifyEmail,
        ensureUserIsReady: initUser
    };
};
