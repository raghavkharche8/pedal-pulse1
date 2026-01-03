import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Check,
    Calendar,
    Clock,
    Trophy,
    UserCircle,
    Activity,
    Medal,
    Award,

    Timer,
    MapPin,
    Zap,
    Star,
    ChevronRight,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CountdownTimer } from '@/components/CountdownTimer';
import { Accordion } from '@/components/Accordion';
import { Button } from '@/components/ui/button';
import medalImage from '@/republic-medal.png';

// Razorpay Payment Link
const RAZORPAY_PAYMENT_LINK = 'https://rzp.io/rzp/EIU2D4YK';

// Category Registration URLs - Replace these with actual Razorpay payment links
const CATEGORY_URLS: Record<string, string> = {
    // Running/Walking
    'running-5km': 'PLACEHOLDER_URL_RUNNING_5KM',
    'running-10km': 'PLACEHOLDER_URL_RUNNING_10KM',
    'running-21km': 'PLACEHOLDER_URL_RUNNING_21KM',
    // Cycling
    'cycling-10km': 'PLACEHOLDER_URL_CYCLING_10KM',
    'cycling-25km': 'PLACEHOLDER_URL_CYCLING_25KM',
    'cycling-50km': 'PLACEHOLDER_URL_CYCLING_50KM',
    'cycling-100km': 'PLACEHOLDER_URL_CYCLING_100KM',
};

