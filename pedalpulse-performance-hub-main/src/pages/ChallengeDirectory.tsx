import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import medalImage from '@/republic-medal.png';

const ChallengeDirectory = () => {
    const fadeUp = {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5, ease: "easeOut" }
    };

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Header />

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 bg-zinc-950 text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }} />

                <div className="container-premium relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="font-display font-bold text-4xl md:text-6xl mb-6 text-white">
                            Challenges
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            Push your limits, earn premium rewards, and join a community of achievers.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ONGOING CHALLENGES */}
            <section className="py-24 bg-surface">
                <div className="container-premium">
                    <motion.div {...fadeUp} className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-green-600 font-semibold tracking-wide uppercase text-sm">Active Events</span>
                        </div>
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-slate-900">
                            Ongoing Challenges
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* REPUBLIC DAY CHALLENGE CARD */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="group bg-white rounded-3xl overflow-hidden border border-border hover:shadow-premium transition-all duration-300 hover:-translate-y-1 flex flex-col"
                        >
                            {/* Image Area */}
                            <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                <img
                                    src={medalImage}
                                    alt="Republic Day Medal"
                                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                                    Top Rated
                                </div>
                                <div className="absolute bottom-4 left-4 text-white">
                                    <p className="font-display font-bold text-xl">Republic Day 2026</p>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Event Date</p>
                                        <div className="flex items-center gap-2 text-slate-800 font-semibold">
                                            <Calendar className="w-4 h-4 text-orange-500" />
                                            26 Jan - 1 Feb 2026
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 mb-1">Category</p>
                                        <p className="text-slate-800 font-semibold">Run / Ride</p>
                                    </div>
                                </div>

                                <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-1">
                                    Celebrate the spirit of India. Join 500+ participants in this virtual challenge. Premium medal and certificate included.
                                </p>

                                <Button
                                    asChild
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white h-auto py-4 rounded-xl font-semibold shadow-lg shadow-slate-900/10 group-hover:shadow-slate-900/20 transition-all"
                                >
                                    <Link to="/challenges/republic-day-challenges-2026">
                                        View Details
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>

                        {/* PLACEHOLDER FOR UPCOMING */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="group bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 flex flex-col items-center justify-center p-8 text-center min-h-[400px]"
                        >
                            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-6">
                                <Calendar className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="font-display font-bold text-xl text-slate-400 mb-2">Coming Soon</h3>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                Stay tuned for our Summer '26 series. Follow us on Instagram for updates.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* PAST EVENTS TEASER */}
            <section className="py-24 bg-white border-t border-border">
                <div className="container-premium text-center">
                    <h2 className="font-display font-bold text-3xl mb-4 text-slate-900">Missed a Challenge?</h2>
                    <p className="text-slate-500 mb-8">Browse our Hall of Fame to see past achievements.</p>
                    <Button variant="outline" asChild className="rounded-full px-8">
                        <Link to="/gallery">Visit Gallery</Link>
                    </Button>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ChallengeDirectory;
