import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { BadgeCheck, Loader2 } from 'lucide-react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
    label: string;
    error?: string;
    success?: boolean;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightElement?: React.ReactNode;
    helperText?: string;
    as?: 'input' | 'select' | 'textarea';
    children?: React.ReactNode;
}

const FormField = forwardRef<HTMLInputElement | HTMLSelectElement, FormFieldProps>(({
    label,
    error,
    success,
    isLoading,
    leftIcon,
    rightElement,
    helperText,
    as = 'input',
    className,
    children,
    ...props
}, ref) => {
    const Component = as as 'input'; // Type assertion for dynamic component

    return (
        <div className="w-full space-y-2">
            <label className="block text-sm font-medium text-slate-700">
                {label} {props.required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative group">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {leftIcon}
                    </div>
                )}

                {as === 'select' ? (
                    <select
                        ref={ref as any}
                        className={cn(
                            "w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
                            error && "border-red-500 focus:ring-red-100 focus:border-red-500 animate-shake",
                            success && "border-green-500 focus:ring-green-100 focus:border-green-500",
                            leftIcon && "pl-10",
                            className
                        )}
                        {...props as any}
                    >
                        {children}
                    </select>
                ) : (
                    <input
                        ref={ref as any}
                        className={cn(
                            "w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
                            error && "border-red-500 focus:ring-red-100 focus:border-red-500 animate-shake",
                            success && "border-green-500 focus:ring-green-100 focus:border-green-500",
                            leftIcon && "pl-10",
                            rightElement && "pr-10", // Space for right element
                            className
                        )}
                        {...props}
                    />
                )}

                {/* Right Element (Loading, Success, or Custom) */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    {isLoading && <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />}
                    {!isLoading && success && <BadgeCheck className="w-5 h-5 text-green-500" />}
                    {!isLoading && !success && rightElement}
                </div>
            </div>

            {error ? (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    {error}
                </p>
            ) : helperText ? (
                <p className="text-xs text-slate-500 mt-1">{helperText}</p>
            ) : null}
        </div>
    );
});

FormField.displayName = "FormField";

export default FormField;
