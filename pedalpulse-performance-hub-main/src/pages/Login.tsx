import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Login = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // Redirect to where they came from or dashboard
    const from = location.state?.from?.pathname || '/dashboard';

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isSignUp) {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }

                if (!firstName || !lastName || !phone) {
                    throw new Error("Please fill in all details");
                }

                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/dashboard`,
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                            phone: phone,
                            full_name: `${firstName} ${lastName}`
                        }
                    }
                });
                if (error) throw error;

                if (data.user && !data.session) {
                    toast({
                        title: 'Account created! Please verify email.',
                        description: 'We have sent a verification link to your email. You must click it before you can log in.',
                        duration: 6000,
                    });
                } else {
                    toast({
                        title: 'Welcome!',
                        description: 'Your account has been created successfully.',
                    });
                    navigate(from, { replace: true });
                }

            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                toast({
                    title: 'Welcome back!',
                    description: 'You successfully logged in.',
                });
                navigate(from, { replace: true });
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: isSignUp ? 'Sign up failed' : 'Login failed',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            if (error) throw error;
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'OAuth Error',
                description: error.message,
            });
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
            <Header />

            <div className="flex-grow flex items-center justify-center pt-24 pb-12 px-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h1 className="font-display font-bold text-3xl text-slate-900 mb-2">
                                {isSignUp ? 'Create Account' : 'Welcome Back'}
                            </h1>
                            <p className="text-slate-500">
                                {isSignUp ? 'Join the community today' : 'Sign in to track your progress'}
                            </p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-4">
                            {isSignUp && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                placeholder="John"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                required
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                placeholder="Doe"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                required
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="9876543210"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="athlete@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    {!isSignUp && (
                                        <Link to="/forgot-password" className="text-xs text-primary font-medium hover:underline">
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            {isSignUp && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    isSignUp ? 'Sign Up' : 'Sign In'
                                )}
                            </Button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl font-medium border-slate-200 hover:bg-slate-50 relative group"
                            onClick={handleGoogleLogin}
                        >
                            <img
                                src="https://www.google.com/favicon.ico"
                                alt="Google"
                                className="w-5 h-5 absolute left-4 grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100"
                            />
                            {isSignUp ? 'Sign up with Google' : 'Login with Google'}
                        </Button>

                        <div className="mt-8 text-center bg-slate-50 -mx-8 -mb-8 p-6 border-t border-slate-100">
                            <p className="text-slate-600 text-sm">
                                {isSignUp ? 'Already have an account? ' : 'New here? '}
                                <button
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    className="text-primary font-semibold hover:underline inline-flex items-center gap-1 group"
                                >
                                    {isSignUp ? 'Sign In' : 'Create an account'}
                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Login;
