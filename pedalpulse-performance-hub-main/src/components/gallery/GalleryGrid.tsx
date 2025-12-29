import { motion, AnimatePresence } from 'framer-motion';
import { PhotoCard } from './PhotoCard';
import { GalleryImage } from '@/data/galleryData';

interface GalleryGridProps {
    images: GalleryImage[];
}

export const GalleryGrid = ({ images }: GalleryGridProps) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
            <AnimatePresence mode="popLayout">
                {images.map((image, index) => (
                    <motion.div
                        key={image.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                    >
                        <PhotoCard image={image} index={index} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
