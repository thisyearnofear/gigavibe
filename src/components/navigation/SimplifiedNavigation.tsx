/**
 * SIMPLIFIED NAVIGATION SYSTEM
 * Following GIGAVIBE Core Principles:
 * - ENHANCEMENT FIRST: Enhanced existing MainNavigation with better UX
 * - AGGRESSIVE CONSOLIDATION: Simplified from complex state management
 * - CLEAN: Clear action-oriented navigation
 * - MODULAR: Composable navigation components
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Zap, 
  Users, 
  Coins,
  Plus,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button-consolidated';
import { useFarcasterIntegration } from '@/hooks/useFarcasterIntegration';
import { useIsMobile } from '@/hooks/use-mobile';

// Navigation Types
type NavigationTab = 'sing' | 'discover' | 'judge' | 'earn';

interface NavigationItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

interface SimplifiedNavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onQuickSing: () => void;
}

// Navigation Configuration
const navigationItems: NavigationItem[] = [
  { 
    id: 'sing', 
    label: 'Sing', 
    icon: Mic, 
    description: 'Start a challenge',
    color: 'text-purple-400'
  },
  { 
    id: 'discover', 
    label: 'Discover', 
    icon: Zap, 
    description: 'Explore performances',
    color: 'text-blue-400'
  },
  { 
    id: 'judge', 
    label: 'Judge', 
    icon: Users, 
    description: 'Rate others',
    color: 'text-green-400'
  },
  { 
    id: 'earn', 
    label: 'Earn', 
    icon: Coins, 
    description: 'Performance coins',
    color: 'text-yellow-400'
  },
];

// Navigation Tab Component
function NavigationTab({ 
  item, 
  isActive, 
  onClick 
}: { 
  item: NavigationItem; 
  isActive: boolean; 
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <motion.button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-3 px-4 rounded-2xl transition-all duration-300 min-h-[64px] min-w-[64px] touch-target relative ${
        isActive 
          ? `${item.color} bg-white/5` 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Active indicator background */}
      {isActive && (
        <motion.div 
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gigavibe-500/20 to-purple-500/20 blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Icon with animation */}
      <motion.div 
        animate={{ 
          scale: isActive ? 1.2 : 1,
          y: isActive ? [0, -2, 0] : 0
        }} 
        transition={{ 
          duration: 0.5,
          y: { repeat: isActive ? Infinity : 0, duration: 2, repeatType: "reverse" }
        }} 
        className="relative z-10"
      >
        <Icon className="w-6 h-6" />
      </motion.div>
      
      {/* Label */}
      <span className="text-xs font-medium relative z-10">{item.label}</span>
      
      {/* Active dot indicator */}
      {isActive && (
        <motion.div 
          className="w-2 h-2 bg-gradient-to-r from-gigavibe-400 to-purple-400 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />
      )}
      
      {/* Sparkle effect for active tab */}
      {isActive && (
        <motion.div 
          className="absolute -top-1 -right-1 text-gigavibe-400"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ 
            scale: [0, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-3 h-3" />
        </motion.div>
      )}
    </motion.button>
  );
}

// Quick Action Button
function QuickActionButton({ 
  onClick 
}: { 
  onClick: () => void;
}) {
  const isMobile = useIsMobile();
  
  return (
    <motion.button
      onClick={onClick}
      className={`fixed ${
        isMobile ? 'bottom-20 right-4' : 'bottom-24 right-6'
      } w-14 h-14 bg-gradient-to-r from-gigavibe-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-gigavibe-500/25 z-40`}
      whileHover={{ 
        scale: 1.1, 
        rotate: [0, 10, -10, 0],
        boxShadow: "0 0 30px rgba(212, 70, 239, 0.5)"
      }}
      whileTap={{ scale: 0.9 }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Plus className="w-6 h-6 text-white" />
    </motion.button>
  );
}

// Main Navigation Component
export default function SimplifiedNavigation({ 
  activeTab, 
  onTabChange, 
  onQuickSing 
}: SimplifiedNavigationProps) {
  const { userInfo } = useFarcasterIntegration();

  return (
    <>
      {/* Bottom Navigation */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 gigavibe-glass-dark border-t border-gigavibe-500/20 px-4 py-3 z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {navigationItems.map((item) => (
            <NavigationTab
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
            />
          ))}
        </div>
      </motion.nav>

      {/* Quick Action Button */}
      <QuickActionButton onClick={onQuickSing} />
    </>
  );
}

// Context Provider for Navigation State
export function useSimplifiedNavigation() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('sing');
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = useCallback((tab: NavigationTab) => {
    if (tab === activeTab) return;
    
    setIsLoading(true);
    setActiveTab(tab);
    
    // Simulate navigation loading
    setTimeout(() => setIsLoading(false), 200);
  }, [activeTab]);

  const handleQuickSing = useCallback(() => {
    setActiveTab('sing');
    // Trigger quick sing flow
  }, []);

  return {
    activeTab,
    isLoading,
    handleTabChange,
    handleQuickSing
  };
}

/**
 * ENHANCEMENT IMPACT:
 * 
 * REPLACES:
 * - Complex MainNavigation.tsx state management
 * - Unclear tab labels and descriptions
 * - Inconsistent navigation animations
 * 
 * IMPROVEMENTS:
 * - Action-oriented labels (Sing, Discover, Judge, Earn)
 * - Clear visual hierarchy and feedback
 * - Consistent animation patterns
 * - Better touch targets for mobile
 * - Reduced cognitive load
 * 
 * USAGE:
 * ```tsx
 * const { activeTab, isLoading, handleTabChange, handleQuickSing } = useSimplifiedNavigation();
 * 
 * return (
 *   <SimplifiedNavigation 
 *     activeTab={activeTab}
 *     onTabChange={handleTabChange}
 *     onQuickSing={handleQuickSing}
 *   />
 * );
 * ```
 */