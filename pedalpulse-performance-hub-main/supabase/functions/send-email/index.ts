/**
 * Email Notification Edge Function
 * 
 * SECURITY: Sends transactional emails via Resend API
 * All email sending happens server-side to protect API keys
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'https://pedalpulse.in',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailRequest {
    type: 'proof_submitted' | 'approved' | 'rejected' | 'shipping';
    to: string;
    name: string;
    challengeName: string;
    certificateUrl?: string;
    rejectionReason?: string;
    trackingNumber?: string;
    courier?: string;
}

const EMAIL_TEMPLATES = {
    proof_submitted: (name: string, challengeName: string) => ({
        subject: `Proof Received - ${challengeName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #FF6B35;">Proof Received! 🎯</h1>
                <p>Hi ${name},</p>
                <p>We've received your activity proof for <strong>${challengeName}</strong>.</p>
                <p>Our team will review it within 24-48 hours. You'll receive an email once verified.</p>
                <p>Keep crushing it! 💪</p>
                <p>- Team PedalPulse</p>
            </div>
        `
    }),

    approved: (name: string, challengeName: string, certificateUrl?: string) => ({
        subject: `Challenge Completed! 🎉 - ${challengeName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #10B981;">Congratulations, ${name}! 🏆</h1>
                <p>You've successfully completed the <strong>${challengeName}</strong>!</p>
                ${certificateUrl ? `
                    <p><a href="${certificateUrl}" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Download Your Certificate</a></p>
                ` : ''}
                <p>Your medal will be shipped soon. We'll send you tracking details once dispatched.</p>
                <p>Thank you for being part of the PedalPulse community!</p>
                <p>- Team PedalPulse</p>
            </div>
        `
    }),

    rejected: (name: string, challengeName: string, reason?: string) => ({
        subject: `Action Required - ${challengeName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #EF4444;">Proof Needs Resubmission</h1>
                <p>Hi ${name},</p>
                <p>Unfortunately, we couldn't verify your proof for <strong>${challengeName}</strong>.</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                <p>Please log in to your dashboard and submit a new proof.</p>
                <p><a href="https://pedalpulse.in/dashboard" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Go to Dashboard</a></p>
                <p>Need help? Reply to this email.</p>
                <p>- Team PedalPulse</p>
            </div>
        `
    }),

    shipping: (name: string, challengeName: string, trackingNumber?: string, courier?: string) => ({
        subject: `Your Medal is On the Way! 🏅 - ${challengeName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #FF6B35;">Medal Shipped! 📦</h1>
                <p>Hi ${name},</p>
                <p>Great news! Your medal for <strong>${challengeName}</strong> has been dispatched.</p>
                <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Courier:</strong> ${courier || 'Delhivery'}</p>
                    <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                </div>
                <p>Expected delivery: 5-7 business days</p>
                <p>Wear it with pride! 🏆</p>
                <p>- Team PedalPulse</p>
            </div>
        `
    })
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
        )
    }

    try {
        const resendApiKey = Deno.env.get('RESEND_API_KEY')
        if (!resendApiKey) {
            console.error('RESEND_API_KEY not configured')
            return new Response(
                JSON.stringify({ error: 'Email service not configured' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        // Verify authentication (optional for internal calls, required for external)
        const authHeader = req.headers.get('Authorization')
        if (authHeader) {
            const supabase = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_ANON_KEY') ?? '',
                { global: { headers: { Authorization: authHeader } } }
            )
            const { error } = await supabase.auth.getUser()
            if (error) {
                return new Response(
                    JSON.stringify({ error: 'Unauthorized' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
                )
            }
        }

        const payload: EmailRequest = await req.json()
        const { type, to, name, challengeName, certificateUrl, rejectionReason, trackingNumber, courier } = payload

        if (!type || !to || !name || !challengeName) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // Get template
        let emailContent;
        switch (type) {
            case 'proof_submitted':
                emailContent = EMAIL_TEMPLATES.proof_submitted(name, challengeName);
                break;
            case 'approved':
                emailContent = EMAIL_TEMPLATES.approved(name, challengeName, certificateUrl);
                break;
            case 'rejected':
                emailContent = EMAIL_TEMPLATES.rejected(name, challengeName, rejectionReason);
                break;
            case 'shipping':
                emailContent = EMAIL_TEMPLATES.shipping(name, challengeName, trackingNumber, courier);
                break;
            default:
                return new Response(
                    JSON.stringify({ error: 'Invalid email type' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
                )
        }

        // Send via Resend
        const senderEmail = Deno.env.get('SENDER_EMAIL') || 'noreply@pedalpulse.in';
        const senderName = Deno.env.get('SENDER_NAME') || 'PedalPulse';

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: `${senderName} <${senderEmail}>`,
                to: [to],
                subject: emailContent.subject,
                html: emailContent.html
            })
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error('Resend API error:', errorData)
            return new Response(
                JSON.stringify({ error: 'Failed to send email' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        const result = await response.json()

        return new Response(
            JSON.stringify({ success: true, messageId: result.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Email function error:', error)
        return new Response(
            JSON.stringify({ error: 'Failed to send email' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
