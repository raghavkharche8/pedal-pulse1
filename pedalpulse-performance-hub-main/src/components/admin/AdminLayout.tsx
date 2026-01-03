import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    LayoutDashboard,
    CheckCircle2,
    List,
    Truck,
    BarChart3,
    LogOut,
    Bell,
    Menu,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const { signOut, user } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    // Fetch pending verifications count with real-time updates
    useEffect(() => {
        const fetchPendingCount = async () => {
            const { count } = await supabase
                .from('registrations')
                .select('*', { count: 'exact', head: true })
                .eq('verification_status', 'pending')
                .not('proof_submission_date', 'is', null);

            setPendingCount(count || 0);
        };

        fetchPendingCount();

        // Set up real-time subscription
        const channel = supabase
            .channel('admin-pending-count')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'registrations',
                    filter: 'verification_status=eq.pending'
                },
                () => {
                    fetchPendingCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, badge: null },
        { name: 'Pending Verifications', path: '/admin/verifications', icon: CheckCircle2, badge: pendingCount },
        { name: 'All Registrations', path: '/admin/registrations', icon: List, badge: null },
        { name: 'Shipping', path: '/admin/shipping', icon: Truck, badge: null },
        { name: 'Reports', path: '/admin/reports', icon: BarChart3, badge: null },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white fixed h-full z-10">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="font-display font-bold text-xl tracking-tight text-white">
                        <span className="text-primary">Pedal</span>Pulse<span className="text-xs text-slate-400 ml-1 font-sans font-normal absolute mt-1">Admin</span>
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive(item.path)
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </div>
                            {item.badge !== null && item.badge > 0 && (
                                <Badge className="bg-orange-600 hover:bg-orange-700 text-white">
                                    {item.badge}
                                </Badge>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Button
                        variant="ghost"
                        onClick={signOut}
                        className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-20 flex items-center justify-between p-4">
                <span className="font-bold">Admin Panel</span>
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 z-10 bg-slate-900 pt-16">
                    <nav className="p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-base font-medium",
                                    isActive(item.path)
                                        ? "bg-primary text-white"
                                        : "text-slate-400"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </div>
                                {item.badge !== null && item.badge > 0 && (
                                    <Badge className="bg-orange-600">
                                        {item.badge}
                                    </Badge>
                                )}
                            </Link>
                        ))}
                        <Button
                            variant="ghost"
                            onClick={signOut}
                            className="w-full justify-start text-slate-400 mt-8"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 md:ml-64 pt-16 md:pt-0">
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-5">
                    <div className="text-sm font-medium text-slate-500">
                        {navItems.find(i => isActive(i.path))?.name || 'Admin'}
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            {pendingCount > 0 && (
                                <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] text-center">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-900">Admin User</p>
                                <p className="text-xs text-slate-500">{user?.email}</p>
                            </div>
                            <div className="w-9 h-9 bg-gradient-to-br from-primary to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
