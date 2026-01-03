/**
 * Create Razorpay Order Edge Function
 * 
 * SECURITY: Creates orders server-side with proper amount validation
 * and coupon discount application to prevent price manipulation attacks.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'https://pedalpulse.in',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Fixed prices in RUPEES - NEVER trust client-provided amounts
const CHALLENGE_PRICES: Record<string, number> = {
    'Republic Day 2026': 399,
}

interface CreateOrderRequest {
    registration_id: string;
    challenge_name: string;
    coupon_code?: string;
}

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
        const payload: CreateOrderRequest = await req.json()
        const { registration_id, challenge_name, coupon_code } = payload

        if (!registration_id || !challenge_name) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // Get server-side price in RUPEES
        const originalPrice = CHALLENGE_PRICES[challenge_name] || 399;

        // Get Razorpay credentials
        const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
        const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

        if (!razorpayKeyId || !razorpayKeySecret) {
            console.error('Razorpay credentials not configured')
            return new Response(
                JSON.stringify({ error: 'Payment service unavailable' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        // Verify user authentication
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Authentication required' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            )
        }

        const token = authHeader.replace('Bearer ', '')
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Invalid authentication' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            )
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Calculate final amount with coupon discount
        let finalPrice = originalPrice;
        let discountAmount = 0;
        let appliedCouponCode = null;

        if (coupon_code) {
            const sanitizedCode = coupon_code.toUpperCase().trim();

            // Validate coupon server-side
            const { data: validationResult, error: validationError } = await supabaseAdmin
                .rpc('validate_coupon', {
                    p_code: sanitizedCode,
                    p_challenge_name: challenge_name,
                    p_user_id: user.id,
                    p_order_amount: originalPrice
                });

            if (!validationError && validationResult?.[0]?.is_valid) {
                const couponData = validationResult[0];
                discountAmount = couponData.final_discount;
                finalPrice = originalPrice - discountAmount;
                appliedCouponCode = sanitizedCode;

                // Record coupon usage
                await supabaseAdmin.from('coupon_usages').insert({
                    coupon_id: couponData.coupon_id,
                    user_id: user.id,
                    registration_id: registration_id,
                    discount_applied: discountAmount,
                    original_amount: originalPrice,
                    final_amount: finalPrice
                });

                // Increment usage count
                await supabaseAdmin.rpc('increment_coupon_usage', {
                    coupon_id: couponData.coupon_id
                });
            }
            // If coupon is invalid, just proceed without discount
            // (error was already shown during validation step)
        }

        // Ensure final price is at least 1 rupee (Razorpay minimum)
        if (finalPrice < 1) {
            finalPrice = 0;
        }

        // If price is 0, skip Razorpay and mark as paid
        if (finalPrice === 0) {
            // Free registration - update status directly
            await supabaseAdmin
                .from('registrations')
                .update({
                    payment_status: 'completed',
                    status: 'registered',
                    coupon_code: appliedCouponCode,
                    coupon_discount: discountAmount,
                    original_amount: originalPrice,
                    final_amount: 0,
                    payment_verified_at: new Date().toISOString()
                })
                .eq('id', registration_id)
                .eq('user_id', user.id);

            return new Response(
                JSON.stringify({
                    success: true,
                    free_registration: true,
                    original_amount: originalPrice,
                    discount_amount: discountAmount,
                    final_amount: 0,
                    message: 'Registration completed for free!'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // Convert to paise for Razorpay
        const amountInPaise = Math.round(finalPrice * 100);

        // Create Razorpay order
        const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amountInPaise,
                currency: 'INR',
                receipt: `reg_${registration_id}`,
                notes: {
                    registration_id: registration_id,
                    user_id: user.id,
                    challenge_name: challenge_name,
                    original_amount: originalPrice,
                    discount_amount: discountAmount,
                    coupon_code: appliedCouponCode || 'none'
                }
            })
        })

        if (!orderResponse.ok) {
            const errorData = await orderResponse.text()
            console.error('Razorpay order creation failed:', errorData)
            return new Response(
                JSON.stringify({ error: 'Failed to create payment order' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        const order = await orderResponse.json()

        // Store order info in registration
        await supabaseAdmin
            .from('registrations')
            .update({
                razorpay_order_id: order.id,
                coupon_code: appliedCouponCode,
                coupon_discount: discountAmount,
                original_amount: originalPrice,
                final_amount: finalPrice
            })
            .eq('id', registration_id)
            .eq('user_id', user.id)

        return new Response(
            JSON.stringify({
                order_id: order.id,
                amount: amountInPaise,
                amount_rupees: finalPrice,
                original_amount: originalPrice,
                discount_amount: discountAmount,
                coupon_applied: appliedCouponCode,
                currency: 'INR',
                key_id: razorpayKeyId
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Order creation error:', error)
        return new Response(
            JSON.stringify({ error: 'Failed to create order' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
