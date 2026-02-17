export const usePlaid = () => {
    const isPlaidLoaded = ref(false);
    const plaidHandler = ref<any>(null);

    const loadPlaidScript = () => {
        if (window.Plaid) {
            isPlaidLoaded.value = true;
            return Promise.resolve();
        }

        return new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
            script.async = true;
            script.onload = () => {
                isPlaidLoaded.value = true;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    const initializeLink = async (options: { token: string; onSuccess: (public_token: string, metadata: any) => void; onExit?: (err: any, metadata: any) => void }) => {
        if (!isPlaidLoaded.value) {
            await loadPlaidScript();
        }

        try {
            // 1. Fetch Link Token from our API
            const { link_token } = await $fetch<{ link_token: string }>('/api/finance/plaid/create_link_token', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${options.token}`
                }
            });

            // 2. Create Handler
            if (window.Plaid) {
                plaidHandler.value = window.Plaid.create({
                    token: link_token,
                    onSuccess: options.onSuccess,
                    onExit: options.onExit,
                    onEvent: (eventName: string, metadata: any) => {
                        console.log('Plaid Event:', eventName, metadata);
                    }
                });
            } else {
                console.error('Plaid SDK not loaded');
            }
        } catch (error) {
            console.error('Failed to initialize Plaid Link:', error);
        }
    };

    const openLink = () => {
        if (plaidHandler.value) {
            plaidHandler.value.open();
        } else {
            console.warn('Plaid Link not initialized yet');
        }
    };

    return {
        initializeLink,
        openLink,
        isPlaidLoaded
    };
};

declare global {
    interface Window {
        Plaid: any;
    }
}
