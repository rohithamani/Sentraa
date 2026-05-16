import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Brain, ArrowLeft, Save, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const Journal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entry, setEntry] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useAuth();

  // Fetch existing journal entries
  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/journal", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEntries(data);
        } else {
          console.log("Could not fetch entries, using local storage fallback");
          // Try to get from local storage as fallback
          const savedEntries = localStorage.getItem(`journal_entries_${token}`);
          if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
          }
        }
      } catch (error) {
        console.error("Error fetching journal entries:", error);
        // Fallback to local storage
        const savedEntries = localStorage.getItem(`journal_entries_${token}`);
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchEntries();
    }
  }, [token]);

  const handleSave = async () => {
    if (!entry.trim()) {
      toast({
        title: "Empty Entry",
        description: "Please write something in your journal entry.",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: 'Not signed in',
        description: 'Please sign in to save journal entries.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      // First try the regular journal endpoint
      let res = await fetch('http://localhost:5000/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: entry }),
      });

      let data = await res.json();

      if (res.ok && data.success) {
        const isTemporary = data.note && data.note.includes('temporary');
        toast({ 
          title: 'Entry saved!', 
          description: isTemporary 
            ? 'Your journal entry has been saved (temporary storage - will persist when you restart the server).' 
            : 'Your journal entry has been saved successfully to the database.'
        });
        
        // Refresh the entries list with the new entry
        const newEntry = {
          _id: data._id || Date.now().toString(),
          content: entry.trim(),
          createdAt: new Date().toISOString(),
          userId: data.userId || 'local_user'
        };
        setEntries(prev => [newEntry, ...prev]);
        setEntry('');
      } else {
        toast({ title: 'Save failed', description: data.message || 'Could not save entry.' , variant: 'destructive'});
      }
    } catch (err) {
      console.error('Journal save error:', err);
      toast({ title: 'Network error', description: 'Unable to reach server. Try again later.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">Journal</h1>
            </div>
          </div>
          <Button variant="hero" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 shadow-[var(--shadow-soft)]">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Today's Reflection</h2>
            <p className="text-muted-foreground">
              Express your thoughts and feelings freely. This is your safe space.
            </p>
          </div>

          <Textarea
            placeholder="How are you feeling today? What's on your mind? Write freely without judgment..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="min-h-[400px] text-base resize-none"
          />

          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Try to write for at least 5 minutes. Research shows that regular
              journaling can help reduce stress, improve mood, and increase self-awareness.
            </p>
          </div>
        </Card>

        {/* Recent Entries */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Your Journal Entries</h3>
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </Card>
              ))}
            </div>
          ) : entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((journalEntry, index) => (
                <Card key={journalEntry._id || index} className="p-4 hover:shadow-[var(--shadow-soft)] transition-[var(--transition-smooth)]">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-muted-foreground">
                      {new Date(journalEntry.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <p className="text-foreground/80 whitespace-pre-wrap">
                    {journalEntry.content}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No journal entries yet. Start writing your first entry above!</p>
            </Card>
          )}
        </div>
      </main>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={handleSave}
          disabled={isSaving || !entry.trim()}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isSaving ? (
            <RefreshCw className="w-6 h-6 animate-spin" />
          ) : (
            <Save className="w-6 h-6" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default Journal;
