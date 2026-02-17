import { ref, computed, watch, reactive } from 'vue'
import { useStorage } from '@vueuse/core'
import type { IlytatTheme } from '../types'
import { themes as presetThemes } from '../themes'
import { useUser } from '#imports'
import { useFirestore } from 'vuefire'
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'

// --- Singleton State ---
// These are created once when the module is imported
const currentThemeId = useStorage('ilytat-theme-id', 'luxury-midnight-silk')
const favoriteThemeId = useStorage('ilytat-theme-fav', 'luxury-rose-gold')
const customThemes = useStorage<IlytatTheme[]>('ilytat-custom-themes', [])
const isInitialized = ref(false)

// We need a way to access the user and db globally or initialize it once "lazily"
// But standard composable pattern suggests we might need to trigger the init logic 
// from within a component context (to get nuxt/vuefire context).
// However, the state itself should be shared.

let unsubscribeSnapshot: (() => void) | null = null
let unsubscribeUserTheme: (() => void) | null = null

export const useIlytatTheme = () => {
    // Firestore Integration
    // We instantiate these hooks inside the composable because they rely on injection context
    const { user } = useUser()
    const db = useFirestore()

    // Initialize the singleton listener only once
    // We watch the user from ANY instance, but we only want one listener.
    // The issue is `user` is reactive passed from `useUser`. 
    // If we have multiple `useIlytatTheme` calls, we have multiple watchers.

    // Better pattern: dedicated init function or check if listener is active.

    // Let's use a module-level watcher setup flag?
    if (!isInitialized.value && typeof window !== 'undefined') {
        isInitialized.value = true

        // We need to set up the watcher that persists across component mounts?
        // Actually, `useUser` returns a Ref. We can watch that Ref. 
        // But `useUser` might return different refs if called multiple times? 
        // `useUser` uses `useState`, so the underlying state is shared.

        watch(() => user.value?.uid, (uid) => {
            // Cleanup previous listeners if any
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot()
                unsubscribeSnapshot = null
            }
            if (unsubscribeUserTheme) {
                unsubscribeUserTheme()
                unsubscribeUserTheme = null
            }

            if (uid) {
                // 1. Sync Custom Themes
                console.log('UseIlytatTheme: Subscribing to themes for user:', uid)
                const themesRef = collection(db, `users/${uid}/themes`)
                unsubscribeSnapshot = onSnapshot(themesRef, (snapshot) => {
                    const fsThemes: IlytatTheme[] = []
                    snapshot.forEach((doc) => {
                        fsThemes.push(doc.data() as IlytatTheme)
                    })

                    if (fsThemes.length > 0) {
                        customThemes.value = fsThemes
                    }
                }, (error) => {
                    // Handle permission denied gracefully
                    console.error("Theme sync error:", error.message)
                })

                // 2. Sync Active Theme Preference
                const userRef = doc(db, `users/${uid}`)
                unsubscribeUserTheme = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data()
                        if (data.theme && data.theme !== currentThemeId.value) {
                            console.log('UseIlytatTheme: Synced theme from Firestore:', data.theme)
                            // Update local state without triggering another write if possible
                            // But applyTheme does side effects (CSS vars), so we should call it.
                            // We just need to make sure applyTheme doesn't create an infinite loop.
                            // The check `data.theme !== currentThemeId.value` helps.

                            // However, we want to apply it visually:
                            const theme = allThemes.value.find(t => t.id === data.theme)
                            if (theme) {
                                currentThemeId.value = theme.id
                                applyRootStyles(theme)
                            }
                        }

                        // Sync Favorite Theme
                        if (data.favoriteTheme && data.favoriteTheme !== favoriteThemeId.value) {
                            favoriteThemeId.value = data.favoriteTheme
                        }
                    }
                }, (error) => {
                    console.error("User theme sync error:", error.message)
                })
            }
        }, { immediate: true })
    }


    // Combine all themes
    const allThemes = computed(() => {
        return [...presetThemes, ...customThemes.value]
    })

    const currentTheme = computed(() => {
        return allThemes.value.find(t => t.id === currentThemeId.value) ?? presetThemes[0] ?? {
            id: 'fallback',
            name: 'Fallback',
            category: 'minimal',
            isDark: false,
            colors: {} as any
        }
    })

    // Computed helper for dark mode status based on the selected theme's property
    const isDark = computed(() => currentTheme.value.isDark)

    function applyRootStyles(theme: IlytatTheme) {
        if (typeof document !== 'undefined') {
            const root = document.documentElement

            // Handle dark class for Tailwind
            if (theme.isDark) {
                root.classList.add('dark')
            } else {
                root.classList.remove('dark')
            }

            // Set all CSS variables
            Object.entries(theme.colors).forEach(([key, value]) => {
                root.style.setProperty(key, value)
            })
        }
    }

    function applyTheme(themeId: string) {
        const theme = allThemes.value.find(t => t.id === themeId)
        if (!theme) {
            console.warn(`Theme ${themeId} not found`)
            return
        }

        currentThemeId.value = theme.id
        applyRootStyles(theme)

        // Sync to Firestore if logged in
        if (user.value?.uid) {
            const userRef = doc(db, `users/${user.value.uid}`)
            // We use setDoc with merge to avoid overwriting other user fields if we only want to update theme
            // Or updateDoc if we know the doc exists. `useUser` usually ensures profile exists?
            // Safest is setDoc with merge: true
            setDoc(userRef, { theme: theme.id }, { merge: true }).catch(err => {
                console.error('Failed to save theme preference', err)
            })
        }
    }

    function setFavorite(themeId: string) {
        favoriteThemeId.value = themeId

        if (user.value?.uid) {
            const userRef = doc(db, `users/${user.value.uid}`)
            setDoc(userRef, { favoriteTheme: themeId }, { merge: true }).catch(err => {
                console.error('Failed to save favorite theme', err)
            })
        }
    }

    function applyFavorite() {
        applyTheme(favoriteThemeId.value)
    }

    function toggleTheme() {
        if (isDark.value) {
            applyTheme('luxury-platinum')
        } else {
            applyTheme('luxury-midnight-silk')
        }
    }

    async function saveTheme(theme: IlytatTheme) {
        // Optimistically update local
        const index = customThemes.value.findIndex(t => t.id === theme.id)
        if (index >= 0) {
            customThemes.value[index] = theme
        } else {
            customThemes.value.push(theme)
        }

        // Sync to Firestore if logged in
        if (user.value?.uid) {
            try {
                const themeDoc = doc(db, `users/${user.value.uid}/themes`, theme.id)
                await setDoc(themeDoc, theme)
            } catch (e) {
                console.error('Failed to sync theme to Firestore', e)
            }
        }
    }

    async function deleteTheme(themeId: string) {
        // Optimistically delete local
        customThemes.value = customThemes.value.filter(t => t.id !== themeId)

        // If deleted current, revert to default
        if (currentThemeId.value === themeId) {
            applyTheme('minimal-light')
        }

        // Sync delete to Firestore if logged in
        if (user.value?.uid) {
            try {
                const themeDoc = doc(db, `users/${user.value.uid}/themes`, themeId)
                await deleteDoc(themeDoc)
            } catch (e) {
                console.error('Failed to delete theme from Firestore', e)
            }
        }
    }

    // Initialize (call this in app.vue or a plugin)
    function initTheme() {
        applyTheme(currentThemeId.value)
    }

    return {
        currentTheme,
        currentThemeId,
        isDark,
        allThemes,
        customThemes,
        applyTheme,
        saveTheme,
        deleteTheme,
        initTheme,
        toggleTheme,
        setFavorite,
        applyFavorite,
        favoriteThemeId
    }
}
