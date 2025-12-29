import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, X, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContactFab = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const contactNumber = "919238737970";

    const options = [
        {
            label: 'WhatsApp',
            icon: MessageCircle,
            action: () => window.open(`https://wa.me/${contactNumber}`, '_blank'),
            color: 'bg-green-500 hover:bg-green-600',
        },
        {
            label: 'Phone',
            icon: Phone,
            action: () => window.location.href = `tel:+${contactNumber}`,
            color: 'bg-blue-500 hover:bg-blue-600',
        },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-3"
                    >
                        {options.map((option, index) => (
                            <motion.div
                                key={option.label}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3"
                            >
                                <span className="bg-background/90 backdrop-blur-sm text-foreground px-3 py-1.5 rounded-lg shadow-sm font-medium text-sm border border-border">
                                    {option.label}
                                </span>
                                <Button
                                    size="icon"
                                    className={`rounded-full shadow-lg ${option.color} text-white w-12 h-12`}
                                    onClick={option.action}
                                >
                                    <option.icon className="w-5 h-5" />
                                </Button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="icon"
                className={`w-14 h-14 rounded-full shadow-xl transition-all duration-300 ${isOpen ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
                    }`}
                onClick={toggleOpen}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageSquareText className="w-6 h-6" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Button>
        </div>
    );
};

export default ContactFab;
