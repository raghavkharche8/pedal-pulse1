/**
 * Strava Connection Component
 * 
 * STRAVA API COMPLIANCE:
 * - Uses official "Connect with Strava" button
 * - Shows "Powered by Strava" when connected
 * - Provides clear "Disconnect Strava" option
 * - Includes required disclaimers about data access
 * - No auto-fetching or background syncing
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, RefreshCw, XCircle, AlertCircle } from 'lucide-react';
import { fetchStravaActivities, processChallengeVerification } from '@/lib/strava';
import {
    ConnectWithStravaButton,
    PoweredByStrava,
    StravaDisclaimer
} from '@/components/strava/StravaAssets';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/auth/strava/callback`;

export const StravaConnect = ({ onSync }: { onSync?: () => void }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [athleteName, setAthleteName] = useState('');
    const [lastSync, setLastSync] = useState<string | null>(null);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('strava_connections')
                .select('*')
                .eq('is_active', true)
                .maybeSingle();

            if (data) {
                setIsConnected(true);
                if (data.athlete_data && (data.athlete_data as any).firstname) {
                    setAthleteName(`${(data.athlete_data as any).firstname} ${(data.athlete_data as any).lastname}`);
                }
                setLastSync(data.last_sync_at);
            }
        } catch (error) {
            console.error("Error checking Strava connection", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = () => {
        if (!STRAVA_CLIENT_ID) {
            toast.error("System Error: Strava Client ID not configured");
            return;
        }

        // SECURITY: Generate and store state parameter for CSRF protection
        const state = crypto.randomUUID();
        sessionStorage.setItem('strava_oauth_state', state);

        // SECURITY: Use minimum required scopes
        const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=activity:read,profile:read_all&state=${state}`;
        window.location.href = stravaAuthUrl;
    };


    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch activities ONLY when user explicitly requests
            const activities = await fetchStravaActivities(user.id);
            const verifications = await processChallengeVerification(user.id, activities);

            if (verifications > 0) {
                toast.success(`Verified ${verifications} challenge(s) with your best activities!`);
                onSync?.();
            } else {
                toast.info(`Synced ${activities.length} activities. No qualifying activities found for active challenges.`);
            }

            await supabase.from('strava_connections')
                .update({ last_sync_at: new Date().toISOString() })
                .eq('is_active', true);

            setLastSync(new Date().toISOString());

        } catch (error: any) {
            console.error("Sync Error:", error);
            toast.error(error.message || "Failed to sync activities");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDisconnect = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('strava_connections')
                .update({ is_active: false })
                .eq('is_active', true);

            if (error) throw error;

            setIsConnected(false);
            setAthleteName('');
            toast.success("Strava disconnected successfully");
        } catch (error) {
            toast.error("Failed to disconnect Strava");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    <span className="text-sm text-slate-500">Getting things ready...</span>
                </div>
            </div>
        );
    }

    if (isConnected) {
        return (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                            <span className="font-bold text-slate-900">Strava Connected</span>
                        </div>

                        {athleteName && (
                            <p className="text-sm text-slate-600 mb-1">
                                Linked as <span className="font-medium">{athleteName}</span>
                            </p>
                        )}

                        {lastSync && (
                            <p className="text-xs text-slate-400">
                                Last synced: {new Date(lastSync).toLocaleString()}
                            </p>
                        )}

                        {/* Required: Powered by Strava attribution */}
                        <div className="mt-3 pt-3 border-t border-slate-100">
                            <PoweredByStrava variant="orange" size="small" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="border-slate-200"
                            onClick={handleSync}
                            disabled={isSyncing}
                        >
                            {isSyncing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Sync Now
                        </Button>

                        {/* Required: Disconnect Strava option with confirmation */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                    title="Disconnect Strava"
                                >
                                    <XCircle className="w-5 h-5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Disconnect Strava?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will disconnect your Strava account. Automatic activity verification will stop.
                                        You can reconnect anytime.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDisconnect} className="bg-red-500 hover:bg-red-600">
                                        Disconnect
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* Required: Data access disclaimer */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <StravaDisclaimer />
                    <p className="text-xs text-[#FC4C02]/70 mt-2 font-medium text-center">
                        Powered by Strava. Verified by Us. Celebrated by You.
                    </p>
                </div>
            </div>
        );
    }

    // Not Connected State
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                        Your Strava knows the truth. Let it speak.
                    </h3>
                    <p className="text-slate-500 text-sm max-w-md mb-4">
                        Connect to auto-verify activities. No screenshots needed.
                    </p>

                    {/* Required: Data access disclaimer before connect */}
                    <StravaDisclaimer className="text-slate-400" />
                </div>

                {/* Required: Official "Connect with Strava" button */}
                <ConnectWithStravaButton
                    onClick={handleConnect}
                    variant="orange"
                />
            </div>
        </div>
    );
};
