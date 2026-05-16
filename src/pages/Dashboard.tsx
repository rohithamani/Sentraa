import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, MessageCircle, Mic, Smile, ListTodo, Calendar, Brain, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      icon: BookOpen,
      title: "Journal",
      description: "Write about your day and feelings",
      path: "/journal",
      gradient: "from-primary to-primary-glow",
    },
    {
      icon: MessageCircle,
      title: "AI Chat",
      description: "Talk to your wellness companion",
      path: "/chat",
      gradient: "from-secondary to-accent",
    },
    {
      icon: Mic,
      title: "Voice Log",
      description: "Record your thoughts and emotions",
      path: "/voice",
      gradient: "from-accent to-primary",
    },
    {
      icon: Smile,
      title: "Mood Tracker",
      description: "Track your emotions over time",
      path: "/mood",
      gradient: "from-primary-glow to-secondary",
    },
  ];

  const optionalFeatures = [
    {
      icon: ListTodo,
      title: "Tasks",
      description: "Manage your daily tasks",
      path: "/tasks",
    },
    {
      icon: Calendar,
      title: "Wellness Calendar",
      description: "Track patterns and cycles",
      path: "/calendar",
    },
    {
      icon: Brain,
      title: "Personalization Quiz",
      description: "Improve your AI insights",
      path: "/quiz",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SENTRAA
            </h1>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">How are you feeling today?</p>
        </div>

        {/* Main Features */}
        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-6">Your Wellness Tools</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainFeatures.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-[var(--shadow-soft)] transition-[var(--transition-smooth)] cursor-pointer group border-border/50"
                onClick={() => navigate(feature.path)}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-[var(--transition-bounce)]`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Optional Features */}
        <section>
          <h3 className="text-2xl font-semibold mb-6">Additional Tools</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {optionalFeatures.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-[var(--shadow-soft)] transition-[var(--transition-smooth)] cursor-pointer group border-border/50"
                onClick={() => navigate(feature.path)}
              >
                <feature.icon className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-[var(--transition-bounce)]" />
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
