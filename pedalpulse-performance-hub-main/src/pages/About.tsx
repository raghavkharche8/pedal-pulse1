import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Logo from '@/Logo/Logo.png';

const About = () => {
    const teamValues = [
        {
            icon: '🎯',
            title: 'Mission-Driven',
            description: 'We believe fitness should be accessible, fun, and rewarding for everyone regardless of their starting point.',
        },
        {
            icon: '🏆',
            title: 'Achievement Focused',
            description: 'Every milestone deserves celebration. Our medals and recognition system keeps you motivated throughout your journey.',
        },
        {
            icon: '🤝',
            title: 'Community First',
            description: 'Join thousands of athletes across India who support and inspire each other to push their limits.',
        },
        {
            icon: '🌟',
            title: 'Quality Excellence',
            description: 'From our premium medals to our seamless platform experience, we never compromise on quality.',
        },
    ];

    const stats = [
        { number: '50K+', label: 'Athletes' },
        { number: '100+', label: 'Challenges' },
        { number: '32+', label: 'Cities' },
        { number: '4.9', label: 'Rating' },
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
                        Empowering Athletes
                        <br />
                        <span className="text-primary">One Challenge at a Time</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="font-sans text-lg md:text-xl text-text-secondary max-w-2xl mx-auto"
                    >
                        PedalPulse was born from a simple idea: make fitness challenges accessible,
                        exciting, and rewarding for everyone across India.
                    </motion.p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-surface">
                <div className="container-premium">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="text-center"
                            >
                                <p className="font-display font-bold text-4xl md:text-5xl text-primary">
                                    {stat.number}
                                </p>
                                <p className="font-sans font-medium text-sm text-text-muted mt-2">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 bg-background">
                <div className="container-premium">
                    <div className="max-w-3xl mx-auto">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="font-display font-bold text-3xl md:text-4xl text-text-primary mb-8 text-center"
                        >
                            How It All Started
                        </motion.h2>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="space-y-6 text-text-secondary font-sans text-lg leading-relaxed"
                        >
                            <p>
                                In 2023, a group of passionate cyclists and runners came together with a vision:
                                to create a platform that celebrates every fitness achievement, big or small.
                            </p>
                            <p>
                                We noticed that while marathon runners and professional athletes received recognition,
                                everyday heroes—those cycling to work, running in their neighborhoods, or completing
                                their first 5K—often went unnoticed.
                            </p>
                            <p>
                                PedalPulse was created to change that. Our virtual challenges allow anyone, anywhere
                                in India, to participate at their own pace, track their progress, and earn beautiful
                                medals as a testament to their dedication.
                            </p>
                            <p>
                                Today, we're proud to have helped thousands of athletes discover the joy of
                                structured fitness goals and the satisfaction of crossing the finish line—wherever
                                that finish line may be.
                            </p>
                        </motion.div>
                    </div>
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
                        <p className="font-sans font-semibold text-xs tracking-[0.15em] text-primary uppercase mb-4">
                            What We Stand For
                        </p>
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary">
                            Our Core Values
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
                                <span className="text-4xl mb-4 block">{value.icon}</span>
                                <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
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
            <section className="py-20 bg-primary-dark">
                <div className="container-premium text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-background mb-4">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="font-sans text-lg text-background/80 mb-8 max-w-xl mx-auto">
                            Join thousands of athletes who have transformed their fitness journey with PedalPulse.
                        </p>
                        <a
                            href="/challenge"
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
