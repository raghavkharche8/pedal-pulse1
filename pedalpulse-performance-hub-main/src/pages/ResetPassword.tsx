import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if user has a valid recovery session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsValidSession(!!session);
        };
        checkSession();

        // Listen for password recovery event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsValidSession(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setIsComplete(true);
            toast.success('Password updated successfully!');

            // Redirect to dashboard after a delay
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error: any) {
            toast.error(error.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidSession === null) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isValidSession) {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
                <Header />
                <div className="flex-grow flex items-center justify-center pt-24 pb-12 px-4">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
                        <h1 className="font-display font-bold text-2xl text-slate-900 mb-4">
                            Invalid or Expired Link
                        </h1>
                        <p className="text-slate-500 mb-6">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>
                        <Button onClick={() => navigate('/forgot-password')} className="w-full">
                            Request New Link
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
            <Header />

            <div className="flex-grow flex items-center justify-center pt-24 pb-12 px-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isComplete ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                                {isComplete ? <CheckCircle className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                            </div>
                            <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">
                                {isComplete ? 'Password Updated!' : 'Set New Password'}
                            </h1>
                            <p className="text-slate-500 text-sm">
                                {isComplete
                                    ? 'Redirecting you to your dashboard...'
                                    : 'Enter your new password below'
                                }
                            </p>
                        </div>

                        {!isComplete && (
                            <form onSubmit={handleReset} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="h-12 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="h-12 rounded-xl"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 mt-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Update Password'
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ResetPassword;
