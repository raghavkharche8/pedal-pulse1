import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    Check,
    Medal,
    Loader2,
    Tag,
    X,
    ChevronDown,
    MapPin,
    User,
    Mail,
    Phone,
    Home,
    Gift,
    AlertCircle,
    CheckCircle2,
    Shield,
    Clock,
    Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Country codes with flags
const COUNTRY_CODES = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'USA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
];

// Challenge categories
const CHALLENGE_CATEGORIES = [
    { id: 'running-5km', label: '5 Km', type: 'Running/Walking', icon: '🏃' },
    { id: 'running-10km', label: '10 Km', type: 'Running/Walking', icon: '🏃' },
    { id: 'running-21km', label: '21 Km (Half Marathon)', type: 'Running/Walking', icon: '🏃' },
    { id: 'cycling-10km', label: '10 Km', type: 'Cycling', icon: '🚴' },
    { id: 'cycling-25km', label: '25 Km', type: 'Cycling', icon: '🚴' },
    { id: 'cycling-50km', label: '50 Km', type: 'Cycling', icon: '🚴' },
    { id: 'cycling-100km', label: '100 Km', type: 'Cycling', icon: '🚴' },
];

// Referral sources
const REFERRAL_SOURCES = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'friend', label: 'Friend/Family' },
    { value: 'google', label: 'Google Search' },
    { value: 'previous_event', label: 'Previous Event' },
    { value: 'other', label: 'Other' },
];

// Pricing
const BASE_PRICE = 399;
const GST_PERCENTAGE = 18;

