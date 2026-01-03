import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, RegistrationFormData } from '@/lib/validation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Lock, CheckCircle2, ChevronDown, AlertCircle, User, LogIn, Tag, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';

import FormField from './FormField';
import SportDistanceCard from './SportDistanceCard';
import CourierCard from './CourierCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const RegistrationForm = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(false);
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [useSavedAddress, setUseSavedAddress] = useState(true);
    const [isCityStateReadOnly, setIsCityStateReadOnly] = useState(true);
    const [stravaConnected, setStravaConnected] = useState(false);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discountAmount: number;
        message: string;
    } | null>(null);
    const [couponError, setCouponError] = useState('');
    const originalPrice = 399;
    const finalPrice = appliedCoupon ? originalPrice - appliedCoupon.discountAmount : originalPrice;

    // Check Strava Connection


    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors, isValid }
    } = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        mode: "onBlur",
        defaultValues: {
            countryCode: "+91",
            country: "India",
            clubName: "NA",
            gender: undefined,
        }
    });

    // Check Strava Connection
    useEffect(() => {
        const checkStrava = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('strava_connections')
                .select('id')
                .eq('is_active', true)
                .maybeSingle();

            if (data) {
                setStravaConnected(true);
                setValue('verificationMethod', 'strava_auto');
            }
        };
        checkStrava();
    }, [user, setValue]);

    // 1. Pre-fill Personal Details & Address on Load / Toggle
    useEffect(() => {
        if (user) {
            const meta = user.user_metadata || {};

            // Always pre-fill personal details
            if (meta.first_name) setValue('firstName', meta.first_name);
            if (meta.last_name) setValue('lastName', meta.last_name);
            if (user.email) setValue('email', user.email);
            if (meta.phone) {
                setValue('phone', meta.phone);
                setValue('confirmPhone', meta.phone); // Auto-confirm
            }
            if (meta.country_code) setValue('countryCode', meta.country_code);
            if (meta.gender) setValue('gender', meta.gender as any);

            // Pre-fill Address if checkbox is checked
            if (useSavedAddress) {
                if (meta.address_line1) setValue('addressLine1', meta.address_line1);
                if (meta.address_line2) setValue('addressLine2', meta.address_line2);
                if (meta.city) {
                    setValue('city', meta.city);
                    setIsCityStateReadOnly(true);
                }
                if (meta.state) setValue('state', meta.state);
                if (meta.pincode) setValue('pincode', meta.pincode);
                if (meta.country) setValue('country', meta.country);
            } else {
                // Clear address if unchecked (optional, but requested behavior usually implies this)
                // We only clear if they were previously filled, but explicit clear is safer for "Use different address"
                setValue('addressLine1', '');
                setValue('addressLine2', '');
                setValue('city', '');
                setValue('state', '');
                setValue('pincode', '');
                setIsCityStateReadOnly(false);
            }
        }
    }, [user, useSavedAddress, setValue]);

    const pincode = watch('pincode');
    const phoneNumber = watch('phone');
    const confirmPhoneNumber = watch('confirmPhone');
    const gender = watch('gender');
    const sportDistance = watch('sportDistance');
    const courier = watch('courier');

    // Pincode Lookup Effect
    useEffect(() => {
        if (pincode && pincode.length === 6) {
            const fetchLocation = async () => {
                setPincodeLoading(true);
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
                    const data = await response.json();

                    if (data && data[0].Status === 'Success') {
                        const place = data[0].PostOffice[0];
                        setValue('city', place.District, { shouldValidate: true });
                        setValue('state', place.State, { shouldValidate: true });
                        setValue('country', 'India');
                        setIsCityStateReadOnly(true);
                        toast.success("Location found!", { duration: 2000 });
                    } else {
                        setIsCityStateReadOnly(false);
                        toast.error("Could not fetch location. Please enter manually.");
                    }
                } catch (error) {
                    console.error("Pincode API Error", error);
                    setIsCityStateReadOnly(false); // Allow manual edit on failure
                } finally {
                    setPincodeLoading(false);
                }
            };

            // Debounce slightly
            const timer = setTimeout(fetchLocation, 500);
            return () => clearTimeout(timer);
        }
    }, [pincode, setValue]);

    const onSubmit = async (data: RegistrationFormData) => {
        setLoading(true);
        try {
            if (!data.clubName) data.clubName = "NA";

            let targetUserId = user?.id || null;

            // 0. Auto-Create Account if not logged in
            if (!targetUserId) {
                // If user provided a password, try to sign up
                if (data.password) {
                    const { data: authData, error: authError } = await supabase.auth.signUp({
                        email: data.email,
                        password: data.password,
                        options: {
                            data: {
                                first_name: data.firstName,
                                last_name: data.lastName,
                            }
                        }
                    });

                    if (authError) {
                        if (authError.message.includes("already registered")) {
                            toast.error("Email already registered. Please login to link this registration.", {
                                description: <Link to="/login" className="underline font-bold">Click here to Login</Link>,
                                duration: 5000,
                            });
                            setLoading(false);
                            return;
                        }
                        throw authError; // Other auth errors
                    }

                    if (authData.user) {
                        targetUserId = authData.user.id;
                        toast.success("Account created successfully!");
                    }
                }
            }

            // 1. Insert into Supabase
            const { data: insertData, error: insertError } = await supabase
                .from('registrations')
                .insert({
                    user_id: targetUserId, // Use the resolved user ID
                    first_name: data.firstName,
                    last_name: data.lastName,
                    email: data.email,
                    country_code: data.countryCode,
                    phone: data.phone,
                    sport_distance: data.sportDistance,
                    gender: data.gender,
                    address_line1: data.addressLine1,
                    address_line2: data.addressLine2,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    pincode: data.pincode,
                    courier_preference: data.courier,
                    referral_source: data.source,
                    club_name: data.clubName,
                    challenge_name: "Republic Day 2026",
                    ticket_price: 399,
                    verification_method: data.verificationMethod,
                    payment_status: "pending"
                })
                .select()
                .single();

            if (insertError) {
                // Handle Foreign Key Violation (User might be deleted but session exists)
                if (insertError.code === '23503') { // foreign_key_violation
                    console.error("User ID mismatch", targetUserId);
                    await signOut();
                    toast.error("Session invalid. We have logged you out.", {
                        description: "Please login again or register as a new user."
                    });
                    setLoading(false);
                    return;
                }
                throw insertError;
            }

            // 1.1 Auto-save Address to User Metadata for future convenience
            if (targetUserId) {
                // We don't await this to avoid blocking the payment flow
                supabase.auth.updateUser({
                    data: {
                        address_line1: data.addressLine1,
                        address_line2: data.addressLine2,
                        city: data.city,
                        state: data.state,
                        pincode: data.pincode,
                        country: data.country,
                        // Also update personal details if they changed
                        first_name: data.firstName,
                        last_name: data.lastName,
                        phone: data.phone,
                        country_code: data.countryCode,
                        gender: data.gender
                    }
                }).then(({ error }) => {
                    if (error) console.error("Failed to auto-save address to profile", error);
                });
            }

            const registrationId = insertData.id;

            // 2. Check Razorpay SDK
            if (!(window as any).Razorpay) {
                throw new Error("Razorpay SDK is not loaded. Please check your internet connection.");
            }

            // 3. Create order server-side (SECURITY: Prevents price manipulation)
            const { data: orderData, error: orderError } = await supabase.functions.invoke('create-order', {
                body: {
                    registration_id: registrationId,
                    challenge_name: 'Republic Day 2026',
                    coupon_code: appliedCoupon?.code || null
                }
            });

            // Handle free registration (100% discount)
            if (orderData?.free_registration) {
                toast.success('Registration completed for free!');
                navigate('/thank-you');
                return;
            }

            if (orderError || !orderData?.order_id) {
                throw new Error("Failed to create payment order. Please try again.");
            }

            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                order_id: orderData.order_id, // SECURITY: Server-generated order ID
                name: "PedalPulse",
                description: `Republic Day 2026 - ${data.sportDistance}`,
                image: "https://pedalpulse.in/logo.png",
                handler: async function (response: any) {
                    // 4. SECURITY: Verify payment server-side (CRITICAL FIX)
                    const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
                        body: {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            registration_id: registrationId
                        }
                    });

                    if (verifyError || !verifyData?.verified) {
                        toast.error("Payment verification failed. Please contact support with your payment ID.");
                        setLoading(false);
                        return;
                    }

                    navigate('/thank-you');
                },
                prefill: {
                    name: `${data.firstName} ${data.lastName}`,
                    email: data.email,
                    contact: `${data.countryCode}${data.phone}`
                },
                theme: {
                    color: "#FF6B35"
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        toast("Payment cancelled. You can try again.");
                    }
                }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                toast.error(response.error.description || "Payment failed. Please try again.");
                setLoading(false);
            });
            rzp1.open();

        } catch (error: any) {
            console.error("Submission Error", error);
            toast.error(error.message || "Registration failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6 md:p-10 lg:p-16 w-full max-w-[700px] mx-auto animate-fade-in-up">

            {!user && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-blue-800">Already a member?</span>
                    </div>
                    <Link to="/login" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                        Login Now <LogIn className="w-4 h-4 ml-1" />
                    </Link>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

                {/* SECTION 1: PERSONAL DETAILS */}
                <section className="space-y-6">
                    <h3 className="font-display font-semibold text-xl text-slate-800 border-b border-slate-100 pb-2">Personal Details</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField label="First Name" placeholder="Enter first name" required {...register('firstName')} error={errors.firstName?.message} />
                        <FormField label="Last Name" placeholder="Enter last name" required {...register('lastName')} error={errors.lastName?.message} />
                    </div>

                    <FormField
                        label="Email Address"
                        type="email"
                        placeholder="your.email@example.com"
                        required
                        {...register('email')}
                        error={errors.email?.message}
                        readOnly={!!user} // Read only if logged in
                        className={user ? "bg-slate-50 text-slate-500" : ""}
                    />

                    {!user && (
                        <FormField
                            label="Create Password"
                            type="password"
                            placeholder="Min. 6 characters"
                            required
                            {...register('password')}
                            error={errors.password?.message}
                            helperText="Create a password to access your dashboard and tracked info."
                        />
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Phone Field with Country Code Split */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <select {...register('countryCode')} className="w-[80px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-3 text-sm focus:outline-none focus:border-primary">
                                    <option value="+91">+91</option>
                                    <option value="+1">+1</option>
                                    <option value="+44">+44</option>
                                    <option value="+971">+971</option>
                                </select>
                                <input
                                    type="tel"
                                    placeholder="9876543210"
                                    className={`flex-1 bg-white border rounded-lg px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.phone ? 'border-red-500' : 'border-slate-200'}`}
                                    {...register('phone')}
                                />
                            </div>
                            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                        </div>

                        {/* Confirm Phone */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Re-enter Phone <span className="text-red-500">*</span></label>
                            <div className="flex gap-2 relative">
                                <div className="w-[80px] flex items-center justify-center bg-slate-100 text-slate-500 rounded-lg border border-slate-200 text-sm">
                                    {watch('countryCode')}
                                </div>
                                <input
                                    type="tel"
                                    placeholder="9876543210"
                                    className={`flex-1 bg-white border rounded-lg px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.confirmPhone ? 'border-red-500' : 'border-slate-200'}`}
                                    {...register('confirmPhone')}
                                />
                                {confirmPhoneNumber && confirmPhoneNumber === phoneNumber && !errors.phone && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                        <CheckCircle2 size={16} />
                                    </div>
                                )}
                            </div>
                            {errors.confirmPhone && <p className="text-xs text-red-500">{errors.confirmPhone.message}</p>}
                        </div>
                    </div>
                </section>

                {/* SECTION 2: Challenge Selection */}
                <section className="space-y-6">
                    <h3 className="font-display font-semibold text-xl text-slate-800 border-b border-slate-100 pb-2">Challenge Selection</h3>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">Select Your Sport & Distance <span className="text-red-500">*</span></label>
                        <div className="grid gap-3">
                            <SportDistanceCard id="run5" value="Running 5km" label="Running / Walking 5km" sublabel="Beginner friendly" type="run" selected={sportDistance === "Running 5km"} onSelect={(val) => setValue('sportDistance', val, { shouldValidate: true })} />
                            <SportDistanceCard id="run10" value="Running 10km" label="Running / Walking 10km" sublabel="Intermediate" type="run" selected={sportDistance === "Running 10km"} onSelect={(val) => setValue('sportDistance', val, { shouldValidate: true })} />
                            <SportDistanceCard id="run21" value="Running 21km" label="Running / Walking 21km" sublabel="Advanced" type="run" selected={sportDistance === "Running 21km"} onSelect={(val) => setValue('sportDistance', val, { shouldValidate: true })} />
                            <SportDistanceCard id="cycle10" value="Cycling 10km" label="Cycling 10km" sublabel="Beginner friendly" type="ride" selected={sportDistance === "Cycling 10km"} onSelect={(val) => setValue('sportDistance', val, { shouldValidate: true })} />
                            <SportDistanceCard id="cycle25" value="Cycling 25km" label="Cycling 25km" sublabel="Intermediate" type="ride" selected={sportDistance === "Cycling 25km"} onSelect={(val) => setValue('sportDistance', val, { shouldValidate: true })} />
                            <SportDistanceCard id="cycle50" value="Cycling 50km" label="Cycling 50km" sublabel="Advanced" type="ride" selected={sportDistance === "Cycling 50km"} onSelect={(val) => setValue('sportDistance', val, { shouldValidate: true })} />
                            <SportDistanceCard id="cycle100" value="Cycling 100km" label="Cycling 100km" sublabel="Elite" type="ride" selected={sportDistance === "Cycling 100km"} onSelect={(val) => setValue('sportDistance', val, { shouldValidate: true })} />
                        </div>
                        {errors.sportDistance && <p className="text-xs text-red-500">{errors.sportDistance.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">Gender <span className="text-red-500">*</span></label>
                        <div className="flex gap-4">
                            {['Male', 'Female'].map((g) => (
                                <label key={g} className={`cursor-pointer px-8 py-3 rounded-full transition-all duration-200 text-sm font-medium ${gender === g ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                    <input type="radio" value={g} {...register('gender')} className="sr-only" />
                                    {g}
                                </label>
                            ))}
                        </div>
                        {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
                    </div>
                </section>

                {/* SECTION 3: Shipping */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h3 className="font-display font-semibold text-xl text-slate-800">Shipping Address</h3>
                        {user && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="useSavedAddress"
                                    checked={useSavedAddress}
                                    onCheckedChange={(checked) => setUseSavedAddress(checked as boolean)}
                                />
                                <Label htmlFor="useSavedAddress" className="text-sm cursor-pointer select-none">
                                    Use saved address
                                </Label>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-6">
                        <FormField label="Flat, House no., Building" placeholder="A-101, Green Valley Apartments" required {...register('addressLine1')} error={errors.addressLine1?.message} />
                        <FormField label="Area, Street, Village" placeholder="Sector 15, Vashi" required {...register('addressLine2')} error={errors.addressLine2?.message} />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FormField
                            label="Pincode"
                            placeholder="400703"
                            required
                            maxLength={6}
                            isLoading={pincodeLoading}
                            {...register('pincode')}
                            error={errors.pincode?.message}
                        />

                        <div className="relative">
                            <FormField label="City" readOnly={isCityStateReadOnly} {...register('city')} error={errors.city?.message} className={isCityStateReadOnly ? 'bg-slate-50 text-slate-500' : ''} />
                            {isCityStateReadOnly && <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-[38px]" />}
                        </div>

                        <div className="relative">
                            <FormField label="State" readOnly={isCityStateReadOnly} {...register('state')} error={errors.state?.message} className={isCityStateReadOnly ? 'bg-slate-50 text-slate-500' : ''} />
                            {isCityStateReadOnly && <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-[38px]" />}
                        </div>
                    </div>
                    {isCityStateReadOnly && (
                        <button type="button" onClick={() => setIsCityStateReadOnly(false)} className="text-xs text-primary hover:underline -mt-4 block text-right">
                            Wrong location? Edit manually
                        </button>
                    )}

                    <FormField label="Country" as="select" defaultValue="India" {...register('country')} error={errors.country?.message}>
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="UAE">UAE</option>
                        <option value="Other">Other</option>
                    </FormField>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">Preferred Courier Service <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {['Delhivery', 'India Post', 'Xpressbees', 'ShadowFax', 'Amazon'].map((c) => (
                                <CourierCard
                                    key={c}
                                    id={c}
                                    value={c}
                                    label={c}
                                    selected={courier === c}
                                    onSelect={(val) => setValue('courier', val, { shouldValidate: true })}
                                />
                            ))}
                        </div>
                        {errors.courier && <p className="text-xs text-red-500">{errors.courier.message}</p>}
                    </div>
                </section>

                {/* SECTION 3.5: Verification Method */}
                <section className="space-y-6">
                    <h3 className="font-display font-semibold text-xl text-slate-800 border-b border-slate-100 pb-2">Verification Method</h3>

                    <div className="space-y-4">
                        <Label>How do you want to verify your activity?</Label>
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Manual Option */}
                            <label className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${watch('verificationMethod') === 'manual' ? 'border-primary bg-orange-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                                <input type="radio" value="manual" {...register('verificationMethod')} className="sr-only" />
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${watch('verificationMethod') === 'manual' ? 'border-primary' : 'border-slate-300'}`}>
                                        {watch('verificationMethod') === 'manual' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                    </div>
                                    <span className="font-semibold text-slate-900">Manual Upload</span>
                                </div>
                                <p className="text-xs text-slate-500 ml-6">Upload screenshot from any fitness app (Strava, Garmin, Nike Run Club, etc.)</p>
                            </label>

                            {/* Strava Option */}
                            <label className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${watch('verificationMethod') === 'strava_auto' ? 'border-[#FC4C02] bg-orange-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                                <input type="radio" value="strava_auto" {...register('verificationMethod')} className="sr-only" />
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${watch('verificationMethod') === 'strava_auto' ? 'border-[#FC4C02]' : 'border-slate-300'}`}>
                                        {watch('verificationMethod') === 'strava_auto' && <div className="w-2 h-2 rounded-full bg-[#FC4C02]" />}
                                    </div>
                                    <span className="font-semibold text-slate-900 flex items-center gap-2">
                                        Automatic via Strava
                                        <span className="bg-[#FC4C02] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">RECOMMENDED</span>
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 ml-6">
                                    {stravaConnected
                                        ? "✅ Connected! Activities will sync automatically."
                                        : "Instant verification. You can connect Strava after payment."}
                                </p>
                            </label>
                        </div>

                        {/* Strava trust line */}
                        <p className="text-xs text-center text-slate-400 mt-4 italic">
                            Strava-verified efforts only. We respect the data.
                        </p>
                    </div>
                </section>

                {/* SECTION 4: Additional Info */}
                <section className="space-y-6">
                    <h3 className="font-display font-semibold text-xl text-slate-800 border-b border-slate-100 pb-2">Additional Information</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField label="How did you find us?" as="select" {...register('source')} error={errors.source?.message}>
                            <option value="">Select an option</option>
                            <option value="WhatsApp">WhatsApp Community</option>
                            <option value="Instagram">Instagram / Facebook</option>
                            <option value="Strava">Strava</option>
                            <option value="Friends">Friend Recommendation</option>
                            <option value="Google">Search Engine</option>
                            <option value="Other">Other</option>
                        </FormField>

                        <FormField label="Running/Cycling Club (Optional)" placeholder="Type NA if none" helperText="If you're not part of any club, enter NA" {...register('clubName')} />
                    </div>
                </section>

                {/* Footer */}
                <div className="pt-6 space-y-6 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="terms" checked={watch('terms')} onCheckedChange={(checked) => setValue('terms', checked as boolean, { shouldValidate: true })} />
                        <Label htmlFor="terms" className="text-sm text-slate-600 font-normal cursor-pointer">
                            I agree to the <Link to="/terms" className="text-primary underline hover:text-primary-dark">Terms and Conditions</Link> and <Link to="/privacy-policy" className="text-primary underline hover:text-primary-dark">Privacy Policy</Link>
                        </Label>
                    </div>
                    {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}

                    {/* Coupon Code Section */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-4 h-4 text-slate-600" />
                            <p className="font-semibold text-sm text-slate-700">Have a coupon code?</p>
                        </div>

                        {appliedCoupon ? (
                            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-semibold text-green-800">{appliedCoupon.code}</p>
                                        <p className="text-xs text-green-600">{appliedCoupon.message}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAppliedCoupon(null);
                                        setCouponCode('');
                                    }}
                                    className="p-1 hover:bg-green-100 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-green-600" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={couponCode}
                                    onChange={(e) => {
                                        setCouponCode(e.target.value.toUpperCase());
                                        setCouponError('');
                                    }}
                                    className="flex-1 h-10 uppercase"
                                    disabled={couponLoading}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 px-4"
                                    disabled={!couponCode.trim() || couponLoading}
                                    onClick={async () => {
                                        if (!couponCode.trim()) return;

                                        setCouponLoading(true);
                                        setCouponError('');

                                        try {
                                            const { data, error } = await supabase.functions.invoke('validate-coupon', {
                                                body: {
                                                    code: couponCode.trim(),
                                                    challenge_name: 'Republic Day 2026',
                                                    order_amount: originalPrice
                                                }
                                            });

                                            if (error) throw error;

                                            if (data?.valid) {
                                                setAppliedCoupon({
                                                    code: couponCode.trim().toUpperCase(),
                                                    discountAmount: data.discount_amount,
                                                    message: data.message
                                                });
                                                toast.success(data.message);
                                            } else {
                                                setCouponError(data?.error || 'Invalid coupon code');
                                            }
                                        } catch (err) {
                                            setCouponError('Failed to validate coupon');
                                        } finally {
                                            setCouponLoading(false);
                                        }
                                    }}
                                >
                                    {couponLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Apply'
                                    )}
                                </Button>
                            </div>
                        )}

                        {couponError && (
                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {couponError}
                            </p>
                        )}
                    </div>

                    {/* Price Summary */}
                    <div className="bg-orange-50/50 rounded-xl p-6 border border-orange-100/50">
                        {appliedCoupon ? (
                            <div className="space-y-2 mb-3">
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Original Price</span>
                                    <span>₹{originalPrice}</span>
                                </div>
                                <div className="flex items-center justify-between text-green-600">
                                    <span>Discount ({appliedCoupon.code})</span>
                                    <span>-₹{appliedCoupon.discountAmount}</span>
                                </div>
                                <div className="border-t border-orange-200 pt-2 flex items-center justify-between">
                                    <div>
                                        <p className="font-display font-semibold text-lg text-slate-900">Total Amount</p>
                                        <p className="text-xs text-slate-500">Includes all taxes</p>
                                    </div>
                                    <p className="font-display font-bold text-3xl text-primary">₹{finalPrice}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="font-display font-semibold text-lg text-slate-900">Total Amount</p>
                                    <p className="text-xs text-slate-500">Includes all taxes</p>
                                </div>
                                <p className="font-display font-bold text-3xl text-primary">₹{originalPrice}</p>
                            </div>
                        )}
                        <p className="text-xs text-slate-400 text-center italic">
                            Costs less than explaining to your family why you need another pair of running shoes.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 bg-gradient-to-br from-primary to-[#FFB84D] hover:to-primary text-white text-lg font-semibold rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 transform hover:-translate-y-0.5"
                        disabled={loading}
                        onClick={() => {
                            if (!isValid) {
                                trigger(); // Show all validation errors
                                const firstError = Object.keys(errors)[0];
                                if (firstError) {
                                    toast.error(`Please fix errors in the form: ${firstError}`);
                                }
                            }
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Proceed to Payment"
                        )}
                    </Button>
                </div>

            </form>
        </div>
    );
};

export default RegistrationForm;
