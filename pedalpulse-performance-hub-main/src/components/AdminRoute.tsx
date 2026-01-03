import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export const AdminRoute = () => {
    const { user, loading: authLoading } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // SECURITY: Check by user_id, not email (email can be spoofed)
                const { data, error } = await supabase
                    .from('admin_users')
                    .select('role')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (error && error.code !== 'PGRST116') {
                    // PGRST116 = no rows found, which is expected for non-admins
                    setIsAdmin(false);
                } else if (data) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch {
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };


        if (!authLoading) {
            checkAdminStatus();
        } else {
            console.log("AdminRoute: Waiting for Auth...");
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-slate-500">Verifying access...</span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                <p className="text-slate-500 mb-6">You do not have permission to access the admin panel.</p>
                <a href="/dashboard" className="text-primary hover:underline">Return to Dashboard</a>
            </div>
        );
    }

    return <Outlet />;
};
