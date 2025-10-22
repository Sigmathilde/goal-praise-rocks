import { useState, useEffect } from "react";
import { Heart, MessageCircle, Trophy } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description: string | null;
    is_completed: boolean;
    created_at: string;
    profiles: {
      username: string;
    };
  };
}

const GoalCard = ({ goal }: GoalCardProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchLikes();
    fetchComments();
  }, [goal.id]);

  const fetchLikes = async () => {
    const { data, error } = await supabase
      .from('goal_likes')
      .select('*')
      .eq('goal_id', goal.id);

    if (!error && data) {
      setLikeCount(data.length);
      setIsLiked(data.some(like => like.user_id === user?.id));
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('goal_comments')
      .select('*, profiles(username)')
      .eq('goal_id', goal.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data);
      setCommentCount(data.length);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    if (isLiked) {
      const { error } = await supabase
        .from('goal_likes')
        .delete()
        .eq('goal_id', goal.id)
        .eq('user_id', user.id);

      if (!error) {
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      }
    } else {
      const { error } = await supabase
        .from('goal_likes')
        .insert({ goal_id: goal.id, user_id: user.id });

      if (!error) {
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    const { error } = await supabase
      .from('goal_comments')
      .insert({
        goal_id: goal.id,
        user_id: user.id,
        content: newComment
      });

    if (!error) {
      setNewComment("");
      fetchComments();
      toast.success("Comment added!");
    } else {
      toast.error("Failed to add comment");
    }
  };

  return (
    <Card className="shadow-stone hover:shadow-elevated transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-gradient-achievement text-achievement-foreground">
              {goal.profiles.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{goal.profiles.username}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(goal.created_at), { addSuffix: true })}
            </p>
          </div>
          {goal.is_completed && (
            <Trophy className="ml-auto w-6 h-6 text-achievement" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-bold text-xl mb-2">{goal.title}</h3>
        {goal.description && (
          <p className="text-muted-foreground">{goal.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="flex gap-4 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={isLiked ? "text-accent" : ""}
          >
            <Heart className={`w-5 h-5 mr-1 ${isLiked ? "fill-current" : ""}`} />
            {likeCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-5 h-5 mr-1" />
            {commentCount}
          </Button>
        </div>

        {showComments && (
          <div className="w-full space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-muted/50 p-3 rounded-lg">
                <p className="font-semibold text-sm">{comment.profiles.username}</p>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}
            <form onSubmit={handleComment} className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
              />
              <Button type="submit" size="sm" variant="achievement">
                Post
              </Button>
            </form>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default GoalCard;
