import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { UserPlus, Activity, Award } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Register',
    description: 'Choose your challenge and preferred package in under 2 minutes',
  },
  {
    number: 2,
    icon: Activity,
    title: 'Complete',
    description: 'Run or cycle your distance on any single day during the event window',
  },
  {
    number: 3,
    icon: Award,
    title: 'Celebrate',
    description: 'Receive your medal and certificate. Share your achievement',
  },
];

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="bg-background section-padding">
      <div className="container-premium max-w-5xl">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="font-sans font-semibold text-sm tracking-[0.12em] text-primary uppercase">
            Simple Process
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-text-primary mt-3 tracking-[-0.02em]">
            Three Steps To Glory
          </h2>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.6, 
                delay: 0.2 + index * 0.15, 
                ease: [0.4, 0, 0.2, 1] 
              }}
              className="text-center group"
            >
              {/* Number Badge */}
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent-warm flex items-center justify-center shadow-lg transition-all duration-300 ease-premium group-hover:-translate-y-2 group-hover:scale-110 group-hover:shadow-xl">
                <span className="font-display font-bold text-3xl text-primary-foreground">
                  {step.number}
                </span>
              </div>

              {/* Icon */}
              <div className="mt-6">
                <step.icon className="w-10 h-10 mx-auto text-accent" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="font-display font-semibold text-xl text-text-primary mt-5">
                {step.title}
              </h3>

              {/* Description */}
              <p className="font-sans text-base text-text-secondary leading-relaxed mt-3">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
