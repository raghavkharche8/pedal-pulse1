/**
 * Strava OAuth Edge Function
 * 
 * SECURITY FIXES:
 * - Restricted CORS to production domain
 * - Token encryption at rest using AES-GCM
 * - Removed sensitive info from error messages
 * - Added proper error handling
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// SECURITY: Restrict CORS to allowed origins only
const getAllowedOrigin = (requestOrigin: string | null): string => {
    const allowedOrigins = [
        Deno.env.get('ALLOWED_ORIGIN') || 'https://pedalpulse.in',
        'http://localhost:5173', // Dev only - remove in production
        'http://localhost:3000'
    ];

    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
        return requestOrigin;
    }
    return allowedOrigins[0];
}

const getCorsHeaders = (req: Request) => ({
    'Access-Control-Allow-Origin': getAllowedOrigin(req.headers.get('origin')),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
});

// SECURITY: Encrypt tokens before storage using Web Crypto API
async function encryptToken(plaintext: string, keyString: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Create key from secret
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(keyString.padEnd(32, '0').slice(0, 32)),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        keyMaterial,
        data
    );

    // Combine IV + ciphertext and encode as base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
}

async function decryptToken(ciphertext: string, keyString: string): Promise<string> {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    // Decode from base64
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

    // Extract IV and ciphertext
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    // Create key from secret
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(keyString.padEnd(32, '0').slice(0, 32)),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        keyMaterial,
        data
    );

    return decoder.decode(decrypted);
}

Deno.serve(async (req) => {
    const corsHeaders = getCorsHeaders(req);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
        )
    }

    try {
        const payload = await req.json()
        const { code, refresh_token, action } = payload

        // Check for Environment Variables
        const clientId = Deno.env.get('STRAVA_CLIENT_ID')
        const clientSecret = Deno.env.get('STRAVA_CLIENT_SECRET')
        const tokenEncryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || clientSecret

        if (!clientId || !clientSecret) {
            // SECURITY: Don't reveal which secret is missing
            console.error("Missing Strava secrets");
            return new Response(
                JSON.stringify({ error: 'Service configuration error' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        let stravaPayload: any = {
            client_id: clientId,
            client_secret: clientSecret,
        };

        let grantType = '';

        if (action === 'refresh' && refresh_token) {
            grantType = 'refresh_token';
            stravaPayload.grant_type = 'refresh_token';

            // Decrypt the refresh token if it's encrypted
            try {
                stravaPayload.refresh_token = await decryptToken(refresh_token, tokenEncryptionKey!);
            } catch {
                // If decryption fails, assume it's not encrypted (migration period)
                stravaPayload.refresh_token = refresh_token;
            }
        } else if (code) {
            grantType = 'authorization_code';
            stravaPayload.grant_type = 'authorization_code';
            stravaPayload.code = code;
        } else {
            return new Response(
                JSON.stringify({ error: 'Invalid request' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // Exchange Token with Strava
        const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stravaPayload),
        })

        const tokenData = await tokenResponse.json()

        if (tokenData.errors || tokenData.message === 'Bad Request') {
            console.error("Strava API Error:", tokenData);
            return new Response(
                JSON.stringify({ error: 'Failed to authenticate with Strava' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // Setup Supabase Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // SECURITY: Encrypt tokens before storage
        const encryptedAccessToken = await encryptToken(tokenData.access_token, tokenEncryptionKey!);
        const encryptedRefreshToken = await encryptToken(tokenData.refresh_token, tokenEncryptionKey!);

        if (grantType === 'authorization_code') {
            // Get User from Auth Header
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
                console.error("User Auth Error:", userError?.message);
                return new Response(
                    JSON.stringify({ error: 'Authentication failed' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
                )
            }

            // Store with encrypted tokens
            const { error: dbError } = await supabaseAdmin
                .from('strava_connections')
                .upsert({
                    user_id: user.id,
                    strava_athlete_id: tokenData.athlete.id,
                    // SECURITY: Store encrypted tokens
                    access_token_encrypted: encryptedAccessToken,
                    refresh_token_encrypted: encryptedRefreshToken,
                    // Keep plaintext for backward compatibility during migration
                    // TODO: Remove these columns after migration
                    access_token: 'ENCRYPTED',
                    refresh_token: 'ENCRYPTED',
                    encryption_version: 1,
                    token_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
                    athlete_data: tokenData.athlete,
                    is_active: true,
                    last_sync_at: new Date().toISOString()
                }, { onConflict: 'user_id' })

            if (dbError) {
                console.error("DB Error:", dbError.message);
                return new Response(
                    JSON.stringify({ error: 'Failed to save connection' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
                )
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    athlete: {
                        firstname: tokenData.athlete.firstname,
                        lastname: tokenData.athlete.lastname
                    }
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )

        } else if (grantType === 'refresh_token') {
            // Find connection by old encrypted token
            const { data: connection } = await supabaseAdmin
                .from('strava_connections')
                .select('user_id')
                .eq('refresh_token_encrypted', refresh_token)
                .maybeSingle();

            if (connection) {
                const { error: updateError } = await supabaseAdmin
                    .from('strava_connections')
                    .update({
                        access_token_encrypted: encryptedAccessToken,
                        refresh_token_encrypted: encryptedRefreshToken,
                        token_expires_at: new Date(tokenData.expires_at * 1000).toISOString()
                    })
                    .eq('user_id', connection.user_id);

                if (updateError) console.error("DB Update Error:", updateError.message);
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    access_token: encryptedAccessToken // Return encrypted token
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        return new Response(
            JSON.stringify({ error: 'Invalid request' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )

    } catch (error) {
        console.error("Function Error:", error)
        // SECURITY: Never expose internal error details
        return new Response(
            JSON.stringify({ error: 'Authentication failed' }),
            { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
