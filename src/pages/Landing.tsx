import { Button } from "@/components/ui/button";
import { Brain, BookOpen, MessageCircle, Mic, Smile, CheckCircle, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMood } from "@/contexts/MoodContext";
import GlassmorphismCard from "@/components/effects/GlassmorphismCard";
import MoodSelector from "@/components/effects/MoodSelector";

const Landing = () => {
  const navigate = useNavigate();
  const { currentMood } = useMood();
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  const features = [
    {
      icon: BookOpen,
      title: "Journal Your Thoughts",
      description: "Express yourself freely and track your emotional journey through daily journaling.",
    },
    {
      icon: MessageCircle,
      title: "AI Chat Support",
      description: "Talk to an empathetic AI companion that understands and supports you 24/7.",
    },
    {
      icon: Mic,
      title: "Voice Reflections",
      description: "Share your feelings through voice logs for deeper emotional insights.",
    },
    {
      icon: Smile,
      title: "Mood Tracking",
      description: "Monitor your emotional patterns with emoji-based mood tracking over time.",
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Mood Selector Toggle */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMoodSelector(!showMoodSelector)}
          className="glassmorphism border-white/20"
        >
          <Settings className="h-4 w-4" />
        </Button>
        
        {showMoodSelector && (
          <div className="absolute top-12 left-0 z-10">
            <MoodSelector />
          </div>
        )}
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            SENTRAA
          </h1>
          <p className="text-2xl md:text-3xl font-medium mb-4 text-foreground/90">
            Your Mental Wellness Mirror
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            A safe space for students and professionals to reflect, understand, and nurture their emotional well-being.
            Track your mental health journey without stigma or judgment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate("/signup")}
              className="text-lg"
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/login")}
              className="text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How SENTRAA Supports You</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <GlassmorphismCard key={index} mood={currentMood} className="p-6 floating-animation" style={{animationDelay: `${index * 0.1}s`}}>
              <feature.icon className="w-12 h-12 text-primary mb-4 pulse-glow" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </GlassmorphismCard>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SENTRAA?</h2>
          <div className="space-y-6">
            {[
              "Private and judgment-free space for emotional expression",
              "AI-powered insights to understand your emotional patterns",
              "Track your progress and celebrate your growth",
              "Personalized support based on your unique needs",
              "Accessible anytime, anywhere - no appointments needed",
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-lg text-foreground/90">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <GlassmorphismCard mood={currentMood} glow hover className="p-12 text-center cta-highlight">
          <Brain className="w-16 h-16 text-primary mx-auto mb-6 pulse-glow" />
          <h2 className="text-3xl font-bold mb-4">Start Your Wellness Journey Today</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands who are taking control of their mental health with SENTRAA's supportive tools and insights.
          </p>
          <Button 
            variant="hero" 
            size="lg"
            onClick={() => navigate("/signup")}
            className="text-lg floating-button"
          >
            Create Your Free Account
          </Button>
        </GlassmorphismCard>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>© 2025 SENTRAA. Your mental wellness companion.</p>
      </footer>
    </div>
  );
};

export default Landing;
