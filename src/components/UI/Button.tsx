"use client";

import { ReactNode, forwardRef, ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ children, className = "", ...props }, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      className={twMerge(
        "bg-bg-secondary/50 backdrop-blur-lg border border-label-primary/30 w-full p-3 cursor-pointer transition-colors hover:bg-bg-secondary flex flex-col gap-4 relative z-10 shadow-[inset_3px_3px_16px_rgba(0,0,0,0.2)] disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
