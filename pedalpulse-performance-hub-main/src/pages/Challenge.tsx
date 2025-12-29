import { useRef } from 'react';
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
import medalImage from '@/assets/premium_challenge_medal.png';

// Razorpay Payment Link
const RAZORPAY_PAYMENT_LINK = 'https://rzp.io/rzp/EIU2D4YK';



const ChallengePage = () => {
    const eventStartDate = '2026-01-20T00:00:00';

    const faqItems = [
        {
            question: 'Can I participate from anywhere in India?',
            answer: 'Yes! Complete your challenge anywhere you prefer - road, track, treadmill, or cycling path.',
        },
        {
            question: 'Must I complete the full distance in one go?',
            answer: 'Yes, your chosen distance must be completed in a single session on any ONE day during 20-26 Jan.',
        },
        {
            question: 'Can I participate in multiple categories?',
            answer: "Yes, but you'll need to register separately for each category you want to complete.",
        },
        {
            question: 'When will I receive my medal?',
            answer: 'Medals are shipped within 5 working days after your proof is verified. Delivery typically takes 5-7 days.',
        },
        {
            question: "What if I can't complete my chosen distance?",
            answer: 'You can still submit a lower distance for e-certificate recognition, but physical medals are only for completed distances.',
        },
        {
            question: 'Is shipping included in the price?',
            answer: 'Yes, shipping across India is completely free for medal package.',
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

            {/* HERO SECTION - Professional White Theme */}
            <section className="relative min-h-[95vh] flex flex-col justify-center bg-background overflow-hidden pt-24 pb-16">

                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }} />

                {/* Ambient Glows - Subtle and Warm */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-100/50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

                <div className="container-premium relative z-10">
                    <div className="max-w-6xl mx-auto">

                        {/* 1. Header Content - Centered */}
                        <div className="text-center mb-16 max-w-3xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 mb-6"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    Registrations Open for Republic Day
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="font-display font-bold text-5xl md:text-7xl tracking-tight text-slate-900 mb-6"
                            >
                                Republic Day <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-slate-800 to-green-600">
                                    Virtual Challenge
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="font-sans text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto"
                            >
                                Celebrate the spirit of India. Run or ride anywhere, anytime between <strong className="text-slate-800">20-26 January 2026</strong>.
                            </motion.p>
                        </div>

                        {/* 2. Main Visual Area - Two Columns on Desktop */}
                        <div className="grid lg:grid-cols-12 gap-12 items-center">

                            {/* Left: Medal Showcase */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="lg:col-span-7 relative flex justify-center lg:justify-end"
                            >
                                <div className="relative w-[320px] md:w-[480px] aspect-square">
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
                                        <p className="text-slate-500 text-sm font-medium mb-1">Registration Fee</p>
                                        <div className="flex items-baseline gap-3">
                                            <span className="font-display font-bold text-5xl text-slate-900">₹399</span>
                                            <span className="text-xl text-slate-400 line-through">₹449</span>
                                        </div>
                                        <p className="text-green-600 text-xs font-semibold mt-2 px-2 py-1 bg-green-50 rounded-md inline-block">
                                            Early Bird Offer Active
                                        </p>
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
                                        <a href={RAZORPAY_PAYMENT_LINK}>
                                            Sign Up Now
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </a>
                                    </Button>

                                    <div className="mt-6 pt-6 border-t border-slate-100">
                                        <p className="text-xs text-center text-slate-400 uppercase tracking-widest mb-3">Event Starts In</p>
                                        <div className="scale-90 origin-top">
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
                                title: 'Heavy-Duty Medal',
                                desc: 'A meticulously crafted 3.5-inch metal medal with vivid enamel coloring and a premium satin ribbon.',
                                delay: 0,
                                highlight: 'Physical Item'
                            },
                            {
                                icon: Award,
                                title: 'Official E-Certificate',
                                desc: 'A personalized digital certificate with your name, distance, and time, signed by the race director.',
                                delay: 0.1,
                                highlight: 'Instant Download'
                            },
                            {
                                icon: Trophy,
                                title: 'Hall of Fame',
                                desc: 'Your name immortalized on our finisher leaderboard. Share your achievement with the entire community.',
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



            {/* PRICING - Clean Comparison */}
            <section id="pricing" className="py-20 bg-background">
                <div className="container-premium">
                    <motion.div {...fadeUp} className="text-center mb-12">
                        <h2 className="font-display font-bold text-3xl lg:text-4xl text-text-primary mb-3">
                            Simple Pricing
                        </h2>
                        <p className="font-sans text-text-secondary">
                            Choose what works for you
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {/* Free Tier */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-surface rounded-2xl p-8 border border-border"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-display font-semibold text-xl text-text-primary">Free</h3>
                                    <p className="font-sans text-sm text-text-muted">E-Certificate Only</p>
                                </div>
                                <p className="font-display font-bold text-3xl text-text-primary">₹0</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {['Digital e-certificate', 'Name on finisher list', 'Social media badge'].map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-sm text-text-secondary">
                                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                asChild
                                variant="outline"
                                className="w-full py-5 font-display font-semibold border-2 hover:bg-text-primary hover:text-background transition-all"
                            >
                                <a href="#register">Register Free</a>
                            </Button>
                        </motion.div>

                        {/* Premium Tier */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="relative bg-primary-dark rounded-2xl p-8 text-background overflow-hidden"
                        >
                            {/* Popular Badge */}
                            <div className="absolute top-4 right-4 px-3 py-1 bg-accent-warm rounded-full">
                                <span className="font-sans font-semibold text-xs text-primary-dark">Best Value</span>
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-display font-semibold text-xl">Premium</h3>
                                    <p className="font-sans text-sm text-background/70">Medal + Certificate</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-sans text-sm text-background/50 line-through">₹449</p>
                                    <p className="font-display font-bold text-3xl text-accent-warm">₹399</p>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {[
                                    'Premium metal medal',
                                    'Digital e-certificate',
                                    'Name on finisher list',
                                    'Free shipping India-wide',
                                    'Priority support',
                                ].map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-sm text-background/90">
                                        <Check className="w-4 h-4 text-accent-warm flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                asChild
                                className="w-full py-5 font-display font-semibold bg-primary hover:bg-primary/90 transition-all shadow-lg"
                            >
                                <a href={RAZORPAY_PAYMENT_LINK}>Get Your Medal</a>
                            </Button>
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
                                desc: 'Run, walk, jog, or cycle your chosen distance on any ONE DAY during the event period (20 - 26 January 2026). Complete your activity anywhere you prefer!',
                                color: 'bg-green-500'
                            },
                            {
                                step: '03',
                                title: 'Submit Proof',
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
                            <p className="font-sans font-semibold text-primary text-xl mb-2">20 - 26 January 2026</p>
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
                                        {['25Km', '50Km', '100Km'].map(d => (
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
                                    <p className="text-xs text-text-muted mb-1">Google Form shared on</p>
                                    <p className="font-semibold text-text-primary">20 January 2026</p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-muted mb-1">Medal Shipping</p>
                                    <p className="font-semibold text-text-primary">Within 5 working days</p>
                                    <p className="text-xs text-text-muted">after event completion</p>
                                </div>
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

            {/* FINAL CTA - Clean */}
            <section className="py-20 bg-gradient-to-br from-primary-dark to-accent/80 text-background">
                <div className="container-premium text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl mb-4">
                            Ready to Challenge Yourself?
                        </h2>
                        <p className="font-sans text-lg text-background/80 mb-10 max-w-md mx-auto">
                            Join 500+ participants earning their achievement medal
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                asChild
                                className="bg-primary hover:bg-primary/90 text-background font-display font-semibold text-base px-10 py-6 h-auto rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
                            >
                                <a href={RAZORPAY_PAYMENT_LINK}>
                                    Register Now · ₹399
                                    <ChevronRight className="ml-1 w-4 h-4" />
                                </a>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="border-background/30 bg-transparent hover:bg-background/10 text-background font-display font-medium text-base px-10 py-6 h-auto rounded-xl transition-all"
                            >
                                <a href="#pricing">Free Registration</a>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ChallengePage;
