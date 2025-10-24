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
          <Button variant="achievement" size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create New Goal
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create Your Goal</DialogTitle>
            <DialogDescription className="text-base">
              Write down what you want to achieve. Once completed, it will be written in stone forever! 🪨
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">
                What do you want to achieve? *
              </Label>
              <Input
                id="title"
                placeholder="e.g., Run a marathon, Learn Spanish, Start a business"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Make it specific and measurable
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                How will you achieve it? (optional)
              </Label>
              <Textarea
                id="description"
                placeholder="e.g., Practice 30 minutes daily, join a running club, work on it every weekend..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Add details about your plan and timeline
              </p>
            </div>
            <Button type="submit" variant="achievement" className="w-full" size="lg">
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
