import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Check,
    X,
    Medal,
    ArrowRight,
    ChevronRight,
    Loader2,
    Sparkles
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const FreeRegistration = () => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        countryCode: '+91',
        phone: '',
        phoneConfirm: '',
        category: '',
        city: '',
        referralSource: ''
    });

    // Generate random names for autofill blocking
    const randomNames = useMemo(() => ({
        name: `field_${Math.random().toString(36).substring(7)}`,
        email: `field_${Math.random().toString(36).substring(7)}`,
        phone: `field_${Math.random().toString(36).substring(7)}`,
        phoneConfirm: `field_${Math.random().toString(36).substring(7)}`,
    }), []);

    const categories = [
        { value: 'running-5km', label: 'Running/Walking - 5 Km' },
        { value: 'running-10km', label: 'Running/Walking - 10 Km' },
        { value: 'running-21km', label: 'Running/Walking - 21 Km' },
        { value: 'cycling-10km', label: 'Cycling - 10 Km' },
        { value: 'cycling-25km', label: 'Cycling - 25 Km' },
        { value: 'cycling-50km', label: 'Cycling - 50 Km' },
        { value: 'cycling-100km', label: 'Cycling - 100 Km' },
    ];

    const referralSources = [
        { value: 'instagram', label: 'Instagram' },
        { value: 'facebook', label: 'Facebook' },
        { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'friend', label: 'Friend/Family' },
        { value: 'google', label: 'Google Search' },
        { value: 'other', label: 'Other' },
    ];

    const countryCodes = [
        { code: '+91', country: 'India', flag: '🇮🇳' },
        { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
        { code: '+44', country: 'UK', flag: '🇬🇧' },
        { code: '+61', country: 'Australia', flag: '🇦🇺' },
        { code: '+971', country: 'UAE', flag: '🇦🇪' },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.email || !formData.phone || !formData.phoneConfirm || !formData.category || !formData.city) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive"
            });
            return;
        }

        // Phone confirmation
        if (formData.phone !== formData.phoneConfirm) {
            toast({
                title: "Phone Numbers Don't Match",
                description: "Please ensure both phone numbers are identical.",
                variant: "destructive"
            });
            return;
        }

        // Phone validation
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            toast({
                title: "Invalid Phone Number",
                description: "Please enter a valid 10-digit Indian mobile number.",
                variant: "destructive"
            });
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid email address.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('free_registrations')
                .insert([
                    {
                        name: formData.name.trim(),
                        email: formData.email.toLowerCase().trim(),
                        phone_country_code: formData.countryCode,
                        phone: formData.phone.trim(),
                        category: formData.category,
                        city: formData.city.trim(),
                        referral_source: formData.referralSource || 'not_specified',
                        challenge_name: 'republic-day-2026',
                        registered_at: new Date().toISOString()
                    }
                ]);

            if (error) {
                throw error;
            }

            // ⭐ Send confirmation email
            try {
                const { error: emailError } = await supabase.functions.invoke('send-registration-email', {
                    body: {
                        to: formData.email.toLowerCase().trim(),
                        name: formData.name.trim(),
                        challengeName: 'Republic Day Virtual Challenge 2026',
                        registrationType: 'free',
                        category: formData.category
                    }
                });

                if (emailError) {
                    console.error('Email sending failed:', emailError);
                } else {
                    console.log('Confirmation email sent to:', formData.email);
                }
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
                // Don't fail registration if email fails - user is still registered
            }

            setIsSuccess(true);
            toast({
                title: "Registration Successful! 🎉",
                description: "You're now registered for the free challenge.",
            });

        } catch (error: any) {
            console.error('Registration error:', error);
            toast({
                title: "Registration Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success State
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <section className="pt-32 pb-20 min-h-[80vh] flex items-center">
                    <div className="container-premium">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto text-center"
                        >
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="font-display font-bold text-4xl md:text-5xl text-slate-900 mb-4">
                                You're Registered!
                            </h1>
                            <p className="text-lg text-slate-600 mb-8">
                                Welcome to the Republic Day Virtual Challenge 2026. Complete your activity between 26 Jan - 1 Feb and submit your proof.
                            </p>

                            {/* Upgrade CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border-2 border-amber-200 mb-8"
                            >
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <Sparkles className="w-6 h-6 text-amber-500" />
                                    <span className="font-display font-bold text-xl text-amber-700">Wait! Special Offer</span>
                                </div>
                                <p className="text-amber-800 mb-4">
                                    You can still upgrade to the <strong>Premium Package</strong> and receive a stunning <strong>Finisher Medal</strong> delivered to your doorstep!
                                </p>
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <span className="text-2xl font-bold text-slate-900">₹399</span>
                                    <span className="text-slate-500 line-through">₹449</span>
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">EARLY BIRD</span>
                                </div>
                                <Button
                                    asChild
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-display font-semibold px-8 py-6 h-auto rounded-xl shadow-lg"
                                >
                                    <a href="/challenges/republic-day-challenges-2026#pricing">
                                        Upgrade to Premium
                                        <Medal className="ml-2 w-5 h-5" />
                                    </a>
                                </Button>
                            </motion.div>

                            <a href="/" className="text-primary font-medium hover:underline">
                                ← Back to Home
                            </a>
                        </motion.div>
                    </div>
                </section>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hidden fields to defeat autofill */}
            <input type="text" name="fake_name" autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} />
            <input type="email" name="fake_email" autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} />
            <input type="tel" name="fake_phone" autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} />

            {/* Hero */}
            <section className="relative pt-32 pb-12 bg-gradient-to-b from-slate-50 to-white">
                <div className="container-premium">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="inline-block py-2 px-4 rounded-full bg-slate-100 text-slate-600 text-xs font-bold tracking-wider uppercase mb-4">
                            Free Registration
                        </span>
                        <h1 className="font-display font-bold text-4xl md:text-5xl text-slate-900 mb-4 tracking-tight">
                            Join the Challenge
                        </h1>
                        <p className="text-lg text-slate-600">
                            Republic Day Virtual Challenge • 26 Jan - 1 Feb 2026
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 bg-white">
                <div className="container-premium">
                    <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">

                        {/* Left: Form */}
                        <div className="lg:col-span-3">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
                            >
                                <h2 className="font-display font-bold text-2xl text-slate-900 mb-6">
                                    Registration Details
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                                    {/* Name */}
                                    <div>
                                        <Label htmlFor="name" className="text-slate-700 font-medium">
                                            Full Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name={randomNames.name}
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="mt-2 h-12"
                                            autoComplete="new-password"
                                            data-lpignore="true"
                                            data-form-type="other"
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <Label htmlFor="email" className="text-slate-700 font-medium">
                                            Email Address <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            name={randomNames.email}
                                            type="email"
                                            placeholder="your@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="mt-2 h-12"
                                            autoComplete="new-password"
                                            data-lpignore="true"
                                            data-form-type="other"
                                            required
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <Label htmlFor="phone" className="text-slate-700 font-medium">
                                            Phone Number <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="flex gap-3 mt-2">
                                            <select
                                                value={formData.countryCode}
                                                onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                                                className="w-32 h-12 px-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            >
                                                {countryCodes.map(item => (
                                                    <option key={item.code} value={item.code}>
                                                        {item.flag} {item.code}
                                                    </option>
                                                ))}
                                            </select>
                                            <Input
                                                id="phone"
                                                name={randomNames.phone}
                                                type="tel"
                                                placeholder="10-digit mobile number"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                                                className="flex-1 h-12"
                                                maxLength={10}
                                                autoComplete="new-password"
                                                data-lpignore="true"
                                                data-form-type="other"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Phone Confirm */}
                                    <div>
                                        <Label htmlFor="phoneConfirm" className="text-slate-700 font-medium">
                                            Re-enter Phone Number <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="phoneConfirm"
                                            name={randomNames.phoneConfirm}
                                            type="tel"
                                            placeholder="Re-enter your mobile number"
                                            value={formData.phoneConfirm}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phoneConfirm: e.target.value.replace(/\D/g, '') }))}
                                            className="mt-2 h-12"
                                            maxLength={10}
                                            autoComplete="new-password"
                                            data-lpignore="true"
                                            data-form-type="other"
                                            required
                                        />
                                        {formData.phone && formData.phoneConfirm && formData.phone !== formData.phoneConfirm && (
                                            <p className="text-red-500 text-sm mt-1">Phone numbers must match</p>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <Label htmlFor="category" className="text-slate-700 font-medium">
                                            Select Category <span className="text-red-500">*</span>
                                        </Label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="mt-2 w-full h-12 px-4 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            required
                                        >
                                            <option value="">Choose your category...</option>
                                            {categories.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* City */}
                                    <div>
                                        <Label htmlFor="city" className="text-slate-700 font-medium">
                                            City <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            type="text"
                                            placeholder="Your city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="mt-2 h-12"
                                            required
                                        />
                                    </div>

                                    {/* Referral Source */}
                                    <div>
                                        <Label htmlFor="referralSource" className="text-slate-700 font-medium">
                                            How did you find us?
                                        </Label>
                                        <select
                                            id="referralSource"
                                            name="referralSource"
                                            value={formData.referralSource}
                                            onChange={handleInputChange}
                                            className="mt-2 w-full h-12 px-4 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        >
                                            <option value="">Select an option...</option>
                                            {referralSources.map(src => (
                                                <option key={src.value} value={src.value}>{src.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-6 h-auto font-display font-bold text-lg bg-slate-900 hover:bg-slate-800 rounded-xl"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                                                Registering...
                                            </>
                                        ) : (
                                            <>
                                                Complete Free Registration
                                                <ArrowRight className="ml-2 w-5 h-5" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </motion.div>
                        </div>

                        {/* Right: What You're Missing */}
                        <div className="lg:col-span-2">
                            {/* Warning Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200 mb-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-lg text-red-800 mb-2">
                                            You're Missing Out!
                                        </h3>
                                        <p className="text-red-700 text-sm leading-relaxed">
                                            The free registration does <strong>NOT</strong> include the exclusive <strong>Premium Finisher Medal</strong> - a collectible you'll cherish forever!
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* What You Get (Free) */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-6"
                            >
                                <h3 className="font-display font-bold text-lg text-slate-900 mb-4">
                                    Free Package Includes:
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-sm text-slate-600">
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        Digital E-Certificate
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-slate-600">
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        Name on Finishers List
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-slate-600">
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        Customized Poster
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-slate-400 line-through">
                                        <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                                        Premium Finisher Medal
                                    </li>
                                </ul>
                            </motion.div>

                            {/* Upgrade CTA */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden"
                            >
                                {/* Decorative */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Medal className="w-6 h-6" />
                                        <span className="font-bold text-sm uppercase tracking-wider">Premium Package</span>
                                    </div>
                                    <h3 className="font-display font-bold text-2xl mb-2">
                                        Get Your Medal!
                                    </h3>
                                    <p className="text-white/90 text-sm mb-4">
                                        Don't just complete the challenge - celebrate it with a beautiful medal to treasure!
                                    </p>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="font-bold text-3xl">₹399</span>
                                        <span className="text-white/60 line-through text-lg">₹449</span>
                                        <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">+GST</span>
                                    </div>
                                    <Button
                                        asChild
                                        className="w-full bg-white hover:bg-slate-100 text-amber-600 font-display font-bold py-5 h-auto rounded-xl"
                                    >
                                        <a href="/challenges/republic-day-challenges-2026#pricing">
                                            Upgrade to Premium
                                            <ChevronRight className="ml-1 w-4 h-4" />
                                        </a>
                                    </Button>
                                    <p className="text-center text-white/70 text-xs mt-3">
                                        ⏰ Early bird ends 18th January
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default FreeRegistration;
