import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const Mood = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moods = [
    { emoji: "😊", label: "Happy", color: "from-yellow-400 to-orange-400" },
    { emoji: "😌", label: "Calm", color: "from-blue-400 to-cyan-400" },
    { emoji: "😔", label: "Sad", color: "from-blue-500 to-purple-500" },
    { emoji: "😰", label: "Anxious", color: "from-purple-500 to-pink-500" },
    { emoji: "😡", label: "Angry", color: "from-red-500 to-orange-500" },
    { emoji: "😴", label: "Tired", color: "from-gray-400 to-gray-600" },
    { emoji: "🤗", label: "Grateful", color: "from-pink-400 to-rose-400" },
    { emoji: "😐", label: "Neutral", color: "from-gray-300 to-gray-400" },
  ];

  const { token } = useAuth();

  const handleMoodSelection = async (mood: string) => {
    setSelectedMood(mood);

    // Map label to server-compatible mood key (lowercase)
    const moodKey = mood.toLowerCase();

    // Local toast immediately
    toast({
      title: "Mood logged!",
      description: `You're feeling ${moodKey} right now.`,
    });

    if (!token) {
      // Not signed in - still show local toast and return
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mood: moodKey, intensity: 5 }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const isTemporary = data.note && data.note.includes('temporary');
        if (isTemporary) {
          toast({ 
            title: 'Mood logged!', 
            description: `${moodKey} mood saved (temporary storage - will persist when you restart the server).` 
          });
        }
      } else {
        toast({ title: 'Save failed', description: data.message || 'Could not log mood.', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Mood log error:', err);
      toast({ title: 'Network error', description: 'Unable to reach server. Try again later.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Mood Tracker</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-8 shadow-[var(--shadow-soft)] mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">How are you feeling right now?</h2>
            <p className="text-muted-foreground">
              Select an emoji that best represents your current mood
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.label}
                onClick={() => handleMoodSelection(mood.label)}
                className={`p-6 rounded-2xl border-2 transition-[var(--transition-bounce)] hover:scale-105 ${
                  selectedMood === mood.label
                    ? "border-primary shadow-[var(--shadow-soft)]"
                    : "border-border/50"
                }`}
              >
                <div className="text-6xl mb-2">{mood.emoji}</div>
                <p className="font-medium">{mood.label}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Mood History */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Your Mood Journey</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-semibold mb-4">Today's Mood Timeline</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">😊</span>
                    <div>
                      <p className="font-medium">Happy</p>
                      <p className="text-sm text-muted-foreground">2:30 PM</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">😌</span>
                    <div>
                      <p className="font-medium">Calm</p>
                      <p className="text-sm text-muted-foreground">10:15 AM</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">😰</span>
                    <div>
                      <p className="font-medium">Anxious</p>
                      <p className="text-sm text-muted-foreground">8:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-4">Weekly Mood Summary</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>😊 Happy</span>
                    <span>45%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>😌 Calm</span>
                    <span>30%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[30%] bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>😰 Anxious</span>
                    <span>15%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[15%] bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>😔 Sad</span>
                    <span>10%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[10%] bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card className="mt-6 p-4 bg-primary/5 border-primary/20">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Insight:</strong> You've been feeling positive emotions 75% of the time this week! 
            Keep up the great work on your mental wellness journey.
          </p>
        </Card>
      </main>
    </div>
  );
};

export default Mood;
