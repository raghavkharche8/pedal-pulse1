import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface CountdownTimerProps {
    targetDate: string;
}

export const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const timeUnits: Array<{ value: number; label: string }> = [
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hrs' },
        { value: timeLeft.minutes, label: 'Min' },
        { value: timeLeft.seconds, label: 'Sec' },
    ];

    return (
        <div className="flex gap-3 justify-center">
            {timeUnits.map((unit, index) => (
                <motion.div
                    key={unit.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="flex flex-col items-center justify-center w-16 h-16 sm:w-18 sm:h-18 bg-slate-50 rounded-xl border border-slate-200"
                >
                    <motion.span
                        key={unit.value}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tabular-nums"
                    >
                        {String(unit.value).padStart(2, '0')}
                    </motion.span>
                    <span className="font-sans font-medium text-[10px] tracking-wider text-slate-500 uppercase">
                        {unit.label}
                    </span>
                </motion.div>
            ))}
        </div>
    );
};
