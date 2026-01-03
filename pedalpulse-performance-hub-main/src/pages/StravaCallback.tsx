import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const StravaCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("Authenticating...");

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const error = searchParams.get('error');
            const state = searchParams.get('state');

            if (error) {
                toast.error("Strava connection denied");
                navigate('/dashboard');
                return;
            }

            // SECURITY: Validate OAuth state to prevent CSRF attacks
            const storedState = sessionStorage.getItem('strava_oauth_state');
            sessionStorage.removeItem('strava_oauth_state'); // Clear immediately

            if (!state || state !== storedState) {
                toast.error("Security validation failed. Please try connecting again.");
                navigate('/dashboard');
                return;
            }

            if (!code) {
                navigate('/dashboard');
                return;
            }

            try {
                setStatus("Exchanging tokens...");

                // 1. Get Session
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !sessionData.session) {
                    throw new Error("Please sign in to connect Strava.");
                }

                const accessToken = sessionData.session.access_token;

                // 2. Call Edge Function with Raw Fetch
                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/strava-auth`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ code })
                });

                const data = await response.json();

                if (!response.ok) {
                    const status = response.status;
                    if (status === 401) {
                        toast.warning("Session expired. Please log in again.");
                        throw new Error("Authentication required");
                    }
                    // SECURITY: Don't expose internal error details
                    throw new Error("Failed to connect Strava. Please try again.");
                }

                if (!data.success) {
                    throw new Error("Connection failed. Please try again.");
                }

                setStatus("Connection successful!");
                toast.success("Strava connected successfully!");
                navigate('/dashboard');

            } catch (err: any) {
                // SECURITY: Log error server-side, show generic message to user
                console.error("Strava Auth Error:", err);
                toast.error("Failed to connect Strava. Please try again.");
                setStatus("Connection failed");
                setTimeout(() => navigate('/dashboard'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center max-w-sm w-full mx-4">
                <Loader2 className="w-10 h-10 text-[#FC4C02] animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">Connecting to Strava</h2>
                <p className="text-slate-500">{status}</p>
            </div>
        </div>
    );
};

export default StravaCallback;
