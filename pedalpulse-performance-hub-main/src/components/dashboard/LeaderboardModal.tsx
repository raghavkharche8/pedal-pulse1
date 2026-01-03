import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Timer, Medal, ArrowUp, ArrowDown, RefreshCw, X, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { PoweredByStrava, LeaderboardDisclaimer } from '@/components/strava/StravaAssets';

interface LeaderboardModalProps {
    challengeName: string;
    currentUserRegId: string;
    trigger?: React.ReactNode;
}

export const LeaderboardModal = ({ challengeName, currentUserRegId, trigger }: LeaderboardModalProps) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Filters (Persisted)
    const [gender, setGender] = useState<string>(localStorage.getItem('lb_gender') || 'Male');
    const [sport, setSport] = useState<string>(localStorage.getItem('lb_sport') || 'Running');
    const [sortBy, setSortBy] = useState<'distance' | 'time'>(localStorage.getItem('lb_sort') as any || 'distance');

    // Rank History for indicators
    const prevRanks = useRef<Record<string, number>>({});

    // Persist filters
    useEffect(() => {
        localStorage.setItem('lb_gender', gender);
        localStorage.setItem('lb_sport', sport);
        localStorage.setItem('lb_sort', sortBy);
    }, [gender, sport, sortBy]);

    const fetchData = async (background = false) => {
        if (!background) setLoading(true);
        else setIsUpdating(true);

        try {
            // Fetch ALL verified participants for this challenge via Secure View
            const { data, error } = await supabase
                .from('leaderboard_entries')
                .select('*')
                .eq('challenge_name', challengeName)
                .eq('verification_method', 'strava_auto')
                .not('strava_activity_data', 'is', null);

            if (error) throw error;

            // Transform & verify data
            const validParticipants = (data || []).map(p => {
                const activity = p.strava_activity_data || {};
                const regSportType = p.sport_distance?.toLowerCase().includes('cycling') ? 'Cycling' : 'Running';
                const displayName = p.first_name
                    ? `${p.first_name} ${p.last_name || ''}`
                    : (p.full_name || 'Athlete');

                return {
                    id: p.id,
                    name: displayName.trim() || 'Athlete',
                    gender: p.gender || 'Male', // Default if missing
                    sportCategory: regSportType, // 'Running' or 'Cycling'
                    distance: (activity.distance || 0) / 1000, // km
                    time: activity.moving_time || 0, // seconds
                    activityId: activity.id,
                    startDate: activity.start_date,
                    avatar: p.user_id, // We don't have avatar url in reg table, using ID to generate gradient maybe
                    regDistance: parseInt(p.sport_distance?.match(/\d+/)?.[0] || '0'),
                    isCurrentUser: p.user_id === user?.id
                };
            });

            setParticipants(validParticipants);
            setLastUpdated(new Date());

        } catch (err) {
            console.error(err);
            if (!background) toast.error("Failed to load leaderboard");
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
            // Poll every 2 minutes
            const interval = setInterval(() => fetchData(true), 2 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [isOpen, challengeName]);

    // Derived Logic for Display
    const filteredList = participants
        .filter(p => p.gender === gender && p.sportCategory === sport)
        .sort((a, b) => {
            if (sortBy === 'distance') {
                if (b.distance !== a.distance) return b.distance - a.distance; // Descending Distance
                return a.time - b.time; // Faster time wins tie
            } else {
                return a.time - b.time; // Ascending Time (Fastest)
            }
        });

    // Assign Ranks
    const rankedList = filteredList.map((p, idx) => {
        const rank = idx + 1;
        const change = prevRanks.current[p.id] ? prevRanks.current[p.id] - rank : 0; // Pos changes
        return { ...p, rank, change };
    });

    // Update refs for next poll
    useEffect(() => {
        const newRanks: Record<string, number> = {};
        rankedList.forEach(p => newRanks[p.id] = p.rank);
        prevRanks.current = newRanks;
    }, [participants, gender, sport, sortBy]);

    // Current User Stats (if in filtered list or not?)
    // Requirement: "Display ... current user's own rank even if outside top 10"
    const currentUserStats = rankedList.find(p => p.isCurrentUser);

    const top10 = rankedList.slice(0, 10);
    const podium = rankedList.slice(0, 3);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">View Leaderboard</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50">

                {/* Header */}
                <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-[#FC4C02]" />
                            {challengeName} Leaderboard
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            {isUpdating ? (
                                <span className="flex items-center text-[#FC4C02] font-medium animate-pulse">
                                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Updating...
                                </span>
                            ) : (
                                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                            )}
                            <span>•</span>
                            <span>{participants.length} Participants</span>
                            <span>•</span>
                            <PoweredByStrava variant="orange" size="small" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 bg-white border-b border-slate-100 flex flex-wrap gap-4 items-center shrink-0 shadow-sm z-10">
                    <Tabs value={sport} onValueChange={setSport} className="w-auto">
                        <TabsList>
                            <TabsTrigger value="Running">Running</TabsTrigger>
                            <TabsTrigger value="Cycling">Cycling</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Tabs value={gender} onValueChange={setGender} className="w-auto">
                        <TabsList>
                            <TabsTrigger value="Male">Male</TabsTrigger>
                            <TabsTrigger value="Female">Female</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="ml-auto flex items-center gap-2">
                        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="distance">Max Distance</SelectItem>
                                <SelectItem value="time">Fastest Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1 p-6">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className="space-y-8 max-w-3xl mx-auto pb-20">

                            {/* Podium */}
                            {podium.length > 0 && (
                                <div className="flex justify-center items-end gap-4 mb-12 min-h-[160px]">
                                    {/* 2nd Place */}
                                    {podium[1] && <PodiumItem participant={podium[1]} place={2} />}
                                    {/* 1st Place */}
                                    {podium[0] && <PodiumItem participant={podium[0]} place={1} />}
                                    {/* 3rd Place */}
                                    {podium[2] && <PodiumItem participant={podium[2]} place={3} />}
                                </div>
                            )}

                            {/* List */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3 text-left w-16">Rank</th>
                                            <th className="px-4 py-3 text-left">Athlete</th>
                                            <th className="px-4 py-3 text-right">Distance</th>
                                            <th className="px-4 py-3 text-right">Time</th>
                                            <th className="px-4 py-3 text-center">Activity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {top10.map((p) => (
                                            <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${p.isCurrentUser ? 'bg-orange-50/50' : ''}`}>
                                                <td className="px-4 py-3 font-bold text-slate-700">
                                                    <div className="flex items-center gap-1">
                                                        #{p.rank}
                                                        {p.change > 0 && <ArrowUp className="w-3 h-3 text-green-500" />}
                                                        {p.change < 0 && <ArrowDown className="w-3 h-3 text-red-500" />}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${getAvatarColor(p.name)}`}>
                                                            {p.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900 flex items-center gap-1">
                                                                {p.name}
                                                                {p.isCurrentUser && <Badge variant="outline" className="text-[10px] h-4 px-1">YOU</Badge>}
                                                                {p.distance >= p.regDistance && <CheckCircle className="w-3 h-3 text-green-500 fill-green-100" />}
                                                            </div>
                                                            <div className="text-xs text-slate-500">{new Date(p.startDate).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono font-medium text-slate-900">
                                                    {p.distance.toFixed(2)} km
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600">
                                                    {formatTime(p.time)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {/* STRAVA COMPLIANCE: Link must say "View on Strava" */}
                                                    <a
                                                        href={`https://www.strava.com/activities/${p.activityId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#FC5200] hover:underline"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        View on Strava
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                        {top10.length === 0 && (
                                            <tr><td colSpan={5} className="p-8 text-center text-slate-400">No verified activities yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </ScrollArea>

                {/* Sticky User Stat */}
                {currentUserStats && (
                    <div className="shrink-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-20">
                        <div className="max-w-3xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-900 rounded-xl text-white">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Rank</span>
                                    <span className="text-xl font-bold leading-none">#{currentUserStats.rank}</span>
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 flex items-center gap-2">
                                        Your Performance
                                        {currentUserStats.change > 0 && <span className="text-xs text-green-600 flex items-center"><ArrowUp className="w-3 h-3" /> {currentUserStats.change}</span>}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {currentUserStats.distance.toFixed(2)} km • {formatTime(currentUserStats.time)}
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" disabled className="text-[#FC4C02] font-semibold bg-[#FC4C02]/10">
                                {sortBy === 'distance' ? 'Max Distance' : 'Fastest Time'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

// Sub-components & Helpers

const PodiumItem = ({ participant, place }: { participant: any, place: number }) => {
    const height = place === 1 ? 'h-32' : place === 2 ? 'h-24' : 'h-20';
    const color = place === 1 ? 'bg-yellow-400' : place === 2 ? 'bg-slate-300' : 'bg-amber-600';
    const icon = place === 1 ? <Trophy className="w-6 h-6 text-white drop-shadow-sm" /> :
        place === 2 ? <Medal className="w-5 h-5 text-white" /> :
            <Medal className="w-5 h-5 text-white" />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
        >
            <div className="mb-2 flex flex-col items-center relative">
                <div className={`w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-sm font-bold text-white mb-2 z-10 relative ${getAvatarColor(participant.name)}`}>
                    {participant.name.charAt(0)}
                    <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                        {place}
                    </span>
                </div>
                <div className="text-center">
                    <div className="font-bold text-sm text-slate-900 leading-tight w-20 truncate">{participant.name.split(' ')[0]}</div>
                    <div className="text-xs text-slate-500 font-mono">{participant.distance.toFixed(1)}km</div>
                </div>
            </div>
            <div className={`${height} w-20 ${color} rounded-t-lg shadow-inner flex items-start justify-center pt-2 bg-opacity-90 backdrop-blur-sm`}>
                {icon}
            </div>
        </motion.div>
    );
};

function getAvatarColor(name: string) {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = name.length % colors.length;
    return colors[index];
}
