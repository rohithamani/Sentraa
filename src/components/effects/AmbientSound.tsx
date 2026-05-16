import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import GlassmorphismCard from './GlassmorphismCard';

interface AmbientSoundProps {
  mood?: 'calm' | 'energetic' | 'focused' | 'peaceful';
  autoPlay?: boolean;
}

const AmbientSound: React.FC<AmbientSoundProps> = ({ mood = 'calm', autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState([0.3]);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Since we don't have actual audio files, we'll create web audio API tones
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const soundPresets = {
    calm: { frequency: 220, type: 'sine' as OscillatorType, filterFreq: 800 },
    energetic: { frequency: 440, type: 'sawtooth' as OscillatorType, filterFreq: 1200 },
    focused: { frequency: 330, type: 'square' as OscillatorType, filterFreq: 600 },
    peaceful: { frequency: 165, type: 'sine' as OscillatorType, filterFreq: 400 }
  };

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const createAmbientTone = () => {
    const ctx = initAudioContext();
    const preset = soundPresets[mood];
    
    // Create oscillator
    const oscillator = ctx.createOscillator();
    oscillator.frequency.setValueAtTime(preset.frequency, ctx.currentTime);
    oscillator.type = preset.type;
    
    // Create gain node for volume control
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(isMuted ? 0 : volume[0] * 0.1, ctx.currentTime);
    
    // Create filter for smoother sound
    const filter = ctx.createBiquadFilter();
    filter.frequency.setValueAtTime(preset.filterFreq, ctx.currentTime);
    filter.type = 'lowpass';
    
    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    return { oscillator, gainNode };
  };

  const startAmbientSound = () => {
    if (!oscillatorRef.current) {
      const { oscillator, gainNode } = createAmbientTone();
      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;
      oscillator.start();
    }
  };

  const stopAmbientSound = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
      gainNodeRef.current = null;
    }
  };

  const togglePlay = async () => {
    try {
      if (isPlaying) {
        stopAmbientSound();
      } else {
        await initAudioContext().resume();
        startAmbientSound();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.log('Audio playback requires user interaction');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? volume[0] * 0.1 : 0,
        audioContextRef.current!.currentTime
      );
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (gainNodeRef.current && !isMuted) {
      gainNodeRef.current.gain.setValueAtTime(
        newVolume[0] * 0.1,
        audioContextRef.current!.currentTime
      );
    }
  };

  useEffect(() => {
    if (isPlaying) {
      stopAmbientSound();
      startAmbientSound();
    }
  }, [mood]);

  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const getMoodColor = () => {
    switch (mood) {
      case 'energetic': return 'text-orange-400';
      case 'focused': return 'text-blue-400';
      case 'peaceful': return 'text-green-400';
      default: return 'text-teal-400';
    }
  };

  const getMoodLabel = () => {
    switch (mood) {
      case 'energetic': return 'Energizing Tones';
      case 'focused': return 'Focus Sounds';
      case 'peaceful': return 'Nature Harmony';
      default: return 'Calming Waves';
    }
  };

  return (
    <GlassmorphismCard mood={mood} className="p-4 w-72">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-medium ${getMoodColor()}`}>
              {getMoodLabel()}
            </h3>
            <p className="text-xs text-muted-foreground">
              Ambient soundscape
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="h-8 w-8 p-0"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Volume2 className="h-3 w-3 text-muted-foreground" />
            <Slider
              value={volume}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.1}
              className="flex-1"
              disabled={isMuted}
            />
          </div>
          
          {isPlaying && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
              <span>Playing ambient {mood} sounds</span>
            </div>
          )}
        </div>
      </div>
    </GlassmorphismCard>
  );
};

export default AmbientSound;