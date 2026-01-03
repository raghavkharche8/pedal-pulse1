import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Globe, Clock, Medal, Users } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Participate Anywhere',
    description: 'No location restrictions. Complete your challenge wherever you feel strongest.',
  },
  {
    icon: Clock,
    title: 'Flexible Timing',
    description: '7-day event window. Choose the day that works for your schedule and energy.',
  },
  {
    icon: Medal,
    title: 'Premium Recognition',
    description: 'High-quality medals and certificates. Your achievement deserves premium quality.',
  },
  {
    icon: Users,
    title: 'Elite Community',
    description: 'Join 500+ athletes who push limits and celebrate milestones together.',
  },
];

const WhyPedalPulse = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative overflow-hidden section-padding bg-zinc-950">
      {/* Dark Gradient Background Removed */}

      <div className="relative z-10 container-premium">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-16 lg:mb-20"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-primary-foreground tracking-[-0.02em]">
            The PedalPulse Difference
          </h2>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.2 + index * 0.1,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="group"
            >
              <div className="h-full p-8 lg:p-10 rounded-xl bg-primary-foreground/[0.08] backdrop-blur-xl border border-primary-foreground/[0.12] transition-all duration-300 ease-premium group-hover:border-primary/50 group-hover:bg-primary-foreground/[0.15] group-hover:-translate-y-1 group-hover:shadow-xl">
                {/* Icon */}
                <feature.icon
                  className="w-12 h-12 text-accent-warm"
                  strokeWidth={1.5}
                />

                {/* Title */}
                <h3 className="font-display font-semibold text-xl lg:text-2xl text-primary-foreground mt-5">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="font-sans text-base text-primary-foreground/70 leading-relaxed mt-3">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyPedalPulse;
