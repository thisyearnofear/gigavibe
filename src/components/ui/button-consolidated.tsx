import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * CONSOLIDATED BUTTON SYSTEM
 * Following GIGAVIBE Core Principles:
 * - ENHANCEMENT FIRST: Enhanced existing button with better hierarchy
 * - AGGRESSIVE CONSOLIDATION: Reduced from 12 to 5 variants
 * - DRY: Single source of truth for button styling
 * - CLEAN: Clear semantic naming and purpose
 */

const buttonVariants = cva(
  // Base styles - optimized for performance and accessibility
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gigavibe-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target will-change-transform",
  {
    variants: {
      variant: {
        // PRIMARY: Main call-to-action buttons
        primary: [
          "bg-gigavibe-500 text-white",
          "hover:bg-gigavibe-600 hover:scale-105",
          "active:scale-95",
          "shadow-lg shadow-gigavibe-500/25",
          "focus:ring-gigavibe-500"
        ].join(" "),
        
        // SECONDARY: Supporting actions
        secondary: [
          "border-2 border-gigavibe-500/50 bg-transparent text-gigavibe-400",
          "hover:bg-gigavibe-500/10 hover:border-gigavibe-400 hover:text-gigavibe-300",
          "backdrop-blur-sm"
        ].join(" "),
        
        // GHOST: Subtle actions, navigation
        ghost: [
          "text-slate-300 hover:text-white",
          "hover:bg-white/5",
          "backdrop-blur-sm"
        ].join(" "),
        
        // DESTRUCTIVE: Delete, cancel, dangerous actions
        destructive: [
          "bg-red-500 text-white",
          "hover:bg-red-600 hover:scale-105",
          "active:scale-95",
          "shadow-lg shadow-red-500/25"
        ].join(" "),
        
        // SUCCESS: Completion, positive actions
        success: [
          "bg-green-500 text-white",
          "hover:bg-green-600 hover:scale-105",
          "active:scale-95",
          "shadow-lg shadow-green-500/25"
        ].join(" ")
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-lg",
        default: "h-11 px-6 py-3 text-sm",
        lg: "h-14 px-8 text-base font-semibold rounded-2xl",
        icon: "h-11 w-11"
      },
      // Special modifiers for enhanced UX
      loading: {
        true: "cursor-not-allowed"
      },
      floating: {
        true: "rounded-full shadow-gigavibe-glow hover:shadow-xl"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      loading: false,
      floating: false
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading, 
    floating,
    asChild = false, 
    isLoading = false, 
    children, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const content = isLoading ? (
      <>
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading</span>
      </>
    ) : (
      children
    );
    
    return (
      <Comp
        className={cn(buttonVariants({ 
          variant, 
          size, 
          loading: isLoading || loading, 
          floating,
          className 
        }))}
        ref={ref}
        disabled={props.disabled || isLoading}
        {...props}
      >
        {content}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

/**
 * MIGRATION GUIDE:
 * 
 * OLD → NEW
 * variant="default" → variant="primary"
 * variant="gigavibe" → variant="primary" 
 * variant="outline" → variant="secondary"
 * variant="ghost" → variant="ghost"
 * variant="destructive" → variant="destructive"
 * variant="success" → variant="success"
 * variant="warning" → variant="destructive" (consolidate to destructive)
 * variant="error" → variant="destructive" (consolidate to destructive)
 * variant="glassmorphism" → variant="ghost" (consolidate to ghost)
 * variant="floating" → variant="primary" floating={true}
 * variant="link" → variant="ghost" (consolidate to ghost)
 * variant="secondary" → variant="secondary"
 */