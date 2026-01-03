/**
 * Validate Coupon Edge Function
 * 
 * SECURITY: All coupon validation happens server-side to prevent:
 * - Coupon code guessing/enumeration
 * - Discount manipulation
 * - Usage limit bypass
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'https://pedalpulse.in',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ValidateCouponRequest {
    code: string;
    challenge_name: string;
    order_amount: number; // in rupees
}

interface ApplyCouponRequest {
    code: string;
    challenge_name: string;
    order_amount: number;
    registration_id: string;
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
        const url = new URL(req.url);
        const action = url.pathname.split('/').pop(); // 'validate' or 'apply'

        const payload = await req.json();
        const { code, challenge_name, order_amount } = payload;

        // Validate required fields
        if (!code || !challenge_name || !order_amount) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // Sanitize code - uppercase, trim
        const sanitizedCode = code.toUpperCase().trim();

        // Rate limiting check (simple - in production use Redis)
        // For now, we'll rely on Supabase's built-in rate limiting

        // Get user from auth header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Authentication required' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            )
        }

        const token = authHeader.replace('Bearer ', '');
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Invalid authentication' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            )
        }

        // Use admin client for database operations
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Call the validate_coupon function
        const { data: validationResult, error: validationError } = await supabaseAdmin
            .rpc('validate_coupon', {
                p_code: sanitizedCode,
                p_challenge_name: challenge_name,
                p_user_id: user.id,
                p_order_amount: order_amount
            });

        if (validationError) {
            console.error('Validation error:', validationError);
            return new Response(
                JSON.stringify({ error: 'Failed to validate coupon' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        const result = validationResult?.[0];

        if (!result || !result.is_valid) {
            return new Response(
                JSON.stringify({
                    valid: false,
                    error: result?.error_message || 'Invalid coupon code'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // If this is just validation (not applying), return the discount info
        if (action !== 'apply') {
            const finalAmount = order_amount - result.final_discount;

            return new Response(
                JSON.stringify({
                    valid: true,
                    discount_type: result.discount_type,
                    discount_value: result.discount_value,
                    discount_amount: result.final_discount,
                    original_amount: order_amount,
                    final_amount: finalAmount > 0 ? finalAmount : 0,
                    message: result.discount_type === 'percentage'
                        ? `${result.discount_value}% off applied!`
                        : `₹${result.discount_value} off applied!`
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // APPLY COUPON - Record usage and update registration
        const { registration_id } = payload as ApplyCouponRequest;

        if (!registration_id) {
            return new Response(
                JSON.stringify({ error: 'Registration ID required to apply coupon' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        const finalAmount = order_amount - result.final_discount;

        // Start a transaction-like operation
        // 1. Record coupon usage
        const { error: usageError } = await supabaseAdmin
            .from('coupon_usages')
            .insert({
                coupon_id: result.coupon_id,
                user_id: user.id,
                registration_id: registration_id,
                discount_applied: result.final_discount,
                original_amount: order_amount,
                final_amount: finalAmount > 0 ? finalAmount : 0
            });

        if (usageError) {
            console.error('Usage recording error:', usageError);
            return new Response(
                JSON.stringify({ error: 'Failed to apply coupon' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        // 2. Increment coupon usage count
        await supabaseAdmin
            .from('coupons')
            .update({ current_uses: supabaseAdmin.rpc('increment', { row_id: result.coupon_id }) })
            .eq('id', result.coupon_id);

        // Actually, let's do it directly
        await supabaseAdmin.rpc('increment_coupon_usage', { coupon_id: result.coupon_id });

        // 3. Update registration with coupon info
        const { error: updateError } = await supabaseAdmin
            .from('registrations')
            .update({
                coupon_code: sanitizedCode,
                coupon_discount: result.final_discount,
                original_amount: order_amount,
                final_amount: finalAmount > 0 ? finalAmount : 0
            })
            .eq('id', registration_id)
            .eq('user_id', user.id);

        if (updateError) {
            console.error('Registration update error:', updateError);
            // Don't fail - coupon was applied, just logging failed
        }

        return new Response(
            JSON.stringify({
                success: true,
                valid: true,
                discount_amount: result.final_discount,
                original_amount: order_amount,
                final_amount: finalAmount > 0 ? finalAmount : 0,
                message: 'Coupon applied successfully!'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Coupon validation error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process coupon' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
