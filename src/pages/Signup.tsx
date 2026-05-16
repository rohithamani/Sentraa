import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, AlertCircle, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMood } from "@/contexts/MoodContext";
import { validateSignupForm } from "@/utils/validation";
import GlassmorphismCard from "@/components/effects/GlassmorphismCard";
import MoodSelector from "@/components/effects/MoodSelector";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup, isLoading } = useAuth();
  const { currentMood } = useMood();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  // Account info
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Personalization
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [studyStream, setStudyStream] = useState("");
  const [workType, setWorkType] = useState("");
  const [shift, setShift] = useState("");
  const [healthConditions, setHealthConditions] = useState<string[]>([]);

  const handleAccountCreation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validate form
    const validation = validateSignupForm(email, password, confirmPassword);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setStep(2);
  };

  const handlePersonalization = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Prepare user data
    const userData = {
      email,
      password,
      confirmPassword,
      profile: {
        gender,
        ageGroup,
        studyStream,
        workType,
        shift,
        healthConditions,
      },
    };

    // Attempt signup
    const result = await signup(userData);
    
    if (result.success) {
      toast({
        title: "Account created!",
        description: "Welcome to SENTRAA. Let's begin your wellness journey.",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Signup Failed",
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

      <GlassmorphismCard mood={currentMood} hover={false} glow className="w-full max-w-2xl p-8 floating-animation">
        <div className="text-center mb-8">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Join SENTRAA
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === 1 ? "Create your account" : "Tell us about yourself"}
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleAccountCreation} className="space-y-6">
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
              <Label htmlFor="email">Email *</Label>
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
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.some(e => e.toLowerCase().includes('password') && !e.toLowerCase().includes('confirm')) ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.some(e => e.toLowerCase().includes('confirm') || e.toLowerCase().includes('match')) ? 'border-destructive' : ''}
              />
            </div>

            <Button type="submit" className="w-full" variant="hero">
              Continue
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handlePersonalization} className="space-y-6">
            {errors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Error creating account:</span>
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
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageGroup">Age Group</Label>
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45+">45+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studyStream">Study Stream</Label>
              <Input
                id="studyStream"
                placeholder="e.g., Computer Science, Psychology"
                value={studyStream}
                onChange={(e) => setStudyStream(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workType">Work Type</Label>
                <Select value={workType} onValueChange={setWorkType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Select value={shift} onValueChange={setShift}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                    <SelectItem value="rotating">Rotating</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Health Conditions (Optional)</Label>
              <div className="space-y-2">
                {["Anxiety", "Depression", "OCD", "ADHD", "Sleep Issues"].map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={healthConditions.includes(condition)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setHealthConditions([...healthConditions, condition]);
                        } else {
                          setHealthConditions(healthConditions.filter((c) => c !== condition));
                        }
                      }}
                    />
                    <label
                      htmlFor={condition}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {condition}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
                Back
              </Button>
              <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Complete Setup"}
              </Button>
            </div>
          </form>
        )}
      </GlassmorphismCard>
    </div>
  );
};

export default Signup;
