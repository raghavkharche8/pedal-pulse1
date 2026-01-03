import { cn } from '@/lib/utils';
import { Bike, Footprints } from 'lucide-react';

interface SportDistanceCardProps {
    id: string;
    value: string;
    label: string;
    sublabel: string;
    type: 'run' | 'ride';
    selected: boolean;
    onSelect: (value: string) => void;
}

const SportDistanceCard = ({
    id,
    value,
    label,
    sublabel,
    type,
    selected,
    onSelect
}: SportDistanceCardProps) => {
    return (
        <label
            htmlFor={id}
            className={cn(
                "relative flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 group",
                selected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-transparent bg-slate-50 hover:bg-slate-100 hover:border-slate-200"
            )}
            onClick={() => onSelect(value)}
        >
            <input
                type="radio"
                name="sport_distance"
                id={id}
                value={value}
                checked={selected}
                onChange={() => onSelect(value)}
                className="sr-only"
            />

            <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                selected ? "bg-primary text-white" : "bg-white text-slate-400 group-hover:text-slate-600 shadow-sm"
            )}>
                {type === 'run' ? <Footprints className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
            </div>

            <div>
                <h4 className={cn("font-display font-semibold text-lg leading-tight", selected ? "text-primary-dark" : "text-slate-800")}>
                    {label}
                </h4>
                <p className="text-sm text-slate-500 font-sans">{sublabel}</p>
            </div>

            {selected && (
                <div className="absolute top-1/2 right-4 -translate-y-1/2 w-4 h-4 rounded-full bg-primary flex items-center justify-center animate-in zoom-in duration-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
            )}
        </label>
    );
};

export default SportDistanceCard;
