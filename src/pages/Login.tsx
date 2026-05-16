import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, AlertCircle, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMood } from "@/contexts/MoodContext";
import { validateLoginForm } from "@/utils/validation";
import GlassmorphismCard from "@/components/effects/GlassmorphismCard";
import MoodSelector from "@/components/effects/MoodSelector";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isLoading } = useAuth();
  const { currentMood } = useMood();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validate form
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Attempt login
    const result = await login(email, password);
    
    if (result.success) {
      toast({
        title: "Welcome back!",
        description: result.message,
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: result.message,
        variant: "destructive",
      });
      setErrors([result.message]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
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

      <GlassmorphismCard mood={currentMood} hover={false} glow className="w-full max-w-md p-8 floating-animation">
        <div className="text-center mb-8">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-2">Sign in to continue your wellness journey</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Please fix the following errors:</span>
              </div>
              <ul className="mt-2 text-sm text-destructive space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <span>•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.some(e => e.toLowerCase().includes('email')) ? 'border-destructive' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.some(e => e.toLowerCase().includes('password')) ? 'border-destructive' : ''}
            />
          </div>

          <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={() => toast({ title: "Google Sign-In", description: "Google authentication will be integrated." })}>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </button>
        </p>
      </GlassmorphismCard>
    </div>
  );
};

export default Login;