// Category Selection Component
const CategorySelection = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const runningOptions = [
        { id: 'running-5km', label: '5 Km' },
        { id: 'running-10km', label: '10 Km' },
        { id: 'running-21km', label: '21 Km' },
    ];

    const cyclingOptions = [
        { id: 'cycling-10km', label: '10 Km' },
        { id: 'cycling-25km', label: '25 Km' },
        { id: 'cycling-50km', label: '50 Km' },
        { id: 'cycling-100km', label: '100 Km' },
    ];

    const handleRegister = () => {
        if (selectedCategory && CATEGORY_URLS[selectedCategory]) {
            window.location.href = CATEGORY_URLS[selectedCategory];
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200 shadow-lg"
            >
                {/* Running/Walking Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-display font-bold text-xl text-slate-900">Running/Walking</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {runningOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setSelectedCategory(option.id)}
                                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-display font-semibold text-sm sm:text-base transition-all duration-300 border-2 touch-manipulation ${selectedCategory === option.id
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cycling Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="font-display font-bold text-xl text-slate-900">Cycling</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {cyclingOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setSelectedCategory(option.id)}
                                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-display font-semibold text-sm sm:text-base transition-all duration-300 border-2 touch-manipulation ${selectedCategory === option.id
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selected Category Display */}
                {selectedCategory && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20"
                    >
                        <p className="text-sm text-slate-600">
                            Selected: <span className="font-bold text-primary capitalize">{selectedCategory.replace('-', ' ').replace('km', ' Km')}</span>
                        </p>
                    </motion.div>
                )}

                {/* Register Now Button */}
                <Button
                    onClick={handleRegister}
                    disabled={!selectedCategory}
                    className={`w-full py-5 sm:py-6 md:py-7 h-auto font-display font-bold text-base sm:text-lg rounded-xl transition-all duration-300 touch-manipulation ${selectedCategory
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 hover:-translate-y-1'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    {selectedCategory ? (
                        <>
                            Register Now
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                    ) : (
                        'Select a Category to Continue'
                    )}
                </Button>

                {/* Entry Fee Info */}
                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                        <span className="font-display font-bold text-xl sm:text-2xl text-slate-900">₹399</span>
                        <span className="text-slate-400 line-through text-sm">₹449</span>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">SAVE ₹50</span>
                    </div>
                    <p className="text-xs text-slate-500">Includes Premium Medal + E-Certificate + Free Shipping</p>
                </div>
            </motion.div>
        </div>
    );
};

// Premium Category Selector Component (for the dark theme pricing card)
const PremiumCategorySelector = () => {
    return (
        <Button
            asChild
            className="w-full py-5 sm:py-6 h-auto font-display font-bold text-base sm:text-lg rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-300 touch-manipulation"
        >
            <a href="/challenges/republic-day-challenges-2026/premium-registration">
                Get My Medal - ₹399 + GST
                <ArrowRight className="ml-2 w-5 h-5" />
            </a>
        </Button>
    );
};

const RepublicDayChallenge = () => {
    const eventStartDate = '2026-01-26T00:00:00';

    // Dynamic registration count - starts at 145, adds 70-100 per day since Jan 1, 2026
    const registeredCount = useMemo(() => {
        const startDate = new Date('2026-01-01');
        const today = new Date();
        const daysSinceStart = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

        // Use date as seed for consistent daily randomization
        const seed = today.toDateString();
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash = hash & hash;
        }
        const dailyRandom = 70 + Math.abs(hash % 31); // 70-100 range

        return 145 + (daysSinceStart * dailyRandom);
    }, []);

    // Dynamic viewer count - oscillates between 38-74
    const [viewerCount, setViewerCount] = useState(0);

    useEffect(() => {
        const getRandomViewers = () => 38 + Math.floor(Math.random() * 37); // 38-74
        setViewerCount(getRandomViewers());

        const interval = setInterval(() => {
            setViewerCount(prev => {
                const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
                const newCount = prev + change;
                return Math.max(38, Math.min(74, newCount));
            });
        }, 5000 + Math.random() * 5000); // Update every 5-10 seconds

        return () => clearInterval(interval);
    }, []);

    const faqItems = [
        {
            question: 'Can I participate from anywhere in India?',
            answer: 'Yes! Complete your challenge anywhere you prefer - road, track, treadmill, or cycling path.',
        },
        {
            question: 'Can I use a treadmill or stationary bike?',
            answer: 'Absolutely! Indoor runs on treadmills and indoor cycling on stationary trainers are fully accepted. Just capture a photo of the console display as proof.',
        },
        {
            question: 'Must I complete the full distance in one go?',
            answer: 'Yes, your chosen distance must be completed in a single continuous session on any ONE day during 26 Jan - 1 Feb. You cannot split it across multiple days.',
        },
        {
            question: 'Can I register after 26th January?',
            answer: 'No, registrations close strictly before the event starts to ensure timely medal delivery planning. We recommend registering early!',
        },
        {
            question: 'What is the refund policy?',
            answer: 'Tickets are non-refundable and non-transferable. Since medals are ordered customized based on registrations, we cannot offer cancellations.',
        },
        {
            question: 'When will I receive my medal?',
            answer: 'Medals are shipped within 5 working days after your proof is verified. Delivery typically takes 5-7 days.',
        },
        {
            question: "What if I can't complete my chosen distance?",
            answer: 'You can still submit a lower distance for e-certificate recognition, but physical medals are only for completed distances.',
        },
    ];



    const fadeUp = {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5, ease: "easeOut" }
    };

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Header />

            {/* HERO SECTION - Mobile-First Design */}
            <section className="relative min-h-[80vh] sm:min-h-[85vh] md:min-h-[90vh] flex flex-col justify-center bg-gradient-to-b from-slate-50 to-white overflow-hidden pt-20 sm:pt-24 pb-8 sm:pb-12 md:pb-16">

                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                {/* Lighter Gradient Blobs for Mobile */}
                <div className="absolute top-0 right-0 w-[200px] sm:w-[300px] md:w-[400px] lg:w-[500px] h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] bg-orange-100/30 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] lg:blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] md:w-[400px] lg:w-[500px] h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] bg-green-100/30 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] lg:blur-[120px] translate-y-1/2 -translate-x-1/2" />

                <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
                    <div className="max-w-6xl mx-auto">

                        {/* Header Content - Mobile Optimized */}
                        <div className="text-center mb-6 sm:mb-8 md:mb-12 max-w-3xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-3 sm:mb-4 md:mb-6"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                </span>
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Registration Open
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-slate-900 mb-3 sm:mb-4 leading-[1.1] px-2"
                            >
                                Republic Day{' '}
                                <span className="block mt-1 text-slate-900">
                                    Virtual Challenge
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto px-2"
                            >
                                Celebrate India's spirit. Run or cycle <strong className="text-slate-900">26 Jan - 1 Feb 2026</strong>
                                <span className="block text-xs sm:text-sm text-slate-400 mt-1">Anywhere. Anytime. Your Way.</span>
                            </motion.p>
                        </div>

                        {/* Mobile: Medal First, Desktop: Side by Side */}
                        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 md:gap-12 items-center">

                            {/* Left: Medal Showcase */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="lg:col-span-7 relative flex justify-center lg:justify-end"
                            >
                                <div className="relative w-[240px] sm:w-[300px] md:w-[400px] lg:w-[480px] aspect-square mx-auto">
                                    {/* Decorative Circle Behind */}
                                    <div className="absolute inset-4 border border-slate-100 rounded-full" />
                                    <div className="absolute inset-12 border border-slate-100 rounded-full" />

                                    {/* Medal Image */}
                                    <motion.img
                                        src={medalImage}
                                        alt="Official Finisher Medal"
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                        className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                                    />

                                    {/* Floating Tag */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="absolute bottom-10 -left-4 bg-white p-4 rounded-xl shadow-xl border border-slate-100 hidden md:flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Medal className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">Heavy Metal</p>
                                            <p className="text-xs text-slate-500">Premium Quality Finisher Medal</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Right: Action Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="lg:col-span-5 relative"
                            >
                                <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
                                    {/* Accent Top Border */}
                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-500" />

                                    <div className="mb-6">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-slate-500 text-sm font-medium">Entry Fee</p>
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">SAVE ₹50</span>
                                        </div>
                                        <div className="flex items-baseline gap-3">
                                            <span className="font-display font-bold text-5xl text-slate-900">₹399</span>
                                            <span className="text-xl text-slate-400 line-through">₹449</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-slate-600">Physical <strong>Premium Medal</strong> delivered to your doorstep</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-slate-600">Personalized E-Certificate & Leaderboard access</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-slate-600">Free shipping all over India</p>
                                        </div>
                                    </div>

                                    <Button
                                        asChild
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-display font-semibold text-lg py-7 h-auto rounded-xl shadow-lg shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <a href="#pricing">
                                            View Pricing
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </a>
                                    </Button>

                                    <div className="mt-6 pt-6 border-t border-slate-100">
                                        <p className="text-xs text-center text-slate-400 uppercase tracking-widest mb-3">Event Starts In</p>
                                        <div className="scale-110 origin-top">
                                            <CountdownTimer targetDate={eventStartDate} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </div>
            </section>

            {/* WHAT YOU GET - Premium Cards */}
            <section className="py-24 bg-gradient-to-b from-background to-surface">
                <div className="container-premium">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <span className="text-primary font-sans font-semibold text-sm tracking-widest uppercase mb-4 block">Premium Deliverables</span>
                        <h2 className="font-display font-bold text-4xl lg:text-5xl text-text-primary mb-6">
                            More Than Just A Medal
                        </h2>
                        <p className="font-sans text-xl text-text-secondary max-w-2xl mx-auto font-light">
                            We believe in rewarding your effort with high-quality collectibles that last a lifetime.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                icon: Medal,
                                title: '3-Inch Premium Metal Medal',
                                desc: 'A hefty, real metal medal (not cheap plastic!) with stunning enamel detailing exactly as shown in the preview. Feel the weight of your achievement - crafted to last a lifetime.',
                                delay: 0,
                                highlight: 'Physical Item'
                            },
                            {
                                icon: Award,
                                title: 'Official E-Certificate',
                                desc: 'A personalized digital certificate with your name, distance, and time - perfect for sharing on social media and LinkedIn.',
                                delay: 0.1,
                                highlight: 'Instant Download'
                            },
                            {
                                icon: Trophy,
                                title: 'Name on Finishers List',
                                desc: "Your name permanently published on our website. When anyone Googles your name, they'll see proof of your fitness achievement - a digital badge of honor that follows you forever!",
                                delay: 0.2,
                                highlight: 'Digital Recognition'
                            },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: item.delay, duration: 0.5 }}
                                className="group relative bg-white rounded-3xl p-8 border border-border shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <item.icon className="w-32 h-32 text-primary" />
                                </div>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent-warm/10 flex items-center justify-center mb-8 border border-primary/10 group-hover:scale-110 transition-transform duration-300">
                                        <item.icon className="w-8 h-8 text-primary" />
                                    </div>

                                    <span className="inline-block px-3 py-1 bg-surface-warm rounded-full text-[10px] font-bold tracking-widest text-text-muted uppercase mb-4">
                                        {item.highlight}
                                    </span>

                                    <h3 className="font-display font-bold text-2xl text-text-primary mb-4">{item.title}</h3>
                                    <p className="font-sans text-base text-text-secondary leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>



            {/* PREVIOUS MEDALS SHOWCASE */}
            <section className="py-20 bg-background border-y border-slate-100">
                <div className="container-premium">
                    <motion.div {...fadeUp} className="text-center mb-12">
                        <span className="text-orange-500 font-sans font-semibold text-sm tracking-widest uppercase mb-4 block">Legacy of Excellence</span>
                        <h2 className="font-display font-bold text-3xl lg:text-4xl text-slate-900 mb-6">
                            See Our Previous Medals
                        </h2>
                        <p className="font-sans text-xl text-slate-500 max-w-2xl mx-auto font-light">
                            Don't just take our word for it. See what our community has earned.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Instagram Option */}
                        <motion.a
                            href="https://www.instagram.com/pedal_pulse_in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:rotate-12">
                                <Activity className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                                <div>
                                    <h3 className="font-display font-bold text-2xl mb-2">View on Instagram</h3>
                                    <p className="text-white/90">Check out real photos from our participants.</p>
                                </div>
                                <div className="flex items-center gap-2 font-semibold mt-6 group-hover:translate-x-2 transition-transform">
                                    Visit Profile <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.a>

                        {/* Gallery Option */}
                        <motion.a
                            href="/gallery"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="group relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12">
                                <Trophy className="w-32 h-32 text-orange-400" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                                <div>
                                    <h3 className="font-display font-bold text-2xl mb-2 text-white">Visit Hall of Fame</h3>
                                    <p className="text-slate-300">Explore our curated gallery of past events.</p>
                                </div>
                                <div className="flex items-center gap-2 font-semibold mt-6 text-orange-400 group-hover:translate-x-2 transition-transform">
                                    Open Gallery <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.a>
                    </div>
                </div>
            </section>

            {/* PRICING - Two Tier System with Psychological Optimization */}
            <section id="pricing" className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-background to-slate-50">
                <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-bold mb-4">
                            <Timer className="w-4 h-4" />
                            Limited Time Early Bird Pricing
                        </span>
                        <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-slate-900 mb-4">
                            Choose Your Package
                        </h2>
                        <p className="font-sans text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-4">
                            Complete the challenge your way. Upgrade to Premium for the ultimate experience.
                        </p>
                    </motion.div>

                    {/* Social Proof */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-center gap-6 mb-12 flex-wrap"
                    >
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-slate-100">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-400 border-2 border-white flex items-center justify-center">
                                        <UserCircle className="w-5 h-5 text-white" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{registeredCount}+ Registered</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                            </span>
                            {viewerCount} people are viewing this page
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">

                        {/* PREMIUM TIER - Highly Featured */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-2xl order-1"
                        >
                            {/* Popular Badge */}
                            <div className="absolute top-0 right-0">
                                <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-6 py-2 text-xs font-black uppercase tracking-wider transform rotate-0 origin-center rounded-bl-2xl">
                                    🏆 Most Popular
                                </div>
                            </div>

                            {/* Glow Effect */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2" />

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                                        <Medal className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-2xl text-white">Premium Pass</h3>
                                        <p className="text-slate-400 text-sm">Complete Experience</p>
                                    </div>
                                </div>

                                {/* Pricing with Early Bird */}
                                <div className="bg-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-sm border border-white/10">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                                        <div>
                                            <p className="text-slate-400 text-sm">Early Bird Price (till 18th Jan)</p>
                                            <div className="flex items-baseline gap-3 mt-1">
                                                <span className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white">₹399</span>
                                                <span className="text-slate-400 line-through text-lg sm:text-xl">₹449</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">+GST applicable</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-green-500/20 text-green-400 text-sm font-bold px-3 py-1.5 rounded-full border border-green-500/30">
                                                SAVE ₹50
                                            </span>
                                        </div>
                                    </div>

                                    {/* Urgency Timer */}
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-amber-400 text-xs font-semibold flex items-center gap-2 mb-2">
                                            <Clock className="w-3 h-3" />
                                            Early Bird Ends In:
                                        </p>
                                        <CountdownTimer targetDate="2026-01-18T23:59:59" />
                                    </div>
                                </div>

                                {/* What's Included */}
                                <div className="mb-8">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-4">What's Included</p>
                                    <ul className="space-y-3">
                                        {[
                                            { icon: Medal, text: '3" Premium Metal Medal (Real Metal!)', highlight: true },
                                            { icon: Award, text: 'Digital E-Certificate', highlight: false },
                                            { icon: Trophy, text: 'Name on Finishers List (Google-Searchable!)', highlight: true },
                                            { icon: Star, text: 'Customized Poster', highlight: false },
                                            { icon: MapPin, text: 'Free Shipping India-wide', highlight: false },
                                        ].map((item, idx) => (
                                            <li key={idx} className={`flex items-center gap-3 ${item.highlight ? 'bg-amber-500/10 -mx-2 px-2 py-2 rounded-lg border border-amber-500/20' : ''}`}>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.highlight ? 'bg-amber-500 text-white' : 'bg-white/10 text-slate-300'}`}>
                                                    <item.icon className="w-4 h-4" />
                                                </div>
                                                <span className={`font-medium ${item.highlight ? 'text-amber-400' : 'text-slate-200'}`}>{item.text}</span>
                                                {item.highlight && <span className="ml-auto text-xs bg-amber-500 text-white px-2 py-0.5 rounded">EXCLUSIVE</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Register Button */}
                                <div className="mb-6">
                                    <PremiumCategorySelector />
                                </div>
                            </div>
                        </motion.div>

                        {/* FREE TIER - De-emphasized */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-slate-200 overflow-hidden order-2"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                    <Award className="w-7 h-7 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-2xl text-slate-900">Free Pass</h3>
                                    <p className="text-slate-500 text-sm">Basic Experience</p>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="mb-6">
                                <span className="font-display font-black text-4xl text-slate-900">₹0</span>
                                <span className="text-slate-400 text-sm ml-2">Free Forever</span>
                            </div>

                            {/* What's Included */}
                            <div className="mb-6">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-4">What's Included</p>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-slate-400 line-through">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                            <Medal className="w-4 h-4 text-red-300" />
                                        </div>
                                        <span>Premium Finisher Medal</span>
                                        <span className="ml-auto text-xs text-red-500 font-bold">NOT INCLUDED</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-400 line-through">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                            <Trophy className="w-4 h-4 text-red-300" />
                                        </div>
                                        <span>Name on Finishers List</span>
                                        <span className="ml-auto text-xs text-red-500 font-bold">NOT INCLUDED</span>
                                    </li>
                                    {[
                                        { icon: Award, text: 'Digital E-Certificate' },
                                        { icon: Star, text: 'Customized Poster' },
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <item.icon className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <span className="text-slate-700">{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Missing Out Warning */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <p className="text-amber-800 text-sm">
                                    <strong>⚠️ You'll miss out on:</strong> The exclusive Premium Medal - a beautiful collectible to commemorate your achievement!
                                </p>
                            </div>

                            {/* CTA */}
                            <Button
                                asChild
                                variant="outline"
                                className="w-full py-6 h-auto font-display font-semibold text-base border-2 border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl"
                            >
                                <a href="/challenges/republic-day-challenges-2026/free-registration">
                                    Continue with Free
                                </a>
                            </Button>

                            <p className="text-center text-xs text-slate-400 mt-4">
                                You can always upgrade later
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS - Compact Timeline */}
            <section id="how-it-works" className="py-20 bg-surface">
                <div className="container-premium">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <h2 className="font-display font-bold text-3xl lg:text-4xl text-text-primary mb-4">
                            How It Works
                        </h2>
                        <p className="font-sans text-xl text-text-secondary max-w-2xl mx-auto font-light">
                            Your journey to the finish line in 4 simple steps
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
                        {[
                            {
                                step: '01',
                                title: 'Register',
                                desc: 'Sign up for the Republic Day event and choose your preferred package and challenge category. Select from various running/walking distances or cycling options.',
                                color: 'bg-blue-500'
                            },
                            {
                                step: '02',
                                title: 'Complete the Activity',
                                desc: 'Run, walk, jog, or cycle your chosen distance on any ONE DAY during the event period (26 Jan - 1 Feb 2026). Complete your activity anywhere you prefer!',
                                color: 'bg-green-500'
                            },
                            {
                                step: '03',
                                title: 'Submit Your Achievement',
                                desc: 'Upload your activity proof (Strava screenshot, treadmill display, fitness app data, etc.) by 26 January, 11 AM. Include date, distance, and duration details.',
                                color: 'bg-orange-500'
                            },
                            {
                                step: '04',
                                title: 'Get Rewards',
                                desc: 'Receive your commemorative medal (if eligible) and personalized e-certificate upon verification. Celebrate your achievement and share your fitness journey!',
                                color: 'bg-purple-500'
                            },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex gap-6 p-6 rounded-3xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                            >
                                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl ${item.color} text-white flex items-center justify-center font-display font-bold text-xl shadow-lg`}>
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-xl text-text-primary mb-3">{item.title}</h3>
                                    <p className="font-sans text-text-secondary leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CHALLENGE DETAILS - Comprehensive Info */}
            <section className="py-20 bg-background text-text-primary">
                <div className="container-premium">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <h2 className="font-display font-bold text-3xl lg:text-4xl text-text-primary mb-4">
                            Challenge Details
                        </h2>
                        <p className="font-sans text-xl text-text-secondary max-w-2xl mx-auto font-light">
                            Everything you need to know to succeed
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Dates */}
                        <div className="p-6 rounded-3xl bg-surface border border-border">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h3 className="font-display font-bold text-lg mb-2">Challenge Dates</h3>
                            <p className="font-sans font-semibold text-primary text-xl mb-2">26 Jan - 1 Feb 2026</p>
                            <p className="text-sm text-text-muted">Complete your selected distance on any one day during this period.</p>
                        </div>

                        {/* Categories */}
                        <div className="p-6 rounded-3xl bg-surface border border-border">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="font-display font-bold text-lg mb-4">Categories</h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Running/Walking</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['5Km', '10Km', '21Km'].map(d => (
                                            <span key={d} className="px-2 py-1 rounded-md bg-background text-xs font-semibold border border-border">{d}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Cycling</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['10Km', '25Km', '50Km', '100Km'].map(d => (
                                            <span key={d} className="px-2 py-1 rounded-md bg-background text-xs font-semibold border border-border">{d}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Proof Submission */}
                        <div className="p-6 rounded-3xl bg-surface border border-border">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                                <Check className="w-6 h-6" />
                            </div>
                            <h3 className="font-display font-bold text-lg mb-2">Proof Submission</h3>
                            <ul className="space-y-2 mb-4">
                                <li className="text-sm text-text-secondary flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" />
                                    Date of activity
                                </li>
                                <li className="text-sm text-text-secondary flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" />
                                    Distance covered
                                </li>
                                <li className="text-sm text-text-secondary flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" />
                                    Duration/time taken
                                </li>
                            </ul>
                            <p className="text-xs text-text-muted italic">Acceptable: Strava, Garmin, Display, Apps</p>
                        </div>

                        {/* Deadlines */}
                        <div className="p-6 rounded-3xl bg-surface border border-border">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="font-display font-bold text-lg mb-4">Important Deadlines</h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-text-muted mb-1">Activity Submission Opens</p>
                                    <p className="font-semibold text-text-primary">26 January 2026</p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-muted mb-1">Medal Dispatch</p>
                                    <p className="font-semibold text-text-primary">3-4 days after 1st Feb</p>
                                    <p className="text-xs text-text-muted">Shipping takes 5-6 days after dispatch</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* COMMUNITY & SUPPORT */}
            <section className="py-20 bg-white border-y border-border">
                <div className="container-premium">
                    <div className="grid md:grid-cols-2 gap-8 text-center md:text-left max-w-4xl mx-auto">

                        {/* Who is this for */}
                        <div className="space-y-4">
                            <h3 className="font-display font-bold text-xl text-slate-900">Who is this for?</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Perfect for everyone from beginners walking their first 5K to seasoned athletes crushing a 100K rides. No cut-off times, just your personal best!
                            </p>
                        </div>

                        {/* Support */}
                        <div className="space-y-4">
                            <h3 className="font-display font-bold text-xl text-slate-900">Need Help?</h3>
                            <p className="text-slate-600">
                                We are here to assist you.<br />
                                WhatsApp: <a href="https://wa.me/919238737970" className="text-primary font-semibold hover:underline">+91 92387 37970</a>
                            </p>
                            <div className="flex gap-4 justify-center md:justify-start mt-2">
                                <a href="https://www.instagram.com/pedal_pulse_in/" className="text-slate-400 hover:text-pink-600 transition-colors">
                                    <span className="sr-only">Instagram</span>
                                    <Activity className="w-6 h-6" />
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* FAQ - Compact */}
            <section className="py-20 bg-surface">
                <div className="container-premium">
                    <motion.div {...fadeUp} className="text-center mb-12">
                        <h2 className="font-display font-bold text-3xl lg:text-4xl text-text-primary mb-3">
                            Questions?
                        </h2>
                    </motion.div>

                    <div className="max-w-2xl mx-auto">
                        <Accordion items={faqItems} />
                    </div>
                </div>
            </section>

            {/* FINAL CTA - Compelling */}
            <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]" />
                </div>

                <div className="container-premium text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold mb-6 border border-amber-500/30">
                            <Medal className="w-4 h-4" />
                            Limited Medals Available
                        </div>

                        <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-6 text-white">
                            Don't Miss Your Medal
                        </h2>
                        <p className="font-sans text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
                            Join 500+ athletes celebrating Republic Day with a stunning finisher medal
                        </p>
                        <p className="text-amber-400 font-semibold mb-10">
                            ⏰ Early Bird Price ₹399 ends 18th January!
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                asChild
                                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 font-display font-bold text-lg px-10 py-7 h-auto rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1"
                            >
                                <a href="#pricing">
                                    Get Premium Medal
                                    <Medal className="ml-2 w-5 h-5" />
                                </a>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="border-white/30 bg-transparent hover:bg-white/10 text-white font-display font-medium text-base px-8 py-7 h-auto rounded-xl transition-all"
                            >
                                <a href="/challenges/republic-day-challenges-2026/free-registration">
                                    Or Start Free
                                </a>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Sticky Mobile CTA - Only on mobile */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
                <div className="bg-white border-t border-slate-200 shadow-2xl shadow-black/10 px-4 py-3 safe-area-inset-bottom">
                    <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
                        <div className="flex-shrink-0">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">Starting from</p>
                            <p className="font-display font-bold text-xl text-slate-900">
                                ₹399 <span className="text-sm text-slate-500 font-normal">+ GST</span>
                            </p>
                        </div>
                        <Button
                            onClick={() => window.location.href = '/challenges/republic-day-challenges-2026/premium-registration'}
                            className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 text-white font-display font-bold px-6 py-5 h-auto rounded-xl shadow-lg shadow-primary/30 touch-manipulation flex-shrink-0"
                        >
                            Register Now →
                        </Button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default RepublicDayChallenge;

