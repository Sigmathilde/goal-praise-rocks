-- Create goal_follows table for users to follow goals
CREATE TABLE public.goal_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(goal_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.goal_follows ENABLE ROW LEVEL SECURITY;

-- Create policies for goal_follows
CREATE POLICY "Follows are viewable by everyone" 
ON public.goal_follows 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own follows" 
ON public.goal_follows 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follows" 
ON public.goal_follows 
FOR DELETE 
USING (auth.uid() = user_id);