import React from 'react';
import { Waves, Zap, Target, Leaf, Settings, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useMood, type MoodType } from '@/contexts/MoodContext';
import GlassmorphismCard from './GlassmorphismCard';

const MoodSelector: React.FC = () => {
  const {
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
  } = useMood();

  const moods = [
    {
      type: 'calm' as MoodType,
      label: 'Calm',
      icon: Waves,
      color: 'text-teal-400',
      bgColor: 'bg-teal-400/20',
      description: 'Peaceful and serene'
    },
    {
      type: 'energetic' as MoodType,
      label: 'Energetic',
      icon: Zap,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/20',
      description: 'Dynamic and vibrant'
    },
    {
      type: 'focused' as MoodType,
      label: 'Focused',
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20',
      description: 'Clear and concentrated'
    },
    {
      type: 'peaceful' as MoodType,
      label: 'Peaceful',
      icon: Leaf,
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      description: 'Natural and harmonious'
    }
  ];

  return (
    <GlassmorphismCard mood={currentMood} className="p-6 w-80">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Mood & Ambiance</h3>
        </div>

        {/* Mood Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Current Mood</Label>
          <div className="grid grid-cols-2 gap-2">
            {moods.map((mood) => {
              const Icon = mood.icon;
              const isActive = currentMood === mood.type;
              
              return (
                <Button
                  key={mood.type}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setMood(mood.type)}
                  className={`
                    relative overflow-hidden p-4 h-auto flex-col gap-2 transition-all duration-300
                    ${isActive ? mood.bgColor : 'hover:bg-white/5'}
                    ${isActive ? mood.color : 'text-muted-foreground'}
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'floating-animation' : ''}`} />
                  <div className="text-center">
                    <div className="font-medium text-xs">{mood.label}</div>
                    <div className="text-xs opacity-70">{mood.description}</div>
                  </div>
                  
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent wave-effect" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Intensity Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Visual Intensity</Label>
          <div className="flex gap-2">
            {(['subtle', 'medium', 'vibrant'] as const).map((intensity) => (
              <Button
                key={intensity}
                variant={moodIntensity === intensity ? "default" : "outline"}
                size="sm"
                onClick={() => setMoodIntensity(intensity)}
                className="flex-1 text-xs"
              >
                {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Effects Toggle */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Visual Effects</Label>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Particle Effects</Label>
              <p className="text-xs text-muted-foreground">
                Floating particles in background
              </p>
            </div>
            <Switch
              checked={enableParticles}
              onCheckedChange={setEnableParticles}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <Volume2 className="h-3 w-3" />
                <Label className="text-sm">Ambient Sound</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Mood-based background audio
              </p>
            </div>
            <Switch
              checked={enableSound}
              onCheckedChange={setEnableSound}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Auto Mood Shift</Label>
              <p className="text-xs text-muted-foreground">
                Change mood based on time of day
              </p>
            </div>
            <Switch
              checked={autoMoodShift}
              onCheckedChange={setAutoMoodShift}
            />
          </div>
        </div>

        {/* Current Status */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Current Experience:</span>
            <span className="font-medium capitalize">
              {moodIntensity} {currentMood}
            </span>
          </div>
        </div>
      </div>
    </GlassmorphismCard>
  );
};

export default MoodSelector;