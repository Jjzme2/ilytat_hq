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

// Moved from composable to module level to avoid initialization order issues
// and ensure these "singletons" are truly shared across all instances
const allThemes = computed(() => {
    return [...presetThemes, ...customThemes.value]
})

const currentTheme = computed(() => {
    const theme = allThemes.value.find(t => t.id === currentThemeId.value)
    if (theme) return theme

    // If not found, fallback to first preset or a safe minimal object
    return presetThemes[0] || ({
        id: 'fallback',
        name: 'Fallback',
        category: 'minimal' as const,
        isDark: false,
        colors: {} as any
    } as IlytatTheme)
})

// Computed helper for dark mode status
const isDark = computed(() => currentTheme.value.isDark)

/**
 * Applies theme CSS variables to the document root
 */
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
        const colors = theme.colors || {}

        // Default values for common system variables to prevent stale/missing styles
        const defaults: Record<string, string> = {
            '--border-radius': '8px',
            '--glass-blur': '12px',
            '--glass-opacity': '0.7'
        }

        // Combine defaults with theme colors
        const finalColors = { ...defaults, ...colors }

        Object.entries(finalColors).forEach(([key, value]) => {
            if (value !== undefined) {
                root.style.setProperty(key, String(value))
            }
        })
    }
}

let unsubscribeSnapshot: (() => void) | null = null
let unsubscribeUserTheme: (() => void) | null = null

export const useIlytatTheme = () => {
    // Firestore Integration - These must stay in the composable context
    const { user } = useUser()
    const db = useFirestore()

    // Initialize module-level listeners and watchers only once
    if (!isInitialized.value && typeof window !== 'undefined') {
        isInitialized.value = true

        // 1. Sync from Firestore when user UID changes
        watch(() => user.value?.uid, (uid) => {
            if (unsubscribeSnapshot) unsubscribeSnapshot()
            if (unsubscribeUserTheme) unsubscribeUserTheme()

            if (uid) {
                console.log('UseIlytatTheme: Subscribing to themes for user:', uid)
                const themesRef = collection(db, `users/${uid}/themes`)
                unsubscribeSnapshot = onSnapshot(themesRef, (snapshot) => {
                    const fsThemes: IlytatTheme[] = []
                    snapshot.forEach((doc) => {
                        fsThemes.push(doc.data() as IlytatTheme)
                    })
                    customThemes.value = fsThemes
                })

                const userRef = doc(db, `users/${uid}`)
                unsubscribeUserTheme = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data()
                        if (data.theme && data.theme !== currentThemeId.value) {
                            currentThemeId.value = data.theme
                        }
                        if (data.favoriteTheme && data.favoriteTheme !== favoriteThemeId.value) {
                            favoriteThemeId.value = data.favoriteTheme
                        }
                    }
                })
            } else {
                customThemes.value = []
            }
        }, { immediate: true })

        // 2. Global application of styles when currentTheme computed changes
        watch(() => currentTheme.value, (theme) => {
            if (theme && theme.id !== 'fallback') {
                applyRootStyles(theme)
            }
        }, { immediate: true, deep: true })
    }

    function applyTheme(themeId: string) {
        const theme = allThemes.value.find(t => t.id === themeId)
        if (!theme) {
            console.warn(`Theme ${themeId} not found`)
            currentThemeId.value = themeId
            return
        }

        currentThemeId.value = theme.id

        if (user.value?.uid) {
            const userRef = doc(db, `users/${user.value.uid}`)
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
        const index = customThemes.value.findIndex(t => t.id === theme.id)
        if (index >= 0) {
            customThemes.value[index] = theme
        } else {
            customThemes.value.push(theme)
        }

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
        customThemes.value = customThemes.value.filter(t => t.id !== themeId)
        if (currentThemeId.value === themeId) {
            applyTheme('minimal-light')
        }

        if (user.value?.uid) {
            try {
                const themeDoc = doc(db, `users/${user.value.uid}/themes`, themeId)
                await deleteDoc(themeDoc)
            } catch (e) {
                console.error('Failed to delete theme from Firestore', e)
            }
        }
    }

    function initTheme() {
        if (currentTheme.value && currentTheme.value.id !== 'fallback') {
            applyRootStyles(currentTheme.value)
        }
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
