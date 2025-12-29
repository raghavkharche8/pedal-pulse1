import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
    question: string;
    answer: string;
}

interface AccordionProps {
    items: AccordionItem[];
}

export const Accordion = ({ items }: AccordionProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="bg-background rounded-xl overflow-hidden border border-border transition-all duration-200 hover:border-border/80"
                >
                    <button
                        onClick={() => toggleItem(index)}
                        className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                    >
                        <span className="font-sans font-medium text-base text-text-primary pr-4">
                            {item.question}
                        </span>
                        <motion.div
                            animate={{ rotate: openIndex === index ? 180 : 0 }}
                            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="flex-shrink-0"
                        >
                            <ChevronDown className="w-5 h-5 text-text-muted" />
                        </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                        {openIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="overflow-hidden"
                            >
                                <div className="px-6 pb-5 pt-0">
                                    <p className="font-sans text-sm leading-relaxed text-text-secondary">
                                        {item.answer}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
    );
};
