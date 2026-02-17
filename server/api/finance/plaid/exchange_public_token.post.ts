import { Products } from 'plaid';
import { getFirestore } from 'firebase-admin/firestore'; // Assuming firebase-admin is available in server context

export default defineEventHandler(async (event) => {
    const { public_token, institution_name, institution_id, scope = 'personal', tenantId } = await readBody(event);
    const decodedToken = await verifyAdminToken(event);
    const userId = decodedToken.uid;
    const db = getFirestore(); // Ensure firebase-admin initialized

    if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    try {
        // 1. Exchange public token
        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
            public_token,
        });

        const accessToken = exchangeResponse.data.access_token;
        const itemId = exchangeResponse.data.item_id;

        // 2. Fetch Accounts
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });

        const accounts = accountsResponse.data.accounts;
        const item = accountsResponse.data.item; // metadata

        // 3. Save "Item" (Bank Connection) to Metadata Collection (internal use)
        // Store access_token securely. In production, encrypt this!
        await db.collection('plaid_items').doc(itemId).set({
            accessToken, // ENCRYPT ME IN PROD
            itemId,
            institutionId: institution_id || null,
            institutionName: institution_name || 'Unknown Bank',
            userId: userId,
            scope,
            tenantId: tenantId || null,
            createdAt: new Date(),
            status: 'active'
        });

        // 4. Save Accounts to Firestore (using ilytat-finance Accounts schema)
        const batch = db.batch();

        for (const account of accounts) {
            // Check if account already exists to avoid overwriting user-set names?
            // For now, simple set.
            // ID strategy: use Plaid account_id as doc ID or mapped? 
            // Using Plaid account_id ensures uniqueness and easier updates.
            const accountRef = db.collection('accounts').doc(account.account_id);

            // If scope is tenant, add user (admin) to viewers so they can see immediately?
            // useFinance logic: or(ownerId == user.uid, financialViewers contains user.uid)
            // If user is owner, they see it.
            // But other admins? Ideally we'd add all admins to viewers or update useFinance query.
            // For now, assume this user sees it via ownerId, and manually add tenantId for future role logic.

            batch.set(accountRef, {
                id: account.account_id,
                name: account.name,
                officialName: account.official_name || account.name,
                type: account.type, // 'depository', 'credit', etc.
                subtype: account.subtype,
                balance: account.balances.current || 0,
                limit: account.balances.limit || null,
                currency: account.balances.iso_currency_code || 'USD',
                institution: institution_name || 'Unknown',
                lastUpdated: new Date(),
                scope: scope,
                ownerId: userId,
                tenantId: tenantId || null,
                plaidItemId: itemId,
                mask: account.mask,
                financialViewers: scope === 'tenant' ? [userId] : [] // Ensure at least creator is viewer if not owner (though ownerId covers creator)
            }, { merge: true });
        }

        await batch.commit();

        // 5. Trigger Initial Transaction Sync (Optional, async)
        // Ensure transactions product is available
        // await syncTransactions(accessToken, user.id); 

        return { success: true, accountsCount: accounts.length };

    } catch (error: any) {
        console.error('Error exchanging public token:', error.response?.data || error.message);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to exchange token',
            data: error.response?.data
        });
    }
});
