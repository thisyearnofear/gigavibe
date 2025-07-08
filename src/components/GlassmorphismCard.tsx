'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassmorphismCardProps {
  children: ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg';
  opacity?: number;
}

export default function GlassmorphismCard({ 
  children, 
  className = '', 
  blur = 'md',
  opacity = 0.1 
}: GlassmorphismCardProps) {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md', 
    lg: 'backdrop-blur-lg'
  };

  return (
    <motion.div
      className={`
        ${blurClasses[blur]} 
        bg-white/[${opacity}] 
        border border-white/20 
        rounded-3xl 
        shadow-2xl 
        ${className}
      `}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 25px 50px rgba(139, 92, 246, 0.15)"
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}