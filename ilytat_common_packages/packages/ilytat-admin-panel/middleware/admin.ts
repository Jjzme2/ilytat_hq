import { getCurrentUser } from 'vuefire';

export default defineNuxtRouteMiddleware(async (to: any, from: any) => {
    const user = await getCurrentUser()

    if (!user) return navigateTo('/login');

    try {
        const token = await user.getIdTokenResult()
        // Check if user has admin role in custom claims
        // customized claims via firebase-admin are usually on token.claims
        const role = token.claims.role
        const tenantId = token.claims.tenantId

        // Check if user has admin role OR super role in ilytat-hq
        const isAdmin = role === 'admin'
            || token.claims.admin === true
            || (role === 'super' && tenantId === 'ilytat-hq')

        if (isAdmin) {
            return
        }

    } catch (e) {
        console.error('Error checking admin status', e)
    }

    return navigateTo('/')
})
