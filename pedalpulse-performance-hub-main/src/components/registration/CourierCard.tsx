import { cn } from '@/lib/utils';
import { Truck } from 'lucide-react';

interface CourierCardProps {
    id: string;
    value: string;
    label: string;
    selected: boolean;
    onSelect: (value: string) => void;
}

const CourierCard = ({
    id,
    value,
    label,
    selected,
    onSelect
}: CourierCardProps) => {
    return (
        <label
            htmlFor={id}
            className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center gap-2 h-full",
                selected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-transparent bg-slate-50 hover:bg-slate-100 hover:border-slate-200"
            )}
            onClick={() => onSelect(value)}
        >
            <input
                type="radio"
                name="courier_preference"
                id={id}
                value={value}
                checked={selected}
                onChange={() => onSelect(value)}
                className="sr-only"
            />

            <div className={cn(
                "p-2 rounded-lg transition-colors",
                selected ? "text-primary" : "text-slate-400"
            )}>
                <Truck className="w-6 h-6" />
            </div>

            <span className={cn("font-medium text-sm", selected ? "text-primary-dark" : "text-slate-600")}>
                {label}
            </span>
        </label>
    );
};

export default CourierCard;
