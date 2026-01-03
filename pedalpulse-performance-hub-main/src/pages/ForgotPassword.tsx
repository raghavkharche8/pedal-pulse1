import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { toast } = useToast();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/dashboard/reset-password`,
            });

            if (error) throw error;

            setIsSubmitted(true);
            toast({
                title: 'Check your email',
                description: 'We have sent you a password reset link.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
            <Header />

            <div className="flex-grow flex items-center justify-center pt-24 pb-12 px-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8">
                        <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Login
                        </Link>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">
                                Forgot Password?
                            </h1>
                            <p className="text-slate-500 text-sm">
                                Enter your email and we'll send you instructions to reset your password.
                            </p>
                        </div>

                        {isSubmitted ? (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
                                <h3 className="text-green-800 font-semibold mb-2">Email Sent!</h3>
                                <p className="text-sm text-green-700 mb-4">
                                    Check <span className="font-bold">{email}</span> for a link to reset your password.
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full border-green-200 text-green-700 hover:bg-green-100"
                                    onClick={() => setIsSubmitted(false)}
                                >
                                    Try another email
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleReset} className="space-y-4">
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

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 mt-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Send Reset Link'
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

export default ForgotPassword;
