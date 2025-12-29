import { motion } from 'framer-motion';
import { Image, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    filterName?: string;
    onReset?: () => void;
}

export const EmptyState = ({ filterName, onReset }: EmptyStateProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-24 text-center"
        >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
                <Image className="w-8 h-8 text-text-muted" />
            </div>

            <h3 className="font-display font-semibold text-2xl text-text-primary mb-3">
                {filterName ? `No Photos for "${filterName}"` : 'No Photos Yet'}
            </h3>

            <p className="font-sans text-base text-text-muted max-w-sm mx-auto mb-8">
                {filterName
                    ? 'This challenge hasn\'t been completed yet. Be the first!'
                    : 'Photos from completed challenges will appear here.'
                }
            </p>

            {onReset ? (
                <Button
                    onClick={onReset}
                    variant="outline"
                    className="font-display font-semibold px-6 py-5 h-auto rounded-xl border-2"
                >
                    View All Photos
                </Button>
            ) : (
                <Button
                    asChild
                    className="group bg-primary hover:bg-primary/90 text-background font-display font-semibold px-8 py-5 h-auto rounded-xl"
                >
                    <a href="/challenge">
                        View Current Challenges
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </a>
                </Button>
            )}
        </motion.div>
    );
};
