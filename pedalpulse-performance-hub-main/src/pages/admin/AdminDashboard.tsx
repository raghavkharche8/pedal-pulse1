import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertCircle, CheckCircle2, DollarSign, Package, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DashboardStats, Registration } from '@/types/admin';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboard = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalRegistrations: 0,
        pendingVerifications: 0,
        completedChallenges: 0,
        totalRevenue: 0,
        medalsShipped: 0,
        averageCompletionRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [registrationTrend, setRegistrationTrend] = useState<any[]>([]);
    const [challengeBreakdown, setChallengeBreakdown] = useState<any[]>([]);
    const [sportCompletion, setSportCompletion] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch all registrations
                const { data: allRegs, error: allError } = await supabase
                    .from('registrations')
                    .select('*');

                if (allError) throw allError;

                const registrations = allRegs as Registration[];

                // Calculate stats
                const pending = registrations.filter(r =>
                    r.verification_status === 'pending' && r.proof_submission_date
                ).length;

                const completed = registrations.filter(r =>
                    r.verification_status === 'approved'
                ).length;

                const shipped = registrations.filter(r =>
                    r.medal_delivery_status === 'delivered' || r.medal_delivery_status === 'dispatched'
                ).length;

                const paidRegistrations = registrations.filter(r => r.payment_status === 'paid');
                const revenue = paidRegistrations.length * 499; // Assuming 499 per registration

                const completionRate = paidRegistrations.length > 0
                    ? (completed / paidRegistrations.length) * 100
                    : 0;

                setStats({
                    totalRegistrations: registrations.length,
                    pendingVerifications: pending,
                    completedChallenges: completed,
                    totalRevenue: revenue,
                    medalsShipped: shipped,
                    averageCompletionRate: completionRate
                });

                // Registration trend (last 7 days)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    return date.toISOString().split('T')[0];
                });

                const trendData = last7Days.map(date => {
                    const count = registrations.filter(r =>
                        r.created_at.split('T')[0] === date
                    ).length;
                    return {
                        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                        registrations: count
                    };
                });
                setRegistrationTrend(trendData);

                // Challenge breakdown
                const challengeCounts: Record<string, number> = {};
                registrations.forEach(r => {
                    const challenge = r.challenge_name || 'Unknown';
                    challengeCounts[challenge] = (challengeCounts[challenge] || 0) + 1;
                });
                const challengeData = Object.entries(challengeCounts).map(([name, value]) => ({
                    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
                    value
                }));
                setChallengeBreakdown(challengeData);

                // Sport completion rate
                const sportData: Record<string, { total: number; completed: number }> = {};
                registrations.forEach(r => {
                    const sport = r.sport || 'Unknown';
                    if (!sportData[sport]) {
                        sportData[sport] = { total: 0, completed: 0 };
                    }
                    sportData[sport].total++;
                    if (r.verification_status === 'approved') {
                        sportData[sport].completed++;
                    }
                });

                const sportCompletionData = Object.entries(sportData).map(([name, data]) => ({
                    name,
                    rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
                }));
                setSportCompletion(sportCompletionData);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // Set up real-time subscription
        const channel = supabase
            .channel('dashboard-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'registrations'
                },
                () => {
                    fetchDashboardData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    if (loading) {
        return (
            <div className="space-y-8">
                <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                <p className="text-slate-500 mt-1">Real-time analytics and performance metrics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900">Total Registrations</CardTitle>
                        <Users className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">{stats.totalRegistrations}</div>
                        <p className="text-xs text-blue-600 mt-1">All time participants</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-900">Pending Verifications</CardTitle>
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-900">{stats.pendingVerifications}</div>
                        <p className="text-xs text-orange-600 mt-1">Awaiting review</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-900">Completed</CardTitle>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900">{stats.completedChallenges}</div>
                        <p className="text-xs text-green-600 mt-1">Successfully verified</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-900">Total Revenue</CardTitle>
                        <DollarSign className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-900">₹{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-purple-600 mt-1">Registration fees</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-pink-900">Medals Shipped</CardTitle>
                        <Package className="h-5 w-5 text-pink-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-pink-900">{stats.medalsShipped}</div>
                        <p className="text-xs text-pink-600 mt-1">Dispatched/Delivered</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-900">Completion Rate</CardTitle>
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-900">{stats.averageCompletionRate.toFixed(1)}%</div>
                        <p className="text-xs text-indigo-600 mt-1">Of paid registrations</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Registration Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Registration Trend (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={registrationTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                />
                                <Line type="monotone" dataKey="registrations" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Challenge Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Registrations by Challenge</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={challengeBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-15} textAnchor="end" height={80} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Sport Completion */}
                <Card>
                    <CardHeader>
                        <CardTitle>Completion Rate by Sport</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={sportCompletion}
                                    dataKey="rate"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, rate }) => `${name}: ${rate}%`}
                                    labelLine={{ stroke: '#64748b' }}
                                >
                                    {sportCompletion.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <a href="/admin/verifications" className="block p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-orange-900">Review Pending Submissions</p>
                                    <p className="text-sm text-orange-600">{stats.pendingVerifications} waiting</p>
                                </div>
                                <AlertCircle className="w-8 h-8 text-orange-600" />
                            </div>
                        </a>
                        <a href="/admin/shipping" className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-blue-900">Manage Shipping</p>
                                    <p className="text-sm text-blue-600">Update tracking info</p>
                                </div>
                                <Package className="w-8 h-8 text-blue-600" />
                            </div>
                        </a>
                        <a href="/admin/registrations" className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-green-900">View All Registrations</p>
                                    <p className="text-sm text-green-600">{stats.totalRegistrations} total</p>
                                </div>
                                <Users className="w-8 h-8 text-green-600" />
                            </div>
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
