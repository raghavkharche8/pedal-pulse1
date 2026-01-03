import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Logo from '@/Logo/Logo.png';

const About = () => {
    const teamValues = [
        {
            icon: '🚀',
            title: 'Accessible effort',
            description: 'Fitness shouldn\'t feel intimidating or exclusive. If you\'re willing to try, you belong here.',
        },
        {
            icon: '✓',
            title: 'Effort counts',
            description: 'Big or small, finishing matters. We design everything to acknowledge that moment.',
        },
        {
            icon: '🤝',
            title: 'No lone wolves here',
            description: 'Thousands of athletes across India, connected by effort — not ego.',
        },
        {
            icon: '💎',
            title: 'If it\'s worth earning, it\'s worth doing right',
            description: 'From medals to platform details, we don\'t ship anything we wouldn\'t want ourselves.',
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <section className="pt-32 pb-16 bg-gradient-to-b from-surface to-background">
                <div className="container-premium text-center">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <img
                            src={Logo}
                            alt="PedalPulse Logo"
                            className="w-32 h-32 md:w-40 md:h-40 mx-auto object-contain"
                        />
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="font-sans font-semibold text-xs tracking-[0.15em] text-primary uppercase mb-4"
                    >
                        Our Story
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-text-primary mb-6"
                    >
                        For people who show up.
                        <br />
                        <span className="text-primary">Even when no one's watching.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="font-sans text-lg md:text-xl text-text-secondary max-w-2xl mx-auto"
                    >
                        PedalPulse exists to give effort the respect it deserves —
                        <br className="hidden md:block" />
                        whether it's your first 5K or your longest ride yet.
                    </motion.p>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 bg-background">
                <div className="container-premium">
                    <div className="max-w-2xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="font-sans text-lg leading-relaxed space-y-6"
                        >
                            <p className="text-text-primary">
                                It started the same way most good things do —<br />
                                with tired legs and unfinished goals.
                            </p>

                            <p className="text-text-secondary">
                                In 2023, a small group of cyclists and runners noticed something frustrating.
                            </p>

                            <p className="text-text-muted">
                                Big races had medals.<br />
                                Big names had recognition.<br />
                                Everyday athletes had… nothing.
                            </p>

                            <p className="text-text-muted">
                                People riding before work.<br />
                                Running after long days.<br />
                                Finishing their first distance quietly.
                            </p>

                            <p className="text-text-primary font-medium">
                                That effort mattered.<br />
                                So we built something for it.
                            </p>

                            <div className="pt-6">
                                <p className="text-text-primary">
                                    PedalPulse lets anyone participate from anywhere.<br />
                                    One day. One distance. No shortcuts.
                                </p>
                            </div>

                            <p className="text-text-muted text-base">
                                The medal isn't the reward.<br />
                                The work is.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Human Signal - Before Values */}
            <section className="py-12 bg-background border-t border-border/30">
                <div className="container-premium text-center">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="font-sans text-lg md:text-xl text-text-muted italic"
                    >
                        Built by people who still check their Strava before checking email.
                    </motion.p>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-surface">
                <div className="container-premium">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary">
                            What we care about (and what we don't)
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teamValues.map((value, index) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-background rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                            >
                                <span className="text-3xl mb-4 block">{value.icon}</span>
                                <h3 className="font-display font-semibold text-lg text-text-primary mb-3 leading-tight">
                                    {value.title}
                                </h3>
                                <p className="font-sans text-sm text-text-secondary leading-relaxed">
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-zinc-950">
                <div className="container-premium text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-background mb-4">
                            Ready to Start?
                        </h2>
                        <p className="font-sans text-lg text-background/80 mb-8 max-w-xl mx-auto">
                            Find a challenge. Show up. Finish.
                        </p>
                        <a
                            href="/challenges"
                            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary text-primary-foreground font-sans font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30"
                        >
                            Explore Challenges
                        </a>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
