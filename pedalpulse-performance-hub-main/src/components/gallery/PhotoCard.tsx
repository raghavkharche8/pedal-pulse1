import { useState } from 'react';
import { motion } from 'framer-motion';
import { GalleryImage } from '@/data/galleryData';

interface PhotoCardProps {
    image: GalleryImage;
    index: number;
}

export const PhotoCard = ({ image, index }: PhotoCardProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="relative overflow-hidden rounded-2xl aspect-[4/5]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Skeleton Loader */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-surface animate-pulse" />
            )}

            {/* Image */}
            <motion.img
                src={image.src}
                alt="PedalPulse participant achievement"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out"
                style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                onLoad={() => setIsLoaded(true)}
                loading="lazy"
            />
        </motion.div>
    );
};
