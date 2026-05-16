import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MoodProvider, useMood } from "./contexts/MoodContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AnimatedBackground from "./components/effects/AnimatedBackground";
import ParticleEffect from "./components/effects/ParticleEffect";
import AmbientSound from "./components/effects/AmbientSound";
import MovingEmojis from "./components/effects/MovingEmojis";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Chat from "./pages/Chat";
import Voice from "./pages/Voice";
import Mood from "./pages/Mood";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { currentMood, moodIntensity, enableParticles, enableSound } = useMood();
  
  return (
    <AnimatedBackground mood={currentMood} intensity={moodIntensity}>
      {/* Moving Emojis */}
      <MovingEmojis />
      
      {/* Particle Effects */}
      {enableParticles && (
        <ParticleEffect mood={currentMood} count={25} />
      )}
      
      {/* Ambient Sound - Fixed position */}
      {enableSound && (
        <div className="fixed top-4 right-4 z-50">
          <AmbientSound mood={currentMood} />
        </div>
      )}
      
      {/* Main Routes */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/journal" 
            element={
              <ProtectedRoute>
                <Journal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/voice" 
            element={
              <ProtectedRoute>
                <Voice />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mood" 
            element={
              <ProtectedRoute>
                <Mood />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AnimatedBackground>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MoodProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </MoodProvider>
  </QueryClientProvider>
);

export default App;
