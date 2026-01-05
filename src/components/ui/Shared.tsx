import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const variants = {
            primary: 'bg-brand text-white hover:opacity-90 shadow-sm',
            secondary: 'bg-gray-800 text-gray-100 hover:bg-gray-700',
            outline: 'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100',
            ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
            danger: 'bg-red-600 text-white hover:bg-red-700',
        };

        const sizes = {
            sm: 'h-8 px-3 text-xs',
            md: 'h-10 px-4 py-2',
            lg: 'h-12 px-6 text-lg',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-ring-brand disabled:pointer-events-none disabled:opacity-50',
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

// --- Input ---
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    'flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus-ring-brand disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 dark:text-gray-100',
                    className
                )}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

// --- Card ---
export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn('rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 text-gray-950 dark:text-gray-50 shadow-sm', className)}>
        {children}
    </div>
);

// --- Badge ---
export const Badge = ({ children, variant = 'default', className }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'destructive'; className?: string }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        destructive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', variants[variant], className)}>
            {children}
        </span>
    );
};

// --- Modal ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-800">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">✕</button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};
