import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GalleryHero } from '@/components/gallery/GalleryHero';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { GalleryCTA } from '@/components/gallery/GalleryCTA';
import { galleryImages } from '@/data/galleryData';

const GalleryPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <GalleryHero />

            {/* Gallery Section */}
            <section className="py-12 md:py-16 bg-background">
                <div className="container-premium">
                    <GalleryGrid images={galleryImages} />

                    {/* Many More Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-center mt-16"
                    >
                        <p className="font-display font-semibold text-2xl md:text-3xl text-text-secondary">
                            ...and many more
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <GalleryCTA />

            <Footer />
        </div>
    );
};

export default GalleryPage;
