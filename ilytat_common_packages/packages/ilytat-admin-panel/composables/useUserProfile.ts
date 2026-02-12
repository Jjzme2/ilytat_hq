import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useCurrentUser, useFirestore } from 'vuefire'

import { type UserProfile } from '~/types'

export const useUserProfile = () => {
    const user = useCurrentUser()
    const db = useFirestore()
    const profile = ref<UserProfile | null>(null)
    const loading = ref(false)
    const initialized = ref(false)

    /**
     * Initialize user profile on first login.
     * Creates the user document if it doesn't exist.
     */
    const initializeUserProfile = async () => {
        if (!user.value) return null

        loading.value = true

        try {
            const userRef = doc(db, 'users', user.value.uid)
            const userSnap = await getDoc(userRef)

            if (userSnap.exists()) {
                profile.value = userSnap.data() as UserProfile
            } else {
                // Create new user profile
                const newProfile: UserProfile = {
                    uid: user.value.uid,
                    email: user.value.email,
                    displayName: user.value.displayName || user.value.email?.split('@')[0] || 'User',
                    photoURL: user.value.photoURL,
                    role: 'member',
                    createdAt: serverTimestamp()
                }

                await setDoc(userRef, newProfile)
                profile.value = newProfile
            }

            initialized.value = true
            return profile.value
        } catch (e) {
            console.error('Failed to initialize user profile:', e)
            return null
        } finally {
            loading.value = false
        }
    }

    /**
     * Update user profile data
     */
    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!user.value) return

        const userRef = doc(db, 'users', user.value.uid)
        await setDoc(userRef, data, { merge: true })

        if (profile.value) {
            profile.value = { ...profile.value, ...data }
        }
    }

    /**
     * Helper to check roles
     */
    const hasRole = (role: 'admin' | 'member' | 'viewer') => {
        if (!profile.value) return false
        // Check new roles array OR legacy role field
        return profile.value.roles?.includes(role) || profile.value.role === role
    }

    /**
     * Check if user is admin
     */
    const isAdmin = computed(() => {
        const email = user.value?.email?.trim().toLowerCase()
        const uid = user.value?.uid

        // Hardcoded admin emails and UIDs for safety/fallback
        if (email === 'zettler.jj@ilytat.com' || email === 'jj@ilytat.com') return true
        if (uid === 'BoHGcwh2ApNQiJJIgjZWBC9hY8I3') return true

        return hasRole('admin')
    })

    return {
        profile,
        loading,
        initialized,
        initializeUserProfile,
        updateProfile,
        hasRole,
        isAdmin
    }
}
