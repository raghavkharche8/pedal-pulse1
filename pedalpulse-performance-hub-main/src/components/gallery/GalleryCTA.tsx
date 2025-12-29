import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const GalleryCTA = () => {
    return (
        <section className="py-24 bg-gradient-to-br from-primary-dark to-accent/60">
            <div className="container-premium text-center">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl mx-auto"
                >
                    <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl leading-[1.15] text-background mb-5">
                        Your Achievement
                        <br />
                        Could Be Here
                    </h2>

                    <p className="font-sans text-lg text-background/80 mb-10 max-w-md mx-auto">
                        Join our next challenge and celebrate your success with the community
                    </p>

                    <Button
                        asChild
                        className="group bg-primary hover:bg-primary/90 text-background font-display font-semibold text-base px-10 py-6 h-auto rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 hover:scale-[1.02]"
                    >
                        <a href="/challenge">
                            View Current Challenges
                            <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                        </a>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};
