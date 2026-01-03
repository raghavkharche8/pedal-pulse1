import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChallengeSpotlight from '@/components/ChallengeSpotlight';
import HowItWorks from '@/components/HowItWorks';
import WhyPedalPulse from '@/components/WhyPedalPulse';
import StatsSection from '@/components/StatsSection';

const Index = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-grow">
                {/* Hero Section - Premium Cinematic */}
                <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
                    {/* Background with subtle parallax/zoom effect */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <motion.div
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 10, ease: "easeOut" }}
                            className="w-full h-full"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background z-10" />
                            <img
                                src="https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop"
                                alt="Cyclist Background"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </div>

                    <div className="container-premium relative z-20 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-slate-950 font-sans font-medium text-xs tracking-[0.2em] uppercase mb-8 hover:bg-white/40 transition-colors cursor-default border border-white/20">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                Premium Virtual Challenges
                            </span>

                            <h1 className="font-display font-bold text-6xl md:text-7xl lg:text-8xl leading-[1] tracking-tighter text-white mb-8">
                                Push Your Limits.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-warm to-primary animate-gradient bg-[length:200%_auto]">
                                    Ride The Distance.
                                </span>
                            </h1>

                            <p className="font-sans text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                                Join India's elite community of athletes. Compete in premium virtual events,
                                track your progress, and earn medals that matter.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                <a
                                    href="/challenges"
                                    className="group relative inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-sans font-semibold text-lg rounded-full overflow-hidden transition-transform active:scale-95 shadow-premium hover:shadow-premium-hover"
                                >
                                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                    <span className="relative">Start Your Journey</span>
                                </a>
                                <a
                                    href="/about"
                                    className="px-8 py-4 rounded-full glass text-slate-950 font-sans font-semibold text-lg hover:bg-white/40 transition-all duration-300 backdrop-blur-md border border-white/20"
                                >
                                    Our Story
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
                    >
                        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
                        <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
                    </motion.div>
                </section>

                <StatsSection />
                <ChallengeSpotlight />

                {/* Medal Showcase - Premium Dark Gallery Style */}
                <section className="py-32 bg-foreground relative overflow-hidden">
                    {/* Background Texture - Radial Gradient for Spotlight Effect */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-40" />
                    <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />

                    <div className="container-premium relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm text-accent-warm text-xs font-bold tracking-widest uppercase mb-6">
                                Exclusive Rewards
                            </span>
                            <h2 className="font-display font-bold text-5xl md:text-6xl mb-8 text-white tracking-tight">
                                The Finisher's Collection
                            </h2>
                            <p className="font-sans text-xl text-white/70 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                                More than just metal. Explore our gallery of premium, heavy-duty medals.
                                Each one is a crafted symbol of the sweat, grit, and glory of your achievement.
                            </p>
                            <a
                                href="/gallery"
                                className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-foreground font-sans font-bold text-lg rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all duration-300"
                            >
                                Enter Hall of Fame
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        </motion.div>
                    </div>
                </section>
                <HowItWorks />
                <WhyPedalPulse />


            </main>
            <Footer />
        </div>
    );
};

export default Index;
