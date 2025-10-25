import { useState, useEffect } from "react";
import { Heart, MessageCircle, Trophy, Bell, BellOff } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    fetchLikes();
    fetchComments();
    fetchFollows();
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

  const fetchFollows = async () => {
    const { data, error } = await supabase
      .from('goal_follows')
      .select('*')
      .eq('goal_id', goal.id);

    if (!error && data) {
      setFollowerCount(data.length);
      setIsFollowing(data.some(follow => follow.user_id === user?.id));
    }
  };

  const handleFollow = async () => {
    if (!user) return;

    if (isFollowing) {
      const { error } = await supabase
        .from('goal_follows')
        .delete()
        .eq('goal_id', goal.id)
        .eq('user_id', user.id);

      if (!error) {
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
        toast.success("Unfollowed goal");
      }
    } else {
      const { error } = await supabase
        .from('goal_follows')
        .insert({ goal_id: goal.id, user_id: user.id });

      if (!error) {
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast.success("Following goal! You'll get updates.");
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
    <Card className="shadow-stone hover:shadow-elevated transition-all duration-300 bg-stone-50/80 dark:bg-stone-900/40 border-2 border-stone-300/50 dark:border-stone-700/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:scale-[1.02]">
      <CardHeader className="bg-gradient-to-br from-stone-100/50 to-transparent dark:from-stone-800/30 dark:to-transparent pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="border-2 border-stone-300 dark:border-stone-600 w-12 h-12">
            <AvatarFallback className="bg-gradient-achievement text-achievement-foreground font-semibold text-lg">
              {goal.profiles.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-stone-900 dark:text-stone-100">{goal.profiles.username}</p>
              {goal.is_completed && (
                <Badge variant="achievement" className="gap-1 px-2 py-0.5">
                  <Trophy className="w-3 h-3" />
                  Completed
                </Badge>
              )}
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              {formatDistanceToNow(new Date(goal.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="bg-gradient-to-b from-transparent to-stone-50/30 dark:to-stone-900/20 pt-4 pb-3">
        <h3 className="font-bold text-xl mb-2 text-stone-900 dark:text-stone-50 leading-tight">{goal.title}</h3>
        {goal.description && (
          <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed">{goal.description}</p>
        )}
        {followerCount > 0 && (
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-3">
            {followerCount} {followerCount === 1 ? 'person' : 'people'} following
          </p>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-3 bg-stone-50/30 dark:bg-stone-900/20 border-t border-stone-200/50 dark:border-stone-700/50 pt-3">
        <div className="flex items-center gap-2 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`${isLiked ? "text-accent hover:text-accent/80" : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"} transition-colors`}
          >
            <Heart className={`w-5 h-5 mr-1 ${isLiked ? "fill-current" : ""}`} />
            {likeCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <MessageCircle className="w-5 h-5 mr-1" />
            {commentCount}
          </Button>
          <Button
            variant={isFollowing ? "default" : "outline"}
            size="sm"
            onClick={handleFollow}
            className={`ml-auto ${isFollowing ? "bg-gradient-achievement text-achievement-foreground hover:opacity-90" : "border-stone-300 dark:border-stone-600"} transition-all`}
          >
            {isFollowing ? (
              <>
                <BellOff className="w-4 h-4 mr-1" />
                Following
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-1" />
                Follow
              </>
            )}
          </Button>
        </div>

        {showComments && (
          <div className="w-full space-y-4 animate-in slide-in-from-top-2 duration-200">
            {comments.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="bg-gradient-to-br from-stone-100/90 to-stone-50/60 dark:from-stone-800/50 dark:to-stone-900/30 p-4 rounded-xl border border-stone-200/60 dark:border-stone-700/40 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8 border-2 border-stone-300/50 dark:border-stone-600/50">
                        <AvatarFallback className="bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold">
                          {comment.profiles.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-stone-900 dark:text-stone-100 mb-1">
                          {comment.profiles.username}
                        </p>
                        <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-stone-500 dark:text-stone-400">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
            
            <form onSubmit={handleComment} className="flex gap-2 pt-2 border-t border-stone-200/50 dark:border-stone-700/50">
              <Textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="bg-stone-50/80 dark:bg-stone-900/40 border-stone-300 dark:border-stone-700 focus:border-stone-400 dark:focus:border-stone-600 transition-colors resize-none"
              />
              <Button 
                type="submit" 
                size="sm" 
                variant="achievement"
                disabled={!newComment.trim()}
                className="self-end"
              >
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
