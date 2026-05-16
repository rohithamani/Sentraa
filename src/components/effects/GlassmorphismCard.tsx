import React from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphismCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  mood?: 'calm' | 'energetic' | 'focused' | 'peaceful';
  style?: React.CSSProperties;
}

const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
  children,
  className,
  hover = true,
  glow = false,
  mood = 'calm',
  style
}) => {
  const getMoodBorder = () => {
    switch (mood) {
      case 'energetic':
        return 'border-orange-200/30 dark:border-orange-400/20';
      case 'focused':
        return 'border-blue-200/30 dark:border-blue-400/20';
      case 'peaceful':
        return 'border-green-200/30 dark:border-green-400/20';
      default: // calm
        return 'border-teal-200/30 dark:border-teal-400/20';
    }
  };

  const getMoodShadow = () => {
    switch (mood) {
      case 'energetic':
        return 'shadow-orange-500/10';
      case 'focused':
        return 'shadow-blue-500/10';
      case 'peaceful':
        return 'shadow-green-500/10';
      default: // calm
        return 'shadow-teal-500/10';
    }
  };

  return (
    <div
      style={style}
      className={cn(
        'glassmorphism rounded-xl border backdrop-blur-md',
        'bg-white/10 dark:bg-black/10',
        getMoodBorder(),
        'shadow-xl',
        getMoodShadow(),
        hover && 'hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105 smooth-transition',
        glow && 'pulse-glow',
        'relative overflow-hidden',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div 
        className={cn(
          'absolute inset-0 opacity-30 rounded-xl',
          mood === 'energetic' && 'bg-gradient-to-br from-orange-200/20 to-red-200/10',
          mood === 'focused' && 'bg-gradient-to-br from-blue-200/20 to-purple-200/10',
          mood === 'peaceful' && 'bg-gradient-to-br from-green-200/20 to-emerald-200/10',
          mood === 'calm' && 'bg-gradient-to-br from-teal-200/20 to-cyan-200/10'
        )}
      />
      
      {/* Wave effect on hover */}
      {hover && (
        <div className="absolute inset-0 wave-effect opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassmorphismCard;