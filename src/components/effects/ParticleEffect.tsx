import React, { useEffect, useState } from 'react';

interface ParticleEffectProps {
  count?: number;
  mood?: 'calm' | 'energetic' | 'focused' | 'peaceful';
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({ count = 20, mood = 'calm' }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; size: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 15,
      size: Math.random() * 3 + 2,
    }));
    setParticles(newParticles);
  }, [count]);

  const getMoodColors = () => {
    switch (mood) {
      case 'energetic':
        return ['hsl(15 85% 70% / 0.6)', 'hsl(340 80% 75% / 0.4)', 'hsl(25 90% 65% / 0.5)'];
      case 'focused':
        return ['hsl(240 60% 60% / 0.6)', 'hsl(260 55% 65% / 0.4)', 'hsl(220 65% 70% / 0.5)'];
      case 'peaceful':
        return ['hsl(120 40% 70% / 0.6)', 'hsl(140 35% 75% / 0.4)', 'hsl(100 45% 65% / 0.5)'];
      default: // calm
        return ['hsl(185 65% 55% / 0.6)', 'hsl(200 60% 65% / 0.4)', 'hsl(170 70% 60% / 0.5)'];
    }
  };

  const colors = getMoodColors();

  return (
    <div className="particles-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: colors[particle.id % colors.length],
            animationDelay: `-${particle.delay}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleEffect;