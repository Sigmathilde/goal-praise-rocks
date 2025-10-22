import { Plus, Check, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
}

interface GoalSlotProps {
  goal?: Goal;
  onAdd: (title: string, description: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const GoalSlot = ({ goal, onAdd, onComplete, onDelete }: GoalSlotProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(title, description);
    setTitle("");
    setDescription("");
    setOpen(false);
  };

  if (!goal) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Card className="h-48 border-2 border-dashed border-muted-foreground/30 hover:border-accent hover:shadow-stone transition-all cursor-pointer">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <Plus className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Add a goal</p>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogDescription>
              Set a meaningful goal that you're committed to achieving
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                placeholder="Learn to play guitar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Practice 30 minutes daily, learn basic chords..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <Button type="submit" variant="achievement" className="w-full">
              Create Goal
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="h-48 shadow-stone hover:shadow-elevated transition-shadow relative group">
      <CardContent className="p-6 h-full flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg mb-2">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{goal.description}</p>
          )}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="achievement"
            onClick={() => onComplete(goal.id)}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-1" />
            Complete
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(goal.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalSlot;
