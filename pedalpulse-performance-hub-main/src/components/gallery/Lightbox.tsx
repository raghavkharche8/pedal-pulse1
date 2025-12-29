import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Share2, MapPin, Clock, Activity } from 'lucide-react';
import { GalleryImage } from '@/data/galleryData';
import { Button } from '@/components/ui/button';

interface LightboxProps {
    images: GalleryImage[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}

export const Lightbox = ({ images, currentIndex, isOpen, onClose, onPrev, onNext }: LightboxProps) => {
    const currentImage = images[currentIndex];
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < images.length - 1;

    // Keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'Escape':
                onClose();
                break;
            case 'ArrowLeft':
                if (hasPrev) onPrev();
                break;
            case 'ArrowRight':
                if (hasNext) onNext();
                break;
        }
    }, [isOpen, hasPrev, hasNext, onClose, onPrev, onNext]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${currentImage.participantName}'s Achievement`,
                    text: `Check out ${currentImage.participantName}'s ${currentImage.distance} ${currentImage.activity} achievement on PedalPulse!`,
                    url: window.location.href,
                });
            } catch {
                // User cancelled or share failed
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && currentImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-primary-dark/95 backdrop-blur-xl" />

                    {/* Close Button */}
                    <motion.button
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute top-8 right-8 z-50 p-2 rounded-full hover:bg-background/10 transition-colors"
                        aria-label="Close lightbox"
                    >
                        <X className="w-8 h-8 text-background" />
                    </motion.button>

                    {/* Navigation - Previous */}
                    {hasPrev && (
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onClick={(e) => { e.stopPropagation(); onPrev(); }}
                            className="absolute left-8 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-background/15 backdrop-blur-sm flex items-center justify-center hover:bg-background/25 hover:scale-110 transition-all"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-7 h-7 text-background" />
                        </motion.button>
                    )}

                    {/* Navigation - Next */}
                    {hasNext && (
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onClick={(e) => { e.stopPropagation(); onNext(); }}
                            className="absolute right-8 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-background/15 backdrop-blur-sm flex items-center justify-center hover:bg-background/25 hover:scale-110 transition-all"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-7 h-7 text-background" />
                        </motion.button>
                    )}

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-40 w-full max-w-5xl mx-4 md:mx-8 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center"
                    >
                        {/* Image */}
                        <div className="flex-[3] w-full lg:w-auto">
                            <motion.img
                                key={currentImage.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                src={currentImage.src}
                                alt={`${currentImage.participantName} with PedalPulse medal`}
                                className="w-full max-h-[60vh] lg:max-h-[80vh] object-contain rounded-xl shadow-2xl"
                            />
                        </div>

                        {/* Details */}
                        <div className="flex-[2] w-full lg:w-auto text-center lg:text-left px-4 lg:px-0">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h2 className="font-display font-semibold text-2xl lg:text-3xl text-background">
                                    {currentImage.participantName}
                                </h2>
                                <p className="font-sans font-medium text-base text-accent-warm mt-3">
                                    {currentImage.challenge}
                                </p>

                                <div className="h-px bg-background/20 my-6" />

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 justify-center lg:justify-start">
                                        <Activity className="w-5 h-5 text-background/60" />
                                        <div>
                                            <p className="font-display font-semibold text-xl text-background">
                                                {currentImage.distance}
                                            </p>
                                            <p className="font-sans text-sm text-background/70">
                                                {currentImage.activity}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 justify-center lg:justify-start">
                                        <Clock className="w-5 h-5 text-background/60" />
                                        <p className="font-sans text-base text-background/70">
                                            {currentImage.time}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 justify-center lg:justify-start mt-4">
                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-background/10 rounded-full">
                                            <MapPin className="w-4 h-4 text-background/80" />
                                            <span className="font-sans font-medium text-sm text-background/80">
                                                {currentImage.location}
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleShare}
                                    className="mt-8 bg-background text-primary-dark font-display font-semibold px-8 py-5 h-auto rounded-xl hover:bg-background/90 hover:scale-[1.02] transition-all"
                                >
                                    <Share2 className="w-5 h-5 mr-2" />
                                    Share Achievement
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Image Counter */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
                        <span className="font-sans text-sm text-background/60">
                            {currentIndex + 1} / {images.length}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
