import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-target haptic-medium gpu-accelerated will-change-transform focus-ring",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-gigavibe-500 to-gigavibe-600 text-white hover:from-gigavibe-600 hover:to-gigavibe-700 shadow-gigavibe-button hover:shadow-lg transform hover:scale-105",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25",
        outline:
          "border-2 border-gigavibe-500/50 bg-transparent text-gigavibe-400 hover:bg-gigavibe-500/10 hover:border-gigavibe-400 hover:text-gigavibe-300 backdrop-blur-sm",
        secondary:
          "bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700 shadow-lg",
        ghost:
          "hover:bg-gigavibe-500/10 hover:text-gigavibe-300 backdrop-blur-sm",
        link: "text-gigavibe-400 underline-offset-4 hover:underline hover:text-gigavibe-300",
        gigavibe:
          "bg-gradient-to-r from-gigavibe-500 via-purple-500 to-blue-500 text-white hover:from-gigavibe-600 hover:via-purple-600 hover:to-blue-600 shadow-gigavibe-glow animate-gigavibe-glow transform hover:scale-105",
        glassmorphism:
          "gigavibe-glass text-white hover:bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl",
        success:
          "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/25",
        warning:
          "bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 shadow-lg hover:shadow-yellow-500/25",
        error:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25",
        floating:
          "bg-gradient-to-r from-gigavibe-500 to-purple-600 text-white shadow-gigavibe-glow hover:shadow-gigavibe-button transform hover:scale-110 active:scale-95 rounded-full",
      },
      size: {
        default: "h-11 px-6 py-3 text-sm",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-2xl px-8 text-base font-semibold",
        icon: "h-11 w-11 rounded-xl",
        xl: "h-16 rounded-2xl px-10 text-lg font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
