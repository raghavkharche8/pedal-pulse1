import { motion } from 'framer-motion';
import { Grid3X3, LayoutGrid } from 'lucide-react';
import { challengeFilters, ChallengeFilter } from '@/data/galleryData';

interface FilterBarProps {
    activeFilter: ChallengeFilter;
    onFilterChange: (filter: ChallengeFilter) => void;
    viewMode: 'grid' | 'masonry';
    onViewModeChange: (mode: 'grid' | 'masonry') => void;
}

export const FilterBar = ({ activeFilter, onFilterChange, viewMode, onViewModeChange }: FilterBarProps) => {
    return (
        <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="container-premium py-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

                    {/* Challenge Filters */}
                    <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                        <span className="font-sans font-medium text-sm text-text-muted mr-2 hidden sm:inline">
                            Challenge:
                        </span>
                        {challengeFilters.map((filter) => (
                            <motion.button
                                key={filter.id}
                                onClick={() => onFilterChange(filter.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`px-5 py-2.5 rounded-full font-sans font-medium text-sm transition-all duration-200 ${activeFilter === filter.id
                                        ? 'bg-primary text-background shadow-md'
                                        : 'bg-primary/8 text-text-secondary hover:bg-primary/15'
                                    }`}
                            >
                                {filter.label}
                            </motion.button>
                        ))}
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2">
                        <span className="font-sans font-medium text-sm text-text-muted mr-2 hidden sm:inline">
                            View:
                        </span>
                        <motion.button
                            onClick={() => onViewModeChange('grid')}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid'
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-muted hover:text-text-secondary'
                                }`}
                            aria-label="Grid view"
                        >
                            <Grid3X3 className="w-6 h-6" />
                        </motion.button>
                        <motion.button
                            onClick={() => onViewModeChange('masonry')}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-2.5 rounded-lg transition-colors ${viewMode === 'masonry'
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-muted hover:text-text-secondary'
                                }`}
                            aria-label="Masonry view"
                        >
                            <LayoutGrid className="w-6 h-6" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};
