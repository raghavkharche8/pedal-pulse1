import { motion } from 'framer-motion';

export const GalleryHero = () => {
    return (
        <section className="pt-32 pb-12 bg-gradient-to-b from-surface to-background">
            <div className="container-premium text-center">
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="font-sans font-semibold text-xs tracking-[0.15em] text-primary uppercase mb-4"
                >
                    Hall of Achievers
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-text-primary mb-5"
                >
                    Every Achievement
                    <br />
                    <span className="text-primary">Tells A Story</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="font-sans text-lg md:text-xl text-text-secondary max-w-xl mx-auto"
                >
                    Join our growing community of athletes who turned goals into medals
                </motion.p>
            </div>
        </section>
    );
};
