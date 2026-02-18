import { CountryCode, Products } from 'plaid';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const decodedToken = await verifyAdminToken(event);
    const userId = decodedToken.uid;

    if (!userId) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
        });
    }

    try {
        const request = {
            user: {
                client_user_id: userId,
            },
            client_name: 'ILYTAT HQ',
            products: [Products.Transactions],
            country_codes: [CountryCode.Us],
            language: 'en',
            // redirect_uri: config.public.plaidRedirectUri, // Optional for web, required for OAuth in some cases
        };

        const createTokenResponse = await plaidClient.linkTokenCreate(request);
        return createTokenResponse.data;
    } catch (error: any) {
        console.error('Error creating link token:', error.response?.data || error.message);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create link token',
            data: error.response?.data
        });
    }
});
