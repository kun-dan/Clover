import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-mist/80">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mist/40 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-surface-floating border border-surface-border rounded-lg px-3 py-2 text-sm text-mist placeholder-mist/30",
              "focus:outline-none focus:border-clover-500 focus:ring-1 focus:ring-clover-500/40",
              "transition-colors duration-150",
              icon ? "pl-10" : undefined,
              error && "border-red-800 focus:border-red-600 focus:ring-red-600/30",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