// Character limit input component
const CharacterLimitInput = ({
    id,
    label,
    value,
    onChange,
    maxLength = 90,
    placeholder,
    required = true,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    maxLength?: number;
    placeholder: string;
    required?: boolean;
}) => {
    const remaining = maxLength - value.length;
    const isNearLimit = remaining <= 20;
    const isAtLimit = remaining <= 0;

    const randomSuffix = useMemo(() => Math.random().toString(36).substring(7), []);

    return (
        <div>
            <Label htmlFor={id} className="text-sm font-medium text-slate-700 mb-1.5 block">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
                <Input
                    id={id}
                    name={`${id}_${randomSuffix}`}
                    value={value}
                    onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                    data-lpignore="true"
                    className="pr-16"
                    required={required}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-slate-400'
                    }`}>
                    {remaining} left
                </span>
            </div>
        </div>
    );
};

declare global {
    interface Window {
        Razorpay: any;
    }
}

const PremiumRegistration = () => {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        countryCode: '+91',
        phone: '',
        confirmPhone: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        pincode: '',
        city: '',
        state: '',
        country: 'India',
        category: '',
        referralSource: '',
        couponCode: '',
    });

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [isPincodeLoading, setIsPincodeLoading] = useState(false);
    const [isCouponLoading, setIsCouponLoading] = useState(false);
    const [couponApplied, setCouponApplied] = useState<{
        isValid: boolean;
        discount: number;
        message: string;
    } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

    // Calculate pricing
    const discountAmount = couponApplied?.isValid ? couponApplied.discount : 0;
    const priceAfterDiscount = BASE_PRICE - discountAmount;
    const gstAmount = Math.round(priceAfterDiscount * GST_PERCENTAGE / 100);
    const totalAmount = priceAfterDiscount + gstAmount;

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Fetch city/state from pincode
    const fetchPincodeDetails = async (pincode: string) => {
        if (pincode.length !== 6) return;

        setIsPincodeLoading(true);
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
                const postOffice = data[0].PostOffice[0];
                setFormData(prev => ({
                    ...prev,
                    city: postOffice.District || '',
                    state: postOffice.State || '',
                }));
            }
        } catch (error) {
            console.error('Error fetching pincode details:', error);
        } finally {
            setIsPincodeLoading(false);
        }
    };

    // Validate coupon
    const validateCoupon = async () => {
        if (!formData.couponCode.trim()) {
            toast({
                title: 'Enter Coupon Code',
                description: 'Please enter a coupon code to apply.',
                variant: 'destructive',
            });
            return;
        }

        setIsCouponLoading(true);
        try {
            const { data, error } = await supabase.rpc('validate_coupon', {
                coupon_code_input: formData.couponCode.toUpperCase(),
                order_amount: BASE_PRICE,
            });

            if (error) throw error;

            if (data && data.length > 0) {
                const result = data[0];
                setCouponApplied({
                    isValid: result.is_valid,
                    discount: result.final_discount || 0,
                    message: result.message,
                });

                if (result.is_valid) {
                    toast({
                        title: 'Coupon Applied! 🎉',
                        description: result.message,
                    });
                } else {
                    toast({
                        title: 'Invalid Coupon',
                        description: result.message,
                        variant: 'destructive',
                    });
                }
            }
        } catch (error) {
            console.error('Error validating coupon:', error);
            toast({
                title: 'Error',
                description: 'Failed to validate coupon. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsCouponLoading(false);
        }
    };

    // Remove coupon
    const removeCoupon = () => {
        setCouponApplied(null);
        setFormData(prev => ({ ...prev, couponCode: '' }));
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (formData.phone.length !== 10) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (formData.phone !== formData.confirmPhone) {
            newErrors.confirmPhone = 'Phone numbers do not match';
        }

        if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
        if (!formData.addressLine2.trim()) newErrors.addressLine2 = 'Area/Street is required';
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        else if (formData.pincode.length !== 6) {
            newErrors.pincode = 'Pincode must be 6 digits';
        }
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.category) newErrors.category = 'Please select a category';
        if (!formData.referralSource) newErrors.referralSource = 'Please select how you found us';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast({
                title: 'Please fix the errors',
                description: 'Some required fields are missing or invalid.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setStep('processing');

        try {
            // Create registration record using RPC (bypasses RLS issues)
            const registrationPayload = {
                name: formData.name,
                email: formData.email,
                phone_country_code: formData.countryCode,
                phone: formData.phone,
                address_line1: formData.addressLine1,
                address_line2: formData.addressLine2,
                landmark: formData.landmark || null,
                pincode: formData.pincode,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                category: formData.category,
                referral_source: formData.referralSource,
                coupon_code: couponApplied?.isValid ? formData.couponCode.toUpperCase() : null,
                coupon_discount: discountAmount,
                base_amount: BASE_PRICE,
                discount_amount: discountAmount,
                gst_amount: gstAmount,
                total_amount: totalAmount
            };

            const { data: registration, error: regError } = await supabase.rpc('create_premium_registration', {
                payload: registrationPayload
            });

            if (regError) throw regError;

            // STEP 1: Create Razorpay Order with Auto-Capture (CRITICAL for production)
            console.log('Creating Razorpay order for registration:', registration.id);

            const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
                body: {
                    amount: totalAmount * 100, // in paise
                    currency: 'INR',
                    receipt: `rcpt_${registration.id.slice(-12)}_${Date.now().toString().slice(-8)}`, // Max 40 chars
                    notes: {
                        registration_id: registration.id,
                        email: formData.email,
                        category: formData.category,
                        name: formData.name
                    }
                }
            });

            if (orderError || !orderData?.success) {
                console.error('Failed to create Razorpay order:', orderError || orderData);
                console.error('Order data response:', orderData);
                console.error('Order error details:', orderError);
                throw new Error(orderData?.error || orderError?.message || 'Failed to create payment order. Please try again.');
            }

            const razorpayOrder = orderData.order;
            console.log('Razorpay order created successfully:', razorpayOrder.id);

            // STEP 2: Store order_id in database for tracking
            const { error: orderUpdateError } = await supabase
                .from('premium_registrations')
                .update({ razorpay_order_id: razorpayOrder.id })
                .eq('id', registration.id);

            if (orderUpdateError) {
                console.error('Failed to update order_id:', orderUpdateError);
                // Don't fail the payment, just log it
            }

            // STEP 3: Create Razorpay checkout options with order_id
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                order_id: razorpayOrder.id, // ⭐ CRITICAL: This enables proper order tracking and auto-capture
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: 'PedalPulse',
                description: `Republic Day Challenge 2026 - ${formData.category.replace('-', ' ').replace('km', ' Km')}`,
                image: '/Logo/Logo.png',
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: `${formData.countryCode}${formData.phone}`,
                },
                notes: razorpayOrder.notes,
                theme: {
                    color: '#F97316',
                },
                handler: async function (response: any) {
                    // ✅ LEVEL 2 SECURITY: Verify payment signature via database RPC
                    const { data, error: updateError } = await supabase.rpc('verify_and_update_payment', {
                        params: {
                            reg_id: registration.id,
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        }
                    });

                    if (updateError || !data?.success) {
                        console.error('Payment verification failed:', updateError || data);
                        toast({
                            title: 'Payment Verification Failed',
                            description: data?.error || updateError?.message || 'Your payment could not be verified. Please contact support.',
                            variant: 'destructive',
                        });
                        setStep('form');
                        setIsLoading(false);
                        return;
                    }

                    // Increment coupon usage if applied
                    if (couponApplied?.isValid) {
                        await supabase.rpc('increment_coupon_usage', {
                            coupon_code_input: formData.couponCode.toUpperCase(),
                        });
                    }

                    // ⭐ Send confirmation email
                    try {
                        const { error: emailError } = await supabase.functions.invoke('send-registration-email', {
                            body: {
                                to: formData.email.toLowerCase().trim(),
                                name: formData.name.trim(),
                                challengeName: 'Republic Day Virtual Challenge 2026',
                                registrationType: 'premium',
                                category: formData.category,
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                address: {
                                    addressLine1: formData.addressLine1.trim(),
                                    addressLine2: formData.addressLine2.trim(),
                                    city: formData.city.trim(),
                                    state: formData.state.trim(),
                                    pincode: formData.pincode.trim()
                                },
                                phone: formData.phone.trim(),
                                phoneCountryCode: formData.countryCode
                            }
                        });

                        if (emailError) {
                            console.error('Email sending failed:', emailError);
                        } else {
                            console.log('Confirmation email sent to:', formData.email);
                        }
                    } catch (emailError) {
                        console.error('Failed to send confirmation email:', emailError);
                        // Don't fail registration if email fails - payment already successful
                    }

                    setStep('success');
                    setIsLoading(false);
                },
                modal: {
                    ondismiss: function () {
                        setStep('form');
                        setIsLoading(false);
                        toast({
                            title: 'Payment Cancelled',
                            description: 'You can try again when ready.',
                            variant: 'destructive',
                        });
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error: any) {
            console.error('Error during registration:', error);
            setStep('form');
            setIsLoading(false);

            // Show more specific error
            let errorMessage = 'Something went wrong. Please try again.';
            if (error?.message?.includes('relation "premium_registrations" does not exist')) {
                errorMessage = 'Database setup incomplete (Table missing). Please contact support.';
            } else if (error?.message) {
                errorMessage = error.message;
            }

            toast({
                title: 'Registration Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    // Handle input changes
    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Handle phone input (numbers only)
    const handlePhoneInput = (field: string, value: string) => {
        const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
        handleChange(field, numbersOnly);
    };

    // Handle pincode input
    const handlePincodeInput = (value: string) => {
        const numbersOnly = value.replace(/\D/g, '').slice(0, 6);
        handleChange('pincode', numbersOnly);
        if (numbersOnly.length === 6) {
            fetchPincodeDetails(numbersOnly);
        }
    };

    // Success screen
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <section className="pt-32 pb-20">
                    <div className="container-premium">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto text-center"
                        >
                            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-12 h-12 text-white" strokeWidth={3} />
                            </div>
                            <h1 className="font-display font-bold text-4xl md:text-5xl text-slate-900 mb-4">
                                You're All Set! 🎉
                            </h1>
                            <p className="text-xl text-slate-600 mb-8">
                                Your registration for the Republic Day Challenge 2026 is confirmed!
                            </p>
                            <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left">
                                <h3 className="font-display font-bold text-lg mb-4">What's Next?</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 text-primary mt-0.5" />
                                        <span className="text-slate-600">Check your email for confirmation details</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-primary mt-0.5" />
                                        <span className="text-slate-600">Complete your activity: 26 Jan - 1 Feb 2026</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Truck className="w-5 h-5 text-primary mt-0.5" />
                                        <span className="text-slate-600">Medal dispatch: 3-4 days after challenge ends</span>
                                    </li>
                                </ul>
                            </div>
                            <Button asChild className="bg-primary hover:bg-primary/90 px-8 py-6 h-auto text-lg">
                                <Link to="/challenges/republic-day-challenges-2026">
                                    Back to Challenge Page
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </section>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <Header />

            <section className="pt-28 pb-16">
                <div className="container-premium">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-bold mb-4">
                            <Medal className="w-4 h-4" />
                            Premium Registration
                        </div>
                        <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-900 mb-3">
                            Republic Day Challenge 2026
                        </h1>
                        <p className="text-slate-600">
                            Complete the form below to secure your spot and premium finisher medal!
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-2"
                        >
                            <form
                                ref={formRef}
                                onSubmit={handleSubmit}
                                autoComplete="off"
                                className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100"
                            >
                                {/* Hidden field to absolutely destroy autocomplete attempts */}
                                <input type="text" name="username_hidden_field_123" style={{ display: 'none' }} autoComplete="off" />
                                <input type="email" name="email_hidden_field_123" style={{ display: 'none' }} autoComplete="off" />
                                <input type="password" name="password_hidden_field_123" style={{ display: 'none' }} autoComplete="off" />
                                <input type="tel" name="phone_hidden_field_123" style={{ display: 'none' }} autoComplete="off" />
                                <input type="text" name="address_hidden_field_123" style={{ display: 'none' }} autoComplete="off" />

                                {/* Personal Details */}
                                <div className="mb-8">
                                    <h3 className="font-display font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Personal Details
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name" className="text-sm font-medium text-slate-700 mb-1.5 block">
                                                Full Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                name="fullname_reg"
                                                value={formData.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                placeholder="Enter your full name"
                                                autoComplete="off"
                                                data-form-type="other"
                                                data-lpignore="true"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-1.5 block">
                                                Email Address <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="email"
                                                name="user_email_random_x9z"
                                                type="text"
                                                inputMode="email"
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                placeholder="your.email@example.com"
                                                autoComplete="new-password"
                                                data-form-type="other"
                                                data-lpignore="true"
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>
                                    </div>

                                    {/* Phone Numbers */}
                                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                                Phone Number <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="flex gap-2">
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                        className="flex items-center gap-1 px-3 h-10 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
                                                    >
                                                        <span className="text-lg">
                                                            {COUNTRY_CODES.find(c => c.code === formData.countryCode)?.flag}
                                                        </span>
                                                        <span className="text-sm font-medium">{formData.countryCode}</span>
                                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                    <AnimatePresence>
                                                        {showCountryDropdown && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                                className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto"
                                                            >
                                                                {COUNTRY_CODES.map((country) => (
                                                                    <button
                                                                        key={country.code}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handleChange('countryCode', country.code);
                                                                            setShowCountryDropdown(false);
                                                                        }}
                                                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
                                                                    >
                                                                        <span className="text-lg">{country.flag}</span>
                                                                        <span className="text-sm">{country.country}</span>
                                                                        <span className="text-sm text-slate-500 ml-auto">{country.code}</span>
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                                <Input
                                                    id="phone"
                                                    name="phone_reg_random_123"
                                                    value={formData.phone}
                                                    onChange={(e) => handlePhoneInput('phone', e.target.value)}
                                                    placeholder="10-digit number"
                                                    autoComplete="new-password"
                                                    data-form-type="other"
                                                    data-lpignore="true"
                                                    className={`flex-1 ${errors.phone ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="confirmPhone" className="text-sm font-medium text-slate-700 mb-1.5 block">
                                                Re-enter Phone Number <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="confirmPhone"
                                                name="confirmphone_reg_random_456"
                                                value={formData.confirmPhone}
                                                onChange={(e) => handlePhoneInput('confirmPhone', e.target.value)}
                                                placeholder="Re-enter 10-digit number"
                                                autoComplete="new-password"
                                                data-form-type="other"
                                                data-lpignore="true"
                                                className={errors.confirmPhone ? 'border-red-500' : ''}
                                            />
                                            {errors.confirmPhone && <p className="text-red-500 text-xs mt-1">{errors.confirmPhone}</p>}
                                            {formData.phone && formData.confirmPhone && formData.phone === formData.confirmPhone && (
                                                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Phone numbers match
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Address Details */}
                                <div className="mb-8">
                                    <h3 className="font-display font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                        <Home className="w-5 h-5 text-primary" />
                                        Shipping Address
                                    </h3>
                                    <div className="space-y-4">
                                        <CharacterLimitInput
                                            id="addressLine1"
                                            label="Flat, House no., Building, Apartment"
                                            value={formData.addressLine1}
                                            onChange={(value) => handleChange('addressLine1', value)}
                                            placeholder="e.g., Flat 42, Tower B, Paradise Apartments"
                                        />
                                        {errors.addressLine1 && <p className="text-red-500 text-xs -mt-3">{errors.addressLine1}</p>}

                                        <CharacterLimitInput
                                            id="addressLine2"
                                            label="Area, Street, Sector, Village"
                                            value={formData.addressLine2}
                                            onChange={(value) => handleChange('addressLine2', value)}
                                            placeholder="e.g., Sector 15, Near City Mall"
                                        />
                                        {errors.addressLine2 && <p className="text-red-500 text-xs -mt-3">{errors.addressLine2}</p>}

                                        <div>
                                            <Label htmlFor="landmark" className="text-sm font-medium text-slate-700 mb-1.5 block">
                                                Landmark <span className="text-slate-400">(Optional)</span>
                                            </Label>
                                            <Input
                                                id="landmark"
                                                name="landmark_reg"
                                                value={formData.landmark}
                                                onChange={(e) => handleChange('landmark', e.target.value)}
                                                placeholder="e.g., Near Metro Station"
                                                autoComplete="off"
                                                data-form-type="other"
                                                data-lpignore="true"
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="pincode" className="text-sm font-medium text-slate-700 mb-1.5 block">
                                                    Pincode <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="pincode"
                                                        name="pincode_reg"
                                                        value={formData.pincode}
                                                        onChange={(e) => handlePincodeInput(e.target.value)}
                                                        placeholder="6-digit code"
                                                        autoComplete="off"
                                                        data-form-type="other"
                                                        data-lpignore="true"
                                                        className={errors.pincode ? 'border-red-500' : ''}
                                                    />
                                                    {isPincodeLoading && (
                                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                                                    )}
                                                </div>
                                                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="city" className="text-sm font-medium text-slate-700 mb-1.5 block">
                                                    City/Town <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="city"
                                                    name="city_reg"
                                                    value={formData.city}
                                                    onChange={(e) => handleChange('city', e.target.value)}
                                                    placeholder="Your city"
                                                    autoComplete="off"
                                                    data-form-type="other"
                                                    data-lpignore="true"
                                                    className={errors.city ? 'border-red-500' : ''}
                                                />
                                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="state" className="text-sm font-medium text-slate-700 mb-1.5 block">
                                                    State <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="state"
                                                    name="state_reg"
                                                    value={formData.state}
                                                    onChange={(e) => handleChange('state', e.target.value)}
                                                    placeholder="Your state"
                                                    autoComplete="off"
                                                    data-form-type="other"
                                                    data-lpignore="true"
                                                    className={errors.state ? 'border-red-500' : ''}
                                                />
                                                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="country" className="text-sm font-medium text-slate-700 mb-1.5 block">
                                                Country <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="country"
                                                name="country_reg"
                                                value={formData.country}
                                                onChange={(e) => handleChange('country', e.target.value)}
                                                autoComplete="off"
                                                data-form-type="other"
                                                data-lpignore="true"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Challenge Category */}
                                <div className="mb-8">
                                    <h3 className="font-display font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                        <Medal className="w-5 h-5 text-primary" />
                                        Select Your Challenge Category <span className="text-red-500">*</span>
                                    </h3>

                                    {/* Running/Walking */}
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-slate-500 mb-2">🏃 Running / Walking</p>
                                        <div className="flex flex-wrap gap-2">
                                            {CHALLENGE_CATEGORIES.filter(c => c.type === 'Running/Walking').map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => handleChange('category', cat.id)}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${formData.category === cat.id
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Cycling */}
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 mb-2">🚴 Cycling</p>
                                        <div className="flex flex-wrap gap-2">
                                            {CHALLENGE_CATEGORIES.filter(c => c.type === 'Cycling').map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => handleChange('category', cat.id)}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${formData.category === cat.id
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {errors.category && <p className="text-red-500 text-xs mt-2">{errors.category}</p>}
                                </div>

                                {/* Referral Source */}
                                <div className="mb-8">
                                    <h3 className="font-display font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                        <Gift className="w-5 h-5 text-primary" />
                                        How did you find out about this event? <span className="text-red-500">*</span>
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {REFERRAL_SOURCES.map((source) => (
                                            <button
                                                key={source.value}
                                                type="button"
                                                onClick={() => handleChange('referralSource', source.value)}
                                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${formData.referralSource === source.value
                                                    ? 'bg-slate-900 text-white'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {source.label}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.referralSource && <p className="text-red-500 text-xs mt-2">{errors.referralSource}</p>}
                                </div>

                                {/* Coupon Code */}
                                <div className="mb-8">
                                    <h3 className="font-display font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-primary" />
                                        Have a Coupon Code?
                                    </h3>
                                    {couponApplied?.isValid ? (
                                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            <div className="flex-1">
                                                <p className="font-medium text-green-800">{formData.couponCode.toUpperCase()}</p>
                                                <p className="text-sm text-green-600">{couponApplied.message}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeCoupon}
                                                className="p-1 hover:bg-green-100 rounded transition-colors"
                                            >
                                                <X className="w-4 h-4 text-green-600" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                value={formData.couponCode}
                                                onChange={(e) => handleChange('couponCode', e.target.value.toUpperCase())}
                                                placeholder="Enter coupon code"
                                                autoComplete="off"
                                                data-form-type="other"
                                                data-lpignore="true"
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={validateCoupon}
                                                disabled={isCouponLoading}
                                            >
                                                {isCouponLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    'Apply'
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                    {couponApplied && !couponApplied.isValid && (
                                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {couponApplied.message}
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button (Mobile) */}
                                <div className="lg:hidden">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 font-display font-bold text-lg py-7 h-auto rounded-xl shadow-lg"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Pay ₹{totalAmount} & Register
                                                <ArrowRight className="ml-2 w-5 h-5" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>

                        {/* Order Summary Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-1"
                        >
                            <div className="sticky top-28">
                                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl">
                                    <h3 className="font-display font-bold text-lg mb-6">Order Summary</h3>

                                    {/* Selected Category */}
                                    {formData.category && (
                                        <div className="mb-6 p-4 bg-white/10 rounded-xl">
                                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Selected Category</p>
                                            <p className="font-semibold text-lg">
                                                {CHALLENGE_CATEGORIES.find(c => c.id === formData.category)?.icon}{' '}
                                                {CHALLENGE_CATEGORIES.find(c => c.id === formData.category)?.type} -{' '}
                                                {CHALLENGE_CATEGORIES.find(c => c.id === formData.category)?.label}
                                            </p>
                                        </div>
                                    )}

                                    {/* What's Included */}
                                    <div className="mb-6">
                                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">What's Included</p>
                                        <ul className="space-y-2">
                                            {[
                                                '3" Premium Metal Medal',
                                                'Digital E-Certificate',
                                                'Name on Finishers List',
                                                'Customized Poster',
                                                'Free Shipping',
                                            ].map((item, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-400" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Pricing Breakdown */}
                                    <div className="border-t border-white/10 pt-4 mb-6">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-slate-400">Base Price</span>
                                            <span>₹{BASE_PRICE}</span>
                                        </div>
                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-sm mb-2 text-green-400">
                                                <span>Coupon Discount</span>
                                                <span>-₹{discountAmount}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-slate-400">GST (18%)</span>
                                            <span>₹{gstAmount}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t border-white/10">
                                            <span>Total</span>
                                            <span>₹{totalAmount}</span>
                                        </div>
                                    </div>

                                    {/* Submit Button (Desktop) */}
                                    <Button
                                        type="submit"
                                        form="registration-form"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="hidden lg:flex w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 font-display font-bold text-lg py-6 h-auto rounded-xl shadow-lg"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Pay ₹{totalAmount}
                                                <ArrowRight className="ml-2 w-5 h-5" />
                                            </>
                                        )}
                                    </Button>

                                    {/* Trust Badges */}
                                    <div className="mt-6 pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Shield className="w-4 h-4" />
                                            <span>Secure payment via Razorpay</span>
                                        </div>
                                    </div>
                                </div>

                                {/* FAQs Teaser */}
                                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <p className="text-sm text-amber-800">
                                        <strong>Need help?</strong> WhatsApp us at{' '}
                                        <a href="https://wa.me/919238737970" className="text-primary font-semibold">
                                            +91 92387 37970
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default PremiumRegistration;
