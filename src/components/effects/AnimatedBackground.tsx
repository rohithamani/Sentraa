import React, { useEffect, useState } from 'react';

interface AnimatedBackgroundProps {
  mood?: 'calm' | 'energetic' | 'focused' | 'peaceful';
  intensity?: 'subtle' | 'medium' | 'vibrant';
  children?: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  mood = 'calm', 
  intensity = 'subtle',
  children 
}) => {
  const [currentMood, setCurrentMood] = useState(mood);

  useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);

  const getGradientClass = () => {
    const base = intensity === 'subtle' ? 'opacity-30' : intensity === 'medium' ? 'opacity-50' : 'opacity-70';
    
    switch (currentMood) {
      case 'energetic':
        return `animated-gradient ${base} mood-energetic`;
      case 'focused':
        return `animated-gradient ${base} mood-focused`;
      case 'peaceful':
        return `animated-gradient ${base} mood-peaceful`;
      default: // calm
        return `animated-gradient ${base} mood-calm`;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Primary animated background */}
      <div 
        className={`fixed inset-0 ${getGradientClass()} transition-all duration-1000 ease-in-out`}
        style={{
          background: `
            radial-gradient(circle at 20% 80%, hsl(185 65% 55% / 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, hsl(15 85% 70% / 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, hsl(340 80% 75% / 0.08) 0%, transparent 50%),
            linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--background)) 100%)
          `,
        }}
      />
      
      {/* Subtle wave overlay */}
      <div className="fixed inset-0 opacity-20">
        <svg 
          className="absolute bottom-0 left-0 w-full h-32"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            className="fill-primary/5"
          />
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            values="0 0;50 0;0 0"
            dur="10s"
            repeatCount="indefinite"
          />
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;