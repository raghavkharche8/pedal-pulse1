import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import medalImage from '@/republic-medal.png';

const ChallengeSpotlight = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="challenges" className="bg-secondary section-padding">
      <div className="container-premium">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-16"
        >
          <span className="font-sans font-semibold text-sm tracking-[0.12em] text-primary uppercase">
            Live Challenge
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-text-primary mt-3 tracking-[-0.02em]">
            What's live right now
          </h2>
        </motion.div>

        {/* Challenge Card */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card rounded-2xl shadow-premium overflow-hidden transition-all duration-300 ease-premium hover:-translate-y-2 hover:shadow-premium-hover border border-border/50 hover:border-primary/30">
            <div className="grid md:grid-cols-5">
              {/* Challenge Visual */}
              <div className="md:col-span-2 relative aspect-[4/3] md:aspect-auto">
                <img
                  src={medalImage}
                  alt="Republic Day Challenge Medal"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/40 to-transparent" />
              </div>

              {/* Challenge Details */}
              <div className="md:col-span-3 p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                <h3 className="font-display font-semibold text-2xl md:text-3xl text-text-primary leading-tight">
                  Republic Day Virtual Run/Ride 2026
                </h3>

                <div className="mt-4">
                  <span className="inline-block font-sans font-medium text-sm text-accent bg-accent/10 px-4 py-2 rounded-full">
                    26 Jan - 1 Feb 2026
                  </span>
                </div>

                <p className="font-sans text-base text-text-secondary leading-relaxed mt-6">
                  Complete your distance on any single day.<br />
                  Run, cycle, or walk — wherever you are.<br />
                  One effort. One submission. Done.
                </p>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="font-sans font-medium text-sm text-text-primary">Multiple Distances</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="font-sans font-medium text-sm text-text-primary">E-Cert & Medal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="font-sans font-medium text-sm text-text-primary">₹399 · Early bird</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <Button
                    asChild
                    size="lg"
                    className="font-display font-semibold text-base px-8 py-5 h-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 ease-premium hover:scale-[1.05] active:scale-[0.98] hover:-translate-y-0.5"
                  >
                    {/* TODO: Replace with Razorpay or registration link */}
                    <a href="/challenges/republic-day-challenges-2026">
                      View Challenge
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChallengeSpotlight;
