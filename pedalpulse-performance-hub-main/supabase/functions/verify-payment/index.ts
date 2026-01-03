import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const RAZORPAY_KEY_ID = 'rzp_live_RzNkroOr9KgpMK'
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || 'YJ1Fw7rfDOyg8FUvnSekz2iW'

serve(async (req) => {
    try {
        const { registration_id, order_id, payment_id, signature } = await req.json()

        // LEVEL 2: Verify Razorpay Signature
        console.log('🔒 Level 2: Verifying payment signature...')
        const expectedSignature = await generateSignature(order_id, payment_id)

        if (expectedSignature !== signature) {
            console.error('❌ Signature mismatch!')
            return new Response(
                JSON.stringify({ error: 'Invalid payment signature' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }
        console.log('✅ Level 2: Signature verified')

        // LEVEL 3: Verify with Razorpay API
        console.log('🔒 Level 3: Checking payment status with Razorpay...')
        const paymentDetails = await fetchPaymentFromRazorpay(payment_id)

        // Verify payment status
        if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
            console.error('❌ Payment not captured:', paymentDetails.status)
            return new Response(
                JSON.stringify({ error: 'Payment not completed', status: paymentDetails.status }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Get registration details to verify amount
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data: registration, error: fetchError } = await supabaseAdmin
            .from('premium_registrations')
            .select('total_amount')
            .eq('id', registration_id)
            .single()

        if (fetchError || !registration) {
            console.error('❌ Registration not found')
            return new Response(
                JSON.stringify({ error: 'Registration not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Verify amount matches (Razorpay stores in paise, we store in rupees)
        const expectedAmountPaise = Math.round(registration.total_amount * 100)
        if (paymentDetails.amount !== expectedAmountPaise) {
            console.error('❌ Amount mismatch!', {
                expected: expectedAmountPaise,
                received: paymentDetails.amount
            })
            return new Response(
                JSON.stringify({ error: 'Payment amount mismatch' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }
        console.log('✅ Level 3: Payment verified with Razorpay')

        // Update database
        console.log('💾 Updating database...')
        const { error: updateError } = await supabaseAdmin
            .from('premium_registrations')
            .update({
                razorpay_order_id: order_id,
                razorpay_payment_id: payment_id,
                razorpay_signature: signature,
                payment_status: 'completed',
                updated_at: new Date().toISOString()
            })
            .eq('id', registration_id)

        if (updateError) {
            console.error('❌ Database update failed:', updateError)
            return new Response(
                JSON.stringify({ error: 'Failed to update registration' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
        }

        console.log('✅ Payment verification complete!')
        return new Response(
            JSON.stringify({ success: true, message: 'Payment verified successfully' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('💥 Verification error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
})

// Generate HMAC-SHA256 signature
async function generateSignature(orderId: string, paymentId: string): Promise<string> {
    const message = `${orderId}|${paymentId}`
    const encoder = new TextEncoder()
    const keyData = encoder.encode(RAZORPAY_KEY_SECRET)
    const messageData = encoder.encode(message)

    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )

    const signature = await crypto.subtle.sign('HMAC', key, messageData)
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

// Fetch payment details from Razorpay API
async function fetchPaymentFromRazorpay(paymentId: string): Promise<any> {
    const authHeader = 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error(`Razorpay API error: ${response.statusText}`)
    }

    return await response.json()
}
