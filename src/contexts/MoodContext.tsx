import React, { createContext, useContext, useState, useEffect } from 'react';

export type MoodType = 'calm' | 'energetic' | 'focused' | 'peaceful';

interface MoodContextType {
  currentMood: MoodType;
  setMood: (mood: MoodType) => void;
  moodIntensity: 'subtle' | 'medium' | 'vibrant';
  setMoodIntensity: (intensity: 'subtle' | 'medium' | 'vibrant') => void;
  enableParticles: boolean;
  setEnableParticles: (enable: boolean) => void;
  enableSound: boolean;
  setEnableSound: (enable: boolean) => void;
  autoMoodShift: boolean;
  setAutoMoodShift: (enable: boolean) => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMood, setCurrentMood] = useState<MoodType>('calm');
  const [moodIntensity, setMoodIntensity] = useState<'subtle' | 'medium' | 'vibrant'>('subtle');
  const [enableParticles, setEnableParticles] = useState(true);
  const [enableSound, setEnableSound] = useState(false);
  const [autoMoodShift, setAutoMoodShift] = useState(false);

  // Auto mood shifting based on time of day or user activity
  useEffect(() => {
    if (!autoMoodShift) return;

    const getTimeBasedMood = (): MoodType => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 10) return 'energetic'; // Morning
      if (hour >= 10 && hour < 14) return 'focused'; // Midday
      if (hour >= 14 && hour < 18) return 'calm'; // Afternoon
      return 'peaceful'; // Evening/Night
    };

    const interval = setInterval(() => {
      const newMood = getTimeBasedMood();
      if (newMood !== currentMood) {
        setCurrentMood(newMood);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [autoMoodShift, currentMood]);

  const setMood = (mood: MoodType) => {
    setCurrentMood(mood);
    
    // Apply mood to document root for global CSS variables
    document.documentElement.setAttribute('data-mood', mood);
    
    // Optional: Store in localStorage for persistence
    localStorage.setItem('user-mood', mood);
  };

  // Load saved mood on mount
  useEffect(() => {
    const savedMood = localStorage.getItem('user-mood') as MoodType;
    if (savedMood && ['calm', 'energetic', 'focused', 'peaceful'].includes(savedMood)) {
      setMood(savedMood);
    }
    
    const savedParticles = localStorage.getItem('enable-particles');
    if (savedParticles !== null) {
      setEnableParticles(JSON.parse(savedParticles));
    }
    
    const savedSound = localStorage.getItem('enable-sound');
    if (savedSound !== null) {
      setEnableSound(JSON.parse(savedSound));
    }
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('enable-particles', JSON.stringify(enableParticles));
  }, [enableParticles]);

  useEffect(() => {
    localStorage.setItem('enable-sound', JSON.stringify(enableSound));
  }, [enableSound]);

  const value: MoodContextType = {
    currentMood,
    setMood,
    moodIntensity,
    setMoodIntensity,
    enableParticles,
    setEnableParticles,
    enableSound,
    setEnableSound,
    autoMoodShift,
    setAutoMoodShift,
  };

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = (): MoodContextType => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};