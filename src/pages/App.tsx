import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Search, User, Settings, HelpCircle, UserCircle } from "lucide-react";
import GoalSlot from "@/components/GoalSlot";
import GoalCard from "@/components/GoalCard";
import { toast } from "sonner";

const App = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [userGoals, setUserGoals] = useState<any[]>([]);
  const [feedGoals, setFeedGoals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserGoals();
      fetchFeedGoals();
      subscribeToChanges();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setUserProfile(data);
    }
  };

  const fetchUserGoals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUserGoals(data);
    }
  };

  const fetchFeedGoals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('goals')
      .select('*, profiles(username)')
      .neq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setFeedGoals(data);
    }
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals'
        },
        () => {
          fetchUserGoals();
          fetchFeedGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAddGoal = async (title: string, description: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title,
        description
      });

    if (error) {
      if (error.message.includes('violates row-level security policy')) {
        toast.error("You can only have 3 active goals at a time");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Goal created!");
      fetchUserGoals();
    }
  };

  const handleCompleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      toast.success("🎉 Goal completed! Written in stone forever!");
      fetchUserGoals();
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success("Goal removed");
      fetchUserGoals();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const emptySlots = Math.max(0, 3 - userGoals.length);

  const filteredFeedGoals = feedGoals.filter((goal) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const username = goal.profiles?.username?.toLowerCase() || "";
    const title = goal.title?.toLowerCase() || "";
    const description = goal.description?.toLowerCase() || "";
    return username.includes(query) || title.includes(query) || description.includes(query);
  });

  return (
    <div className="min-h-screen bg-gradient-stone">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold whitespace-nowrap">Written in Stone</h1>
          
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search people and goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={userProfile?.avatar_url} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <UserCircle className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Your Goals Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Your Goals</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {userGoals.map((goal) => (
              <GoalSlot
                key={goal.id}
                goal={goal}
                onAdd={handleAddGoal}
                onComplete={handleCompleteGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <GoalSlot
                key={`empty-${i}`}
                onAdd={handleAddGoal}
                onComplete={handleCompleteGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        </section>

        {/* Social Feed */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Community Goals</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {filteredFeedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
            {filteredFeedGoals.length === 0 && feedGoals.length > 0 && (
              <p className="text-center text-muted-foreground py-12">
                No goals found matching "{searchQuery}"
              </p>
            )}
            {feedGoals.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                No community goals yet. Be the first to share yours!
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;
