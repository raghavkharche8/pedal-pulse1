import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log('=== Edge Function Called ===')
        const body = await req.json()
        console.log('Request body received:', JSON.stringify(body))

        const { amount, currency, receipt, notes } = body

        // Validate inputs
        if (!amount || amount <= 0) {
            console.error('Validation failed: Invalid amount', amount)
            throw new Error('Invalid amount')
        }

        if (!receipt) {
            console.error('Validation failed: Missing receipt')
            throw new Error('Receipt ID is required')
        }

        console.log(`Creating Razorpay order: Amount=${amount}, Receipt=${receipt}`)
        console.log('Razorpay credentials:', {
            key_id_set: !!RAZORPAY_KEY_ID,
            secret_set: !!RAZORPAY_KEY_SECRET
        })

        // Create Razorpay order with AUTO-CAPTURE enabled
        const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount, // in paise
                currency: currency || 'INR',
                receipt: receipt,
                notes: notes || {},
                payment_capture: 1  // ⭐ AUTO-CAPTURE ENABLED - Payments will be captured automatically
            }),
        })

        const order = await response.json()
        console.log('Razorpay API status:', response.status)
        console.log('Razorpay API response:', JSON.stringify(order))

        if (!response.ok) {
            console.error('Razorpay API error:', order)
            throw new Error(order.error?.description || 'Failed to create order')
        }

        console.log(`Order created successfully: ${order.id}`)

        return new Response(
            JSON.stringify({
                success: true,
                order: {
                    id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    receipt: order.receipt,
                    status: order.status,
                    notes: order.notes
                }
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error: any) {
        console.error('=== Edge Function Error ===')
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Failed to create order'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
