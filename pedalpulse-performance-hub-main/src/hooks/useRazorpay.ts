import { useCallback } from 'react';

interface PaymentOptions {
    amount: number; // in rupees (will be converted to paise)
    description: string;
    prefillName?: string;
    prefillEmail?: string;
    prefillPhone?: string;
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const useRazorpay = () => {
    const RAZORPAY_KEY = 'rzp_live_R8gZv2A5epuJef';

    const initiatePayment = useCallback((
        options: PaymentOptions,
        onSuccess: (response: RazorpayResponse) => void,
        onFailure: (error: { reason: string }) => void
    ) => {
        const razorpayOptions = {
            key: RAZORPAY_KEY,
            amount: options.amount * 100, // Convert to paise
            currency: 'INR',
            name: 'PedalPulse',
            description: options.description,
            image: '/src/Logo/Logo.png',
            handler: (response: RazorpayResponse) => {
                onSuccess(response);
            },
            prefill: {
                name: options.prefillName || '',
                email: options.prefillEmail || '',
                contact: options.prefillPhone || '',
            },
            theme: {
                color: '#FF6B35',
            },
            modal: {
                ondismiss: () => {
                    onFailure({ reason: 'Payment cancelled by user' });
                },
            },
        };

        if (window.Razorpay) {
            const razorpay = new window.Razorpay(razorpayOptions);
            razorpay.open();
        } else {
            onFailure({ reason: 'Razorpay SDK not loaded' });
        }
    }, []);

    return { initiatePayment };
};
