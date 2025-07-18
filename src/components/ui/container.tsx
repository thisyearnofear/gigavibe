"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width of the container
   * @default "xl"
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
  
  /**
   * Whether to center the container horizontally
   * @default true
   */
  centered?: boolean;
  
  /**
   * Padding size
   * @default "normal"
   */
  padding?: "none" | "small" | "normal" | "large";
  
  /**
   * Whether to apply glass effect background
   * @default false
   */
  glass?: boolean;
}

/**
 * Container component for consistent layout
 * Supports different max-widths, centered alignment, and responsive behavior
 */
const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    className, 
    children, 
    maxWidth = "xl", 
    centered = true, 
    padding = "normal",
    glass = false,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "w-full",
          
          // Max width variants
          {
            "max-w-screen-sm": maxWidth === "sm",
            "max-w-screen-md": maxWidth === "md",
            "max-w-screen-lg": maxWidth === "lg",
            "max-w-screen-xl": maxWidth === "xl",
            "max-w-screen-2xl": maxWidth === "2xl",
            "max-w-7xl": maxWidth === "7xl",
            "max-w-full": maxWidth === "full",
          },
          
          // Centered alignment
          centered && "mx-auto",
          
          // Padding variants - responsive
          {
            "px-0": padding === "none",
            "px-2 sm:px-3 md:px-4": padding === "small",
            "px-4 sm:px-6 md:px-8": padding === "normal",
            "px-6 sm:px-8 md:px-12": padding === "large",
          },
          
          // Glass effect
          glass && "backdrop-blur-md bg-white/10 border border-white/20 rounded-xl",
          
          // Custom classes
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export { Container };
export default Container;