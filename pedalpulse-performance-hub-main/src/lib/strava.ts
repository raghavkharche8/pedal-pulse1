import { supabase } from './supabase';

// NOTE: Client Secret is NEVER used on frontend.
// All token operations happen via secure Edge Functions.

export async function refreshStravaToken(userId: string) {
    try {
        // Fetch connection info (encrypted tokens are stored server-side)
        const { data: connection, error } = await supabase
            .from('strava_connections')
            .select('token_expires_at, refresh_token_encrypted')
            .eq('is_active', true)
            .maybeSingle();

        if (error || !connection) throw new Error("No Strava connection found");

        // Check expiry (give 5 min buffer)
        const expiresAt = new Date(connection.token_expires_at).getTime();
        if (Date.now() < expiresAt - 300000) {
            // Token still valid - get fresh access from Edge Function
            // This is secure as tokens are decrypted server-side only
            const { data, error: fetchError } = await supabase.functions.invoke('strava-auth', {
                body: {
                    action: 'get_access',
                    user_id: userId
                }
            });
            if (fetchError || !data?.access_token) {
                throw new Error("Failed to get access token");
            }
            return data.access_token;
        }

        // Token expired, needs refresh via Edge Function (Secure way)
        const { data: newData, error: refreshError } = await supabase.functions.invoke('strava-auth', {
            body: {
                action: 'refresh',
                refresh_token: connection.refresh_token_encrypted // Send encrypted token
            }
        });

        if (refreshError) throw refreshError;

        return newData.access_token;
    } catch (error) {
        // SECURITY: Don't expose error details
        console.error("Token refresh failed");
        return null;
    }
}


export async function fetchStravaActivities(userId: string, afterTimestamp?: number, beforeTimestamp?: number) {
    const accessToken = await refreshStravaToken(userId);
    if (!accessToken) throw new Error("Could not get valid Strava token");

    let url = `https://www.strava.com/api/v3/athlete/activities?per_page=50`;
    if (afterTimestamp) url += `&after=${afterTimestamp}`;
    if (beforeTimestamp) url += `&before=${beforeTimestamp}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch activities from Strava");
    }

    return await response.json();
}

/**
 * Maps Strava Activity Types to our internal Challenge Sports
 */
export function mapStravaTypeToChallengeSport(stravaType: string): string | null {
    const mapping: Record<string, string> = {
        'Run': 'Running',
        'VirtualRun': 'Running',
        'TrailRun': 'Running',
        'Ride': 'Cycling',
        'VirtualRide': 'Cycling',
        'MountainBikeRide': 'Cycling',
        'GravelRide': 'Cycling',
        'EBikeRide': 'Cycling',
        'Walk': 'Walking',
        'Hike': 'Walking'
    };
    return mapping[stravaType] || null;
}

/**
 * Core Logic: Match a Strava activity to user's registered challenges
 */
/**
 * Config for Challenges (In a real app, this comes from DB)
 */
function getChallengeRules(challengeName: string) {
    // Default to Republic Day 2026
    // Timezone: IST (UTC+5:30)
    // Start: Jan 20 2026 00:00 IST
    // End: Jan 26 2026 23:59 IST
    // For TESTING purposes: allowing Jan 2024 to Jan 2027 so current activities work?
    // User requested "activity only in that timeframe".
    // I will set the REAL dates. 
    // IF TESTING FAILS, User needs to upload manual activity with correct date.

    return {
        startDate: new Date('2026-01-26T00:00:00+05:30'),
        endDate: new Date('2026-02-01T23:59:59+05:30'),
        type: 'single_max', // 'single_max' (Best effort) or 'cumulative' (Add up)
        // For standard race, it's usually single max distance in one go.
    };
}

/**
 * Process Verification for ALL activities against user's registrations
 * Returns number of NEW verifications
 */
export async function processChallengeVerification(userId: string, activities: any[]): Promise<number> {
    if (!activities || activities.length === 0) return 0;

    // 1. Get active registrations
    const { data: registrations } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', userId)
        .or('status.eq.registered,payment_status.eq.completed')
        .or('verification_method.eq.strava_auto,verification_method.eq.manual');

    if (!registrations || registrations.length === 0) return 0;

    let newVerifications = 0;

    for (const reg of registrations) {
        // If already verified, do we re-check for a BETTER one?
        // Yes, if we want to show the "Max" distance. 
        // But if 'verification_status' is 'approved', updating it is fine.

        const rules = getChallengeRules(reg.challenge_name);
        const requiredKm = parseInt(reg.sport_distance?.match(/\d+/)?.[0] || '0');
        const regSport = reg.sport_distance?.split(' ')[0];

        // 2. Filter Candidate Activities
        const candidates = activities.filter(act => {
            const actDate = new Date(act.start_date);
            // Timeframe Check
            if (actDate < rules.startDate || actDate > rules.endDate) return false;

            // Sport Check
            const actSport = mapStravaTypeToChallengeSport(act.type);
            if (!regSport || (actSport !== regSport && !reg.sport_distance.includes(actSport!))) return false;

            return true;
        });

        if (candidates.length === 0) continue;

        let bestActivity = null;
        let totalDistance = 0;

        // 3. Apply Challenge Logic
        if (rules.type === 'cumulative') {
            totalDistance = candidates.reduce((sum, act) => sum + (act.distance / 1000), 0);
            if (totalDistance >= requiredKm) {
                // Determine which activity triggered the completion or just use the latest
                bestActivity = candidates[0]; // For metadata, we might need a summary or list.
                // For cumulative, we just need to pass one for ID ref, or create a summary.
            }
        } else {
            // 'single_max': Find the one with max distance that meets requirement

            // Sort by distance DESC
            candidates.sort((a, b) => b.distance - a.distance);

            const best = candidates[0];
            const distKm = best.distance / 1000;

            if (distKm >= requiredKm) {
                bestActivity = best;
            }
        }

        // 4. Verify if criteria met
        if (bestActivity) {
            // Check if this is a NEW verification or an improvement
            // If already verified, check if this activity is different/better?
            // For simplicity, we filter updates.
            if (reg.verification_status !== 'approved' || reg.strava_activity_id !== bestActivity.id) {
                await autoVerifyChallenge(reg.id, bestActivity, bestActivity.distance / 1000);
                newVerifications++;
            }
        }
    }

    return newVerifications;
}

async function autoVerifyChallenge(registrationId: string, stravaActivity: any, distanceKm: number) {
    const { error } = await supabase
        .from('registrations')
        .update({
            status: 'completed',
            verification_status: 'approved',
            verification_method: 'strava_auto',
            strava_activity_id: stravaActivity.id,
            strava_activity_data: stravaActivity,
            proof_submission_date: new Date().toISOString(),
            auto_verified_at: new Date().toISOString(),
        })
        .eq('id', registrationId);

    if (!error) {
        await supabase.from('strava_activity_sync_log').insert({
            registration_id: registrationId,
            strava_activity_id: stravaActivity.id,
            sync_type: 'auto_match_best',
            status: 'success',
            details: { name: stravaActivity.name, distance: distanceKm }
        });
    }
}
