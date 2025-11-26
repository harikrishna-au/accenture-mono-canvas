import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface OutlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "large";
}

const OutlineButton = forwardRef<HTMLButtonElement, OutlineButtonProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "bg-background text-foreground border border-border rounded transition-colors hover:bg-foreground hover:text-background disabled:opacity-50 disabled:cursor-not-allowed",
          variant === "default" && "px-6 py-2 text-base",
          variant === "large" && "px-12 py-6 text-2xl font-bold",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

OutlineButton.displayName = "OutlineButton";

export default OutlineButton;
