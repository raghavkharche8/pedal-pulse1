/**
 * Notification Service
 * 
 * SECURITY: All emails sent via server-side Edge Function
 * No API keys exposed to client
 */

import { supabase } from './supabase';

interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

async function sendEmail(
    type: 'proof_submitted' | 'approved' | 'rejected' | 'shipping',
    to: string,
    name: string,
    challengeName: string,
    options?: {
        certificateUrl?: string;
        rejectionReason?: string;
        trackingNumber?: string;
        courier?: string;
    }
): Promise<EmailResult> {
    try {
        const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
                type,
                to,
                name,
                challengeName,
                ...options
            }
        });

        if (error) {
            console.error(`[EMAIL ERROR] ${type}:`, error);
            return { success: false, error: error.message };
        }

        return { success: true, messageId: data?.messageId };
    } catch (err) {
        console.error(`[EMAIL ERROR] ${type}:`, err);
        return { success: false, error: 'Failed to send email' };
    }
}

export const sendProofSubmissionEmail = async (
    email: string,
    name: string,
    challengeName: string
): Promise<EmailResult> => {
    return sendEmail('proof_submitted', email, name, challengeName);
};

export const sendApprovalEmail = async (
    email: string,
    name: string,
    challengeName: string,
    certificateUrl: string
): Promise<EmailResult> => {
    return sendEmail('approved', email, name, challengeName, { certificateUrl });
};

export const sendRejectionEmail = async (
    email: string,
    name: string,
    challengeName: string,
    reason: string
): Promise<EmailResult> => {
    return sendEmail('rejected', email, name, challengeName, { rejectionReason: reason });
};

export const sendShippingEmail = async (
    email: string,
    name: string,
    challengeName: string,
    trackingNumber: string,
    courier: string
): Promise<EmailResult> => {
    return sendEmail('shipping', email, name, challengeName, { trackingNumber, courier });
};
