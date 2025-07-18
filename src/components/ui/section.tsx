"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Section title
   */
  title?: React.ReactNode;
  
  /**
   * Section subtitle/description
   */
  subtitle?: React.ReactNode;
  
  /**
   * Action element (button, link, etc.) to display in the header
   */
  action?: React.ReactNode;
  
  /**
   * Whether to center the title and subtitle
   * @default false
   */
  centerTitle?: boolean;
  
  /**
   * Spacing between sections
   * @default "normal"
   */
  spacing?: "none" | "small" | "normal" | "large";
  
  /**
   * Whether to apply a divider below the header
   * @default false
   */
  divider?: boolean;
  
  /**
   * Whether to apply glass effect background
   * @default false
   */
  glass?: boolean;
}

/**
 * Section component for consistent page section layout
 * Provides standardized spacing, title formatting, and action placement
 */
const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ 
    className, 
    children, 
    title,
    subtitle,
    action,
    centerTitle = false,
    spacing = "normal",
    divider = false,
    glass = false,
    ...props 
  }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          // Base styles
          "w-full",
          
          // Spacing variants - responsive
          {
            "mb-0": spacing === "none",
            "mb-4 sm:mb-6": spacing === "small",
            "mb-6 sm:mb-8 md:mb-10": spacing === "normal",
            "mb-8 sm:mb-12 md:mb-16": spacing === "large",
          },
          
          // Glass effect
          glass && "backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 sm:p-6",
          
          // Custom classes
          className
        )}
        {...props}
      >
        {/* Section Header */}
        {(title || subtitle || action) && (
          <div className={cn(
            "flex flex-col gap-1 mb-4 sm:mb-6",
            action ? "sm:flex-row sm:items-center sm:justify-between" : "",
            centerTitle && !action ? "text-center" : ""
          )}>
            <div>
              {title && (
                <h2 className="text-2xl font-bold text-white">
                  {title}
                </h2>
              )}
              
              {subtitle && (
                <p className="text-slate-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            
            {action && (
              <div className={cn(
                "mt-3 sm:mt-0",
                centerTitle && "self-center"
              )}>
                {action}
              </div>
            )}
          </div>
        )}
        
        {/* Divider */}
        {divider && (
          <div className="h-px bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/0 mb-6" />
        )}
        
        {/* Section Content */}
        <div>
          {children}
        </div>
      </section>
    );
  }
);

Section.displayName = "Section";

export { Section };
export default Section;