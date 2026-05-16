import React, { useEffect, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';

interface Emoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
  rotation: number;
  speed: number;
  direction: { x: number; y: number };
}

const MovingEmojis: React.FC = () => {
  const { currentMood } = useMood();
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  const moodEmojis = {
    calm: ['😌', '😊', '🙂', '😇', '🤗', '�', '🧘', '�', '🤲', '💙', '🕊️', '🌙'],
    energetic: ['😄', '😆', '🤩', '�', '🥳', '�', '�', '⚡', '💪', '�', '�', '⭐'],
    focused: ['🤔', '�', '🧐', '�', '🤓', '💭', '🎯', '🔍', '�', '🧠', '�', '✍️'],
    peaceful: ['😮‍💨', '😌', '�', '😍', '🤍', '💚', '�', '🦋', '�', '�', '🌱', '🕊️']
  };

  useEffect(() => {
    // Create unique emoji set without duplicates
    const shuffledEmojis = [...moodEmojis[currentMood]].sort(() => Math.random() - 0.5);
    
    const createEmoji = (index: number): Emoji => ({
      id: Math.random(),
      emoji: shuffledEmojis[index % shuffledEmojis.length],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      rotation: Math.random() * 360,
      speed: 0.1 + Math.random() * 0.2, // Reduced speed: 0.1 to 0.3
      direction: {
        x: (Math.random() - 0.5) * 0.5, // Reduced direction force
        y: (Math.random() - 0.5) * 0.5
      }
    });

    // Initialize emojis (limited to available unique emojis)
    const emojiCount = Math.min(10, moodEmojis[currentMood].length);
    const initialEmojis = Array.from({ length: emojiCount }, (_, index) => createEmoji(index));
    setEmojis(initialEmojis);

    const animateEmojis = () => {
      setEmojis(prevEmojis => 
        prevEmojis.map(emoji => {
          let newX = emoji.x + emoji.direction.x * emoji.speed;
          let newY = emoji.y + emoji.direction.y * emoji.speed;
          let newDirectionX = emoji.direction.x;
          let newDirectionY = emoji.direction.y;

          // Bounce off edges
          if (newX <= 0 || newX >= window.innerWidth - 30) {
            newDirectionX = -emoji.direction.x;
            newX = Math.max(0, Math.min(window.innerWidth - 30, newX));
          }
          if (newY <= 0 || newY >= window.innerHeight - 30) {
            newDirectionY = -emoji.direction.y;
            newY = Math.max(0, Math.min(window.innerHeight - 30, newY));
          }

          return {
            ...emoji,
            x: newX,
            y: newY,
            rotation: emoji.rotation + emoji.speed * 0.5, // Reduced rotation speed
            direction: { x: newDirectionX, y: newDirectionY }
          };
        })
      );
    };

    const interval = setInterval(animateEmojis, 100); // Slower animation interval
    return () => clearInterval(interval);
  }, [currentMood]);

  // Update emojis when mood changes - ensure no duplicates
  useEffect(() => {
    const shuffledEmojis = [...moodEmojis[currentMood]].sort(() => Math.random() - 0.5);
    setEmojis(prevEmojis => 
      prevEmojis.map((emoji, index) => ({
        ...emoji,
        emoji: shuffledEmojis[index % shuffledEmojis.length]
      }))
    );
  }, [currentMood]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {emojis.map(emoji => (
        <div
          key={emoji.id}
          className="absolute text-2xl select-none opacity-60 transition-all duration-2000"
          style={{
            left: `${emoji.x}px`,
            top: `${emoji.y}px`,
            transform: `rotate(${emoji.rotation}deg)`,
            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))',
            animation: `float ${5 + Math.random() * 3}s ease-in-out infinite` // Slower float animation
          }}
        >
          {emoji.emoji}
        </div>
      ))}
      
      {/* Additional floating emojis with different animation - ensure uniqueness */}
      <div className="absolute inset-0">
        {moodEmojis[currentMood].slice(0, 4).map((emoji, i) => (
          <div
            key={`floating-${i}`}
            className="absolute opacity-40"
            style={{
              left: `${15 + i * 20}%`,
              top: `${25 + (i % 2) * 40}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${6 + i * 0.8}s`, // Slower animation
              animation: `float ${6 + i * 0.8}s ease-in-out infinite`
            }}
          >
            <span className="text-2xl filter drop-shadow-md">
              {emoji}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovingEmojis;