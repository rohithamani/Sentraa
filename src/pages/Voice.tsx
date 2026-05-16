import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, ArrowLeft, Mic, Square, Play, Pause, StopCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const Voice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Fetch existing recordings
  useEffect(() => {
    const fetchRecordings = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/voice", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRecordings(data.recordings || []);
        } else {
          console.log("Could not fetch recordings");
        }
      } catch (error) {
        console.error("Error fetching voice recordings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchRecordings();
    }
  }, [token]);

  const startRecording = async () => {
    try {
      // Request microphone permission and start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Speak naturally and share your thoughts",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const pauseRecording = () => {
    if (!mediaRecorderRef.current) return;

    if (!isPaused) {
      // Pause recording
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPaused(true);
      toast({
        title: "Recording paused",
        description: "Press resume to continue recording",
      });
    } else {
      // Resume recording
      if (mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setIsPaused(false);
      toast({
        title: "Recording resumed",
        description: "Continue sharing your thoughts",
      });
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    setIsSaving(true);
    
    mediaRecorderRef.current.onstop = async () => {
      try {
        // Create audio blob from recorded chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // For now, we'll save metadata without the actual audio file
        // In a production app, you'd upload the audio to cloud storage
        const recordingData = {
          duration: recordingTime,
          transcription: "", // Would be filled by speech-to-text service
          emotionalTone: "neutral", // Would be analyzed by AI
          audioUrl: "", // Would be the uploaded audio URL
        };

        const response = await fetch('http://localhost:5000/api/voice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(recordingData),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          toast({
            title: "Recording saved!",
            description: `Your ${formatTime(recordingTime)} voice log has been saved ${data.storage === 'temporary' ? '(temporary storage)' : 'to the database'}.`,
          });

          // Add the new recording to the list
          const newRecording = {
            _id: data.recording._id || Date.now().toString(),
            duration: recordingTime,
            transcription: "",
            emotionalTone: "neutral",
            createdAt: new Date().toISOString(),
            userId: data.recording.userId
          };
          setRecordings(prev => [newRecording, ...prev]);
        } else {
          toast({
            title: "Save failed",
            description: data.message || 'Could not save recording',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error saving recording:', error);
        toast({
          title: "Network error",
          description: 'Unable to reach server. Try again later.',
          variant: 'destructive'
        });
      } finally {
        setIsSaving(false);
      }

      // Stop all tracks to free up the microphone
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };

    // Stop recording
    if (mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setIsPaused(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
            <h1 className="text-2xl font-bold">Voice Log</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-12 text-center shadow-[var(--shadow-soft)]">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Record Your Thoughts</h2>
            <p className="text-muted-foreground">
              Share your feelings through voice for deeper emotional insights
            </p>
          </div>

          {/* Recording Controls */}
          <div className="flex flex-col items-center gap-8">
            {/* Main Recording Button */}
            <div
              className={`relative transition-[var(--transition-smooth)] ${
                isRecording && !isPaused ? "animate-pulse" : ""
              }`}
            >
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-[var(--transition-bounce)] ${
                  isRecording
                    ? isPaused
                      ? "bg-gradient-to-br from-yellow-500 to-orange-500 shadow-[var(--shadow-glow)]"
                      : "bg-gradient-to-br from-red-500 to-red-600 shadow-[var(--shadow-glow)]"
                    : "bg-gradient-to-br from-primary to-primary-glow hover:shadow-[var(--shadow-glow)]"
                }`}
                onClick={isRecording ? pauseRecording : startRecording}
              >
                {isRecording ? (
                  isPaused ? (
                    <Mic className="w-12 h-12 text-white" />
                  ) : (
                    <Pause className="w-12 h-12 text-white" />
                  )
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
              </div>
              {isRecording && !isPaused && (
                <div className="absolute -inset-4 border-4 border-red-500/30 rounded-full animate-ping"></div>
              )}
            </div>

            {/* Recording Timer */}
            {isRecording && (
              <div className="flex flex-col items-center gap-2">
                <div className={`text-3xl font-bold ${isPaused ? 'text-yellow-600' : 'text-red-500'}`}>
                  {formatTime(recordingTime)}
                </div>
                <div className={`text-sm font-medium ${isPaused ? 'text-yellow-600' : 'text-red-500'}`}>
                  {isPaused ? 'PAUSED' : 'RECORDING'}
                </div>
              </div>
            )}

            {/* Control Buttons */}
            {isRecording ? (
              <div className="flex gap-4">
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  size="lg"
                  className={`px-6 ${isPaused ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-50' : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'}`}
                >
                  {isPaused ? (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  size="lg"
                  className="px-6"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <StopCircle className="w-5 h-5 mr-2" />
                      Stop & Save
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Tap the microphone to start recording
              </p>
            )}

            {/* Instructions */}
            <div className="text-center">
              <p className="text-muted-foreground">
                {!isRecording && "Tap the microphone to start recording"}
                {isRecording && !isPaused && "Click pause to temporarily stop, or stop to save"}
                {isRecording && isPaused && "Click resume to continue or stop to save"}
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Speak naturally and freely. Use the pause button if you need a moment to think, and press "Stop & Save" when you're done. Our AI will analyze your tone and emotions to provide personalized insights.
            </p>
          </div>
        </Card>

        {/* Recent Recordings */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Your Voice Logs</h3>
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-muted rounded"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : recordings.length > 0 ? (
            <div className="space-y-4">
              {recordings.map((recording, index) => (
                <Card key={recording._id || index} className="p-4 hover:shadow-[var(--shadow-soft)] transition-[var(--transition-smooth)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button size="icon" variant="outline" disabled>
                        <Play className="w-4 h-4" />
                      </Button>
                      <div>
                        <p className="font-medium">
                          Voice Log - {new Date(recording.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(recording.createdAt).toLocaleTimeString()} • {formatTime(recording.duration)} duration
                        </p>
                        {recording.transcription && (
                          <p className="text-sm text-muted-foreground mt-1 italic">
                            "{recording.transcription.substring(0, 100)}..."
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      recording.emotionalTone === 'happy' ? 'bg-green-100 text-green-700' :
                      recording.emotionalTone === 'sad' ? 'bg-blue-100 text-blue-700' :
                      recording.emotionalTone === 'calm' ? 'bg-blue-100 text-blue-700' :
                      recording.emotionalTone === 'angry' ? 'bg-red-100 text-red-700' :
                      recording.emotionalTone === 'anxious' ? 'bg-yellow-100 text-yellow-700' :
                      recording.emotionalTone === 'excited' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {recording.emotionalTone || 'Analyzing..'}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No voice logs yet. Start recording your first voice entry above!</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Voice;
