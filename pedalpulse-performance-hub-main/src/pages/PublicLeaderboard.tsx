import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Timer, Medal, ArrowUp, ArrowDown, RefreshCw, Loader2, CheckCircle, LogIn, ChevronRight, ExternalLink } from 'lucide-react';
import { PoweredByStrava, LeaderboardDisclaimer, ViewOnStravaLink } from '@/components/strava/StravaAssets';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const PublicLeaderboard = () => {
    const { challengeName: slug } = useParams();
    const { user } = useAuth();

    // Normalize slug
    const challengeName = slug === 'republic-day-challenges-2026' ? 'Republic Day 2026' : slug?.replace(/-/g, ' ');

    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Filters
    const [gender, setGender] = useState<string>(localStorage.getItem('lb_gender') || 'Male');
    const [sport, setSport] = useState<string>(localStorage.getItem('lb_sport') || 'Running');
    const [sortBy, setSortBy] = useState<'distance' | 'time'>(localStorage.getItem('lb_sort') as any || 'distance');

    // Rank History
    const prevRanks = useRef<Record<string, number>>({});

    useEffect(() => {
        localStorage.setItem('lb_gender', gender);
        localStorage.setItem('lb_sport', sport);
        localStorage.setItem('lb_sort', sortBy);
    }, [gender, sport, sortBy]);

    const fetchData = async (background = false) => {
        if (!background) setLoading(true);
        else setIsUpdating(true);

        try {
            const { data, error } = await supabase
                .from('leaderboard_entries')
                .select('*')
                .eq('challenge_name', challengeName)
                .eq('verification_method', 'strava_auto')
                .not('strava_activity_data', 'is', null);

            if (error) throw error;

            const validParticipants = (data || []).map(p => {
                const activity = p.strava_activity_data || {};
                const regSportType = p.sport_distance?.toLowerCase().includes('cycling') ? 'Cycling' : 'Running';
                const displayName = p.first_name
                    ? `${p.first_name} ${p.last_name || ''}`
                    : (p.full_name || 'Athlete');

                return {
                    id: p.id,
                    userId: p.user_id,
                    name: displayName.trim() || 'Athlete',
                    gender: p.gender || 'Male',
                    sportCategory: regSportType,
                    distance: (activity.distance || 0) / 1000,
                    time: activity.moving_time || 0,
                    activityId: activity.id,
                    startDate: activity.start_date,
                    regDistance: parseInt(p.sport_distance?.match(/\d+/)?.[0] || '0'),
                    isCurrentUser: user ? p.user_id === user.id : false
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
        fetchData();
        const interval = setInterval(() => fetchData(true), 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, [challengeName, user]);

    // Derived Logic and Sorting
    const filteredList = participants
        .filter(p => p.gender === gender && p.sportCategory === sport)
        .sort((a, b) => {
            if (sortBy === 'distance') {
                if (b.distance !== a.distance) return b.distance - a.distance;
                return a.time - b.time;
            } else {
                return a.time - b.time;
            }
        });

    const rankedList = filteredList.map((p, idx) => {
        const rank = idx + 1;
        const change = prevRanks.current[p.id] ? prevRanks.current[p.id] - rank : 0;
        return { ...p, rank, change };
    });

    useEffect(() => {
        const newRanks: Record<string, number> = {};
        rankedList.forEach(p => newRanks[p.id] = p.rank);
        prevRanks.current = newRanks;
    }, [participants, gender, sport, sortBy]);

    const top10 = rankedList.slice(0, 10);
    const podium = rankedList.slice(0, 3);
    const currentUserStats = rankedList.find(p => p.isCurrentUser);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <div className="min-h-screen bg-[#F8F9FC] font-sans flex flex-col relative">
            {/* Decorative Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-100/40 rounded-full blur-3xl opacity-50 -z-10" />
                <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl opacity-30 -z-10" />
            </div>

            <Header />

            <main className="flex-1 pt-24 pb-32 container mx-auto max-w-5xl px-4 relative z-10">
                {/* Hero Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 shadow-sm mb-4"
                    >
                        {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FC4C02]" /> : <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            {isUpdating ? 'Updating Live...' : `Updated ${lastUpdated.toLocaleTimeString()}`}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight"
                    >
                        {challengeName}
                    </motion.h1>
                    <div className="flex flex-col items-center gap-2 mt-3">
                        <PoweredByStrava variant="orange" />
                        <p className="text-xs text-slate-500 italic">
                            Your miles, our mission. Strava-powered precision.
                        </p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-white/60 overflow-hidden relative">

                    {/* Controls Bar */}
                    <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50">
                        <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                            <Button
                                variant={sport === 'Running' ? 'white' : 'ghost'}
                                onClick={() => setSport('Running')}
                                className={`rounded-lg px-6 h-9 ${sport === 'Running' ? 'shadow-sm text-[#FC4C02] font-bold' : 'text-slate-500'}`}
                            >
                                Running
                            </Button>
                            <Button
                                variant={sport === 'Cycling' ? 'white' : 'ghost'}
                                onClick={() => setSport('Cycling')}
                                className={`rounded-lg px-6 h-9 ${sport === 'Cycling' ? 'shadow-sm text-[#FC4C02] font-bold' : 'text-slate-500'}`}
                            >
                                Cycling
                            </Button>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Tabs value={gender} onValueChange={setGender} className="w-full md:w-auto">
                                <TabsList className="bg-slate-100 rounded-lg h-11 w-full">
                                    <TabsTrigger value="Male" className="w-full">Male</TabsTrigger>
                                    <TabsTrigger value="Female" className="w-full">Female</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                                <SelectTrigger className="w-full md:w-[160px] h-11 border-slate-200 bg-white">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="distance">Max Distance</SelectItem>
                                    <SelectItem value="time">Fastest Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="min-h-[600px] relative">
                        {loading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Loader2 className="w-12 h-12 animate-spin text-[#FC4C02]/50 mb-4" />
                                <p className="text-slate-400 font-medium">Loading Rankings...</p>
                            </div>
                        ) : participants.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                                    <Trophy className="w-12 h-12 opacity-30" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No Participants Yet</h3>
                                <p>Be the first to sync your Strava activity!</p>
                            </div>
                        ) : (
                            <div className="pb-8">
                                {/* Podium Section */}
                                <div className="pt-10 pb-12 bg-gradient-to-b from-orange-50/50 to-transparent">
                                    <div className="flex justify-center items-end gap-3 md:gap-8 min-h-[220px]">
                                        {podium[1] && <PodiumItem participant={podium[1]} place={2} delay={0.2} />}
                                        {podium[0] && <PodiumItem participant={podium[0]} place={1} delay={0} />}
                                        {podium[2] && <PodiumItem participant={podium[2]} place={3} delay={0.4} />}
                                    </div>
                                </div>

                                {/* List Section */}
                                <div className="px-4 md:px-8 space-y-3">
                                    <div className="grid grid-cols-12 gap-4 px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        <div className="col-span-1 text-center">Rank</div>
                                        <div className="col-span-6 md:col-span-5">Athlete</div>
                                        <div className="col-span-3 text-right">Distance</div>
                                        <div className="hidden md:block md:col-span-2 text-right">Time</div>
                                        <div className="col-span-2 md:col-span-1 text-center">Activity</div>
                                    </div>

                                    <AnimatePresence mode="popLayout">
                                        {top10.map((p, idx) => (
                                            <motion.div
                                                key={p.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                className={`group relative grid grid-cols-12 gap-4 items-center p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${p.isCurrentUser ? 'bg-orange-50 border-orange-200 shadow-md ring-1 ring-orange-200' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
                                            >
                                                {/* Rank */}
                                                <div className="col-span-1 flex flex-col items-center justify-center">
                                                    <span className={`text-xl font-bold font-mono ${p.rank <= 3 ? 'text-[#FC4C02]' : 'text-slate-400'}`}>#{p.rank}</span>
                                                    {p.change !== 0 && (
                                                        <span className={`text-[10px] font-bold flex items-center ${p.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {p.change > 0 ? <ArrowUp className="w-2 h-2" /> : <ArrowDown className="w-2 h-2" />}
                                                            {Math.abs(p.change)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Athlete */}
                                                <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md ring-2 ring-white ${getAvatarColor(p.name)}`}>
                                                        {p.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-slate-900 truncate leading-tight flex items-center gap-2">
                                                            {p.name}
                                                            {p.isCurrentUser && <span className="bg-[#FC4C02] text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                                                        </h4>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                                            {p.distance >= p.regDistance && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                                                            <span>{new Date(p.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="col-span-3 text-right">
                                                    <div className="text-lg md:text-xl font-bold font-mono text-slate-900 tracking-tight">
                                                        {p.distance.toFixed(2)}<span className="text-xs text-slate-400 ml-1">km</span>
                                                    </div>
                                                </div>

                                                <div className="hidden md:block col-span-2 text-right">
                                                    <div className="font-mono text-slate-600 font-medium bg-slate-50 inline-block px-2 py-1 rounded">
                                                        {formatTime(p.time)}
                                                    </div>
                                                </div>

                                                {/* Link - STRAVA COMPLIANCE: Must say "View on Strava" */}
                                                <div className="col-span-2 md:col-span-1 flex justify-center">
                                                    <a
                                                        href={`https://www.strava.com/activities/${p.activityId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#FC5200] hover:underline"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        <span className="hidden md:inline">View on Strava</span>
                                                        <span className="md:hidden">View</span>
                                                    </a>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* STRAVA COMPLIANCE: Required Leaderboard Disclaimer */}
                                <div className="mt-8 px-6 pb-6">
                                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                                        <LeaderboardDisclaimer className="justify-center" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Premium Sticky Footer */}
            <AnimatePresence>
                {!loading && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-50"
                    >
                        <div className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between ring-1 ring-white/10">
                            {user ? (
                                currentUserStats ? (
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-white/10 rounded-xl backdrop-blur-lg">
                                                <span className="text-[10px] uppercase font-bold text-slate-400">Rank</span>
                                                <span className="text-xl font-bold leading-none text-white">#{currentUserStats.rank}</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white flex items-center gap-2">
                                                    Your Performance
                                                    {currentUserStats.change > 0 && <span className="text-xs text-green-400 flex items-center bg-green-400/20 px-1.5 rounded"><ArrowUp className="w-3 h-3 mr-0.5" /> {currentUserStats.change}</span>}
                                                </div>
                                                <div className="text-sm text-slate-400 font-mono mt-0.5">
                                                    {currentUserStats.distance.toFixed(2)} km • {formatTime(currentUserStats.time)}
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" className="text-slate-900 border-white/20 hover:bg-white bg-white">
                                            My Dashboard
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                <Trophy className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <span className="text-slate-300 font-medium">Join the action to get ranked!</span>
                                        </div>
                                        <Button asChild size="sm" className="bg-[#FC4C02] hover:bg-[#E34402] text-white">
                                            <Link to="/dashboard">Go to Dashboard</Link>
                                        </Button>
                                    </div>
                                )
                            ) : (
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <UserIcon className="text-slate-300" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">Participating?</div>
                                            <div className="text-xs text-slate-400">Sign in to check your personal rank</div>
                                        </div>
                                    </div>
                                    <Button asChild size="sm" className="bg-[#FC4C02] hover:bg-[#E34402] text-white shadow-lg shadow-orange-500/20">
                                        <Link to="/login" state={{ from: window.location }}>
                                            Sign In Now
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Sub-components
const PodiumItem = ({ participant, place, delay }: { participant: any, place: number, delay: number }) => {
    const isFirst = place === 1;
    const height = isFirst ? 'h-40 md:h-48' : place === 2 ? 'h-32 md:h-36' : 'h-24 md:h-28';
    const podiumColor = isFirst ? 'bg-gradient-to-b from-yellow-300 to-yellow-500' : place === 2 ? 'bg-gradient-to-b from-slate-300 to-slate-400' : 'bg-gradient-to-b from-amber-600 to-amber-700';
    const ringColor = isFirst ? 'ring-yellow-400' : place === 2 ? 'ring-slate-300' : 'ring-amber-600';

    return (
        <div className="flex flex-col items-center group relative z-10">
            {/* Crown for 1st */}
            {isFirst && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay + 0.3 }}
                    className="absolute -top-16 text-4xl"
                >
                    👑
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay }}
                className="relative z-20 flex flex-col items-center"
            >
                <div className={`relative mb-3 ${isFirst ? 'scale-125' : 'scale-100'} transition-transform duration-300 group-hover:scale-[1.3]`}>
                    <div className={`w-16 h-16 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-xl font-bold text-white relative z-10 ${getAvatarColor(participant.name)} ring-2 ${ringColor}`}>
                        {participant.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-white text-xs font-bold py-0.5 px-2 rounded-full shadow-md z-20 whitespace-nowrap ${podiumColor}`}>
                        #{place}
                    </div>
                </div>

                <div className="text-center mb-2">
                    <div className="font-bold text-sm text-slate-800 w-24 truncate leading-tight">{participant.name.split(' ')[0]}</div>
                    <div className="font-mono text-xs text-slate-500 font-bold">{participant.distance.toFixed(1)}km</div>
                </div>
            </motion.div>

            {/* Podium Block */}
            <motion.div
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
                className={`${height} w-24 md:w-32 rounded-t-lg shadow-2xl relative overflow-hidden backdrop-blur-sm ${isFirst ? 'z-10 bg-gradient-to-t from-yellow-500/20 to-yellow-100/50 border-t border-yellow-200' : place === 2 ? 'bg-gradient-to-t from-slate-400/20 to-slate-100/50 border-t border-slate-200' : 'bg-gradient-to-t from-amber-700/20 to-amber-100/50 border-t border-amber-200'}`}
            >
                {/* Glossy Reflect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-50"></div>

                {/* Number */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-6xl font-black text-black/5 font-display">
                    {place}
                </div>
            </motion.div>
        </div>
    );
};

function getAvatarColor(name: string) {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = name.length % colors.length;
    return colors[index];
}

const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 ${className}`}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
