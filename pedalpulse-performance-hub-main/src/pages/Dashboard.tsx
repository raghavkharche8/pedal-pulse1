import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

import { EditProfileModal } from '@/components/dashboard/EditProfileModal';
import { EditAddressModal } from '@/components/dashboard/EditAddressModal';
import { ProofSubmissionModal } from '@/components/dashboard/ProofSubmissionModal';
import { ViewSubmissionModal } from '@/components/dashboard/ViewSubmissionModal';
import { StravaConnect } from '@/components/dashboard/StravaConnect';
import { LogOut, User, Trophy, Calendar, MapPin, Loader2, Download, Truck, Edit2, Home, Activity } from 'lucide-react';

const Dashboard = () => {
    const { user, signOut } = useAuth();
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);

    const fetchRegistrations = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .eq('user_id', user.id)
                .eq('payment_status', 'completed') // Only show paid challenges
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRegistrations(data || []);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, [user]);

    const handleOpenSubmit = (reg: any) => {
        setSelectedRegistration(reg);
        setIsSubmitModalOpen(true);
    };

    const handleOpenView = (reg: any) => {
        setSelectedRegistration(reg);
        setIsViewModalOpen(true);
    };

    const handleResubmit = () => {
        setIsViewModalOpen(false);
        // Small delay to allow transition
        setTimeout(() => setIsSubmitModalOpen(true), 100);
    };

    // Derived User Data
    const meta = user?.user_metadata || {};
    const hasAddress = meta.address_line1 || meta.city;

    return (
        <div className="min-h-screen bg-neutral-50 font-sans">
            <Header />

            <main className="pt-32 pb-20 container-premium">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-900">Athlete Dashboard</h1>
                        <p className="text-slate-500 mt-2">Welcome back, {meta.first_name || user?.email}</p>
                    </div>

                    <Button onClick={signOut} variant="outline" className="gap-2">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Enhanced Profile Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit space-y-6">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                <User className="w-10 h-10" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900">
                                {meta.first_name ? `${meta.first_name} ${meta.last_name || ''}` : 'My Profile'}
                            </h3>
                            <p className="text-slate-500 text-sm">{user?.email}</p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm text-slate-900">Personal Details</h4>
                                <Button variant="ghost" size="sm" onClick={() => setIsEditProfileOpen(true)} className="h-8 w-8 p-0">
                                    <Edit2 className="w-4 h-4 text-slate-400 hover:text-primary" />
                                </Button>
                            </div>
                            <div className="text-sm text-slate-600 space-y-1">
                                <p><span className="text-slate-400">Phone:</span> {meta.phone || 'N/A'}</p>
                                <p><span className="text-slate-400">Gender:</span> {meta.gender || 'N/A'}</p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <h4 className="font-semibold text-sm text-slate-900">Shipping Address</h4>
                                <Button variant="ghost" size="sm" onClick={() => setIsEditAddressOpen(true)} className="h-8 w-8 p-0">
                                    <Edit2 className="w-4 h-4 text-slate-400 hover:text-primary" />
                                </Button>
                            </div>
                            <div className="text-sm text-slate-600">
                                {hasAddress ? (
                                    <>
                                        <p>{meta.address_line1}</p>
                                        {meta.address_line2 && <p>{meta.address_line2}</p>}
                                        <p>{meta.city}, {meta.state} - {meta.pincode}</p>
                                    </>
                                ) : (
                                    <p className="italic text-slate-400">No address saved</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Challenges Section */}
                    <div className="md:col-span-2 space-y-6">
                        <StravaConnect onSync={fetchRegistrations} />

                        {/* What's Next Block - Coach-like guidance */}
                        {registrations.length > 0 && !loading && (() => {
                            const pendingProof = registrations.find(r => !r.proof_submission_date && r.payment_status === 'completed');
                            const underReview = registrations.find(r => r.proof_submission_date && r.verification_status === 'pending');
                            const verified = registrations.find(r => r.verification_status === 'approved');

                            if (pendingProof) {
                                return (
                                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                                        <h4 className="font-semibold text-slate-900 mb-1">What's Next</h4>
                                        <p className="text-slate-600 text-sm">
                                            Complete your {pendingProof.sport_distance} and submit via Strava.
                                            <span className="text-slate-400 block mt-1">Deadline: Jan 26, 2026</span>
                                        </p>
                                    </div>
                                );
                            } else if (underReview) {
                                return (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                                        <h4 className="font-semibold text-slate-900 mb-1">Almost There</h4>
                                        <p className="text-slate-600 text-sm">
                                            Your activity is under review. Sit tight.
                                        </p>
                                    </div>
                                );
                            } else if (verified) {
                                return (
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                                        <h4 className="font-semibold text-slate-900 mb-1">You Did It 🎉</h4>
                                        <p className="text-slate-600 text-sm">
                                            Your medal is on its way. Check tracking below.
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        <h3 className="font-bold text-xl text-slate-900">My Challenges</h3>

                        {loading ? (
                            /* Skeleton Loader - Shows structure, says "I know what's coming" */
                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-3 flex-1">
                                                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                                <div className="h-6 w-48 bg-slate-200 rounded"></div>
                                                <div className="flex gap-4">
                                                    <div className="h-4 w-20 bg-slate-100 rounded"></div>
                                                    <div className="h-4 w-32 bg-slate-100 rounded"></div>
                                                </div>
                                            </div>
                                            <div className="h-10 w-28 bg-slate-200 rounded-lg"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : registrations.length > 0 ? (
                            <div className="grid gap-4">
                                {registrations.map((reg) => {
                                    if (!reg) return null;

                                    // Determine Status Display
                                    const isPaid = reg.payment_status === 'completed';
                                    const hasSubmitted = !!reg.proof_submission_date;
                                    const verificationStatus = reg.verification_status;

                                    return (
                                        <div key={reg.id || Math.random()} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {isPaid ? (
                                                            hasSubmitted ? (
                                                                <Badge variant={verificationStatus === 'rejected' ? 'destructive' : 'outline'} className={
                                                                    verificationStatus === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                        verificationStatus === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                                }>
                                                                    {verificationStatus === 'rejected' ? 'Proof Rejected' :
                                                                        verificationStatus === 'approved' ? 'Verified' : 'Under Review'}
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Registered</Badge>
                                                            )
                                                        ) : (
                                                            null
                                                        )}
                                                        <span className="text-xs text-slate-400 font-mono">#{String(reg.id || '').slice(0, 8)}</span>
                                                    </div>
                                                    <h4 className="font-display font-bold text-xl text-slate-900">{reg.challenge_name || 'Challenge Name'}</h4>
                                                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                                                        <div className="flex items-center gap-1.5">
                                                            <Trophy className="w-4 h-4 text-primary" />
                                                            {reg.sport_distance || 'Distance'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="w-4 h-4 text-slate-400" />
                                                            {reg.city || 'City'}, {reg.state || 'State'}
                                                        </div>
                                                    </div>

                                                    {/* Strava Activity Details */}
                                                    {reg.strava_activity_data && (
                                                        <div className="mt-4 bg-[#FC4C02]/5 p-3 rounded-lg border border-[#FC4C02]/10 text-sm">
                                                            <div className="flex items-center gap-2 font-semibold text-[#FC4C02]">
                                                                <Activity className="w-3.5 h-3.5" />
                                                                <span>Matched: {reg.strava_activity_data.name}</span>
                                                            </div>
                                                            <div className="flex gap-4 mt-1.5 text-slate-600 text-xs pl-5.5">
                                                                <span className="font-medium">{(reg.strava_activity_data.distance / 1000).toFixed(2)} km</span>
                                                                <span className="text-slate-400">•</span>
                                                                <span>{new Date(reg.strava_activity_data.start_date).toLocaleDateString()}</span>
                                                                <span className="text-slate-400">•</span>
                                                                <span>
                                                                    {Math.floor(reg.strava_activity_data.moving_time / 3600)}h {Math.floor((reg.strava_activity_data.moving_time % 3600) / 60)}m
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2 min-w-[140px]">
                                                    {isPaid ? (
                                                        hasSubmitted ? (
                                                            <>
                                                                <Button onClick={() => handleOpenView(reg)} variant="outline" className="w-full border-slate-200">
                                                                    View Submission
                                                                </Button>
                                                                {verificationStatus === 'approved' && reg.certificate_url && (
                                                                    <Button
                                                                        variant="default"
                                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                                        onClick={() => window.open(reg.certificate_url, '_blank')}
                                                                    >
                                                                        <Download className="w-4 h-4 mr-2" />
                                                                        Certificate
                                                                    </Button>
                                                                )}
                                                                {reg.medal_delivery_status === 'dispatched' && reg.medal_tracking_number && (
                                                                    <Button
                                                                        variant="secondary"
                                                                        className="w-full"
                                                                        onClick={() => window.open(`https://shiprocket.co/tracking/${reg.medal_tracking_number}`, '_blank')}
                                                                    >
                                                                        <Truck className="w-4 h-4 mr-2" />
                                                                        Track Medal
                                                                    </Button>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <Button onClick={() => handleOpenSubmit(reg)} className="w-full">
                                                                Submit Proof
                                                            </Button>
                                                        )
                                                    ) : (
                                                        <Button className="w-full">
                                                            Complete Payment
                                                        </Button>
                                                    )}

                                                    {isPaid && (
                                                        <Button asChild variant="outline" className="w-full mt-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 transition-all shadow-sm">
                                                            <Link to={`/challenge/${reg.challenge_name === 'Republic Day 2026' ? 'republic-day-challenges-2026' : reg.challenge_name.toLowerCase().replace(/\s+/g, '-')}/leaderboard`}>
                                                                <Trophy className="w-4 h-4 mr-2" /> Live Leaderboard
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Empty State - Normalize emptiness, invite action */
                            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Trophy className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="font-semibold text-lg text-slate-900 mb-2">Nothing here yet</h3>
                                <p className="text-slate-500 mb-6">
                                    That changes after your first ride.
                                </p>
                                <Button asChild size="lg" className="rounded-xl">
                                    <Link to="/challenges">Find a Challenge</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <ProofSubmissionModal
                    isOpen={isSubmitModalOpen}
                    onClose={() => setIsSubmitModalOpen(false)}
                    registration={selectedRegistration}
                    onSuccess={fetchRegistrations}
                />

                <ViewSubmissionModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    registration={selectedRegistration}
                    onResubmit={handleResubmit}
                />

                <EditProfileModal
                    isOpen={isEditProfileOpen}
                    onClose={() => setIsEditProfileOpen(false)}
                    onSuccess={() => window.location.reload()} // Force reload to update auth state display if needed, or useAuth checks
                />

                <EditAddressModal
                    isOpen={isEditAddressOpen}
                    onClose={() => setIsEditAddressOpen(false)}
                    onSuccess={() => {
                        fetchRegistrations();
                        window.location.reload();
                    }}
                />
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
