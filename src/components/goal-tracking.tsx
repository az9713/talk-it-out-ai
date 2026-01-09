'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Target,
  Plus,
  Trophy,
  Calendar,
  CheckCircle,
  Circle,
  Pause,
  Play,
  Trash2,
  Sparkles,
  X,
} from 'lucide-react';
import type { Goal, Milestone, GoalCategory } from '@/services/goals';
import { GOAL_CATEGORIES } from '@/services/goals';

// Goal Card Component
export function GoalCard({
  goal,
  onUpdate,
  onDelete,
}: {
  goal: Goal & { milestones?: Milestone[] };
  onUpdate: (goalId: string, data: Partial<Goal>) => Promise<void>;
  onDelete: (goalId: string) => Promise<void>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(goal.progress);
  const [updating, setUpdating] = useState(false);

  const categoryInfo = GOAL_CATEGORIES[goal.category as GoalCategory];

  const handleProgressChange = async (newProgress: number) => {
    setProgress(newProgress);
    setUpdating(true);
    try {
      await onUpdate(goal.id, { progress: newProgress });
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = goal.status === 'active' ? 'paused' : 'active';
    await onUpdate(goal.id, { status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'paused':
        return 'bg-amber-100 text-amber-700';
      case 'abandoned':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{categoryInfo.emoji}</span>
            <h3 className="font-semibold truncate">{goal.title}</h3>
            <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
          </div>

          {goal.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{goal.description}</p>
          )}

          <div className="flex items-center gap-2 mb-2">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-sm font-medium w-12 text-right">{progress}%</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Badge variant="outline" className="text-xs">
              {categoryInfo.label}
            </Badge>
            {goal.targetDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(goal.targetDate).toLocaleDateString()}
              </span>
            )}
            {goal.sessionsTarget && (
              <span>
                {goal.sessionsCompleted}/{goal.sessionsTarget} sessions
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStatusToggle}
            disabled={goal.status === 'completed'}
          >
            {goal.status === 'paused' ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600"
            onClick={() => onDelete(goal.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expandable milestones section */}
      {goal.milestones && goal.milestones.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <button
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Trophy className="h-4 w-4" />
            {goal.milestones.filter((m) => m.isAchieved).length}/{goal.milestones.length} milestones
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2">
              {goal.milestones.map((milestone) => (
                <MilestoneItem key={milestone.id} milestone={milestone} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick progress buttons */}
      {goal.status === 'active' && (
        <div className="mt-4 flex gap-2">
          {[25, 50, 75, 100].map((value) => (
            <Button
              key={value}
              variant={progress >= value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleProgressChange(value)}
              disabled={updating}
              className="flex-1"
            >
              {value}%
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}

// Milestone Item Component
function MilestoneItem({ milestone }: { milestone: Milestone }) {
  return (
    <div
      className={`flex items-center gap-2 text-sm p-2 rounded ${
        milestone.isAchieved ? 'bg-green-50' : 'bg-gray-50'
      }`}
    >
      {milestone.isAchieved ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <Circle className="h-4 w-4 text-gray-300" />
      )}
      <div className="flex-1">
        <span className={milestone.isAchieved ? 'text-green-700' : 'text-gray-600'}>
          {milestone.title}
        </span>
        <span className="text-xs text-gray-400 ml-2">({milestone.targetProgress}%)</span>
      </div>
      {milestone.achievedAt && (
        <span className="text-xs text-gray-400">
          {new Date(milestone.achievedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

// Create Goal Dialog
export function CreateGoalDialog({
  onGoalCreated,
}: {
  onGoalCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('communication');
  const [targetDate, setTargetDate] = useState('');
  const [sessionsTarget, setSessionsTarget] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          targetDate: targetDate || undefined,
          sessionsTarget: sessionsTarget ? parseInt(sessionsTarget) : undefined,
        }),
      });

      if (response.ok) {
        setOpen(false);
        resetForm();
        onGoalCreated();
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('communication');
    setTargetDate('');
    setSessionsTarget('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a New Goal</DialogTitle>
          <DialogDescription>
            Set a relationship goal to track your progress over time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Communicate more openly"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you want to achieve?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as GoalCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GOAL_CATEGORIES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.emoji} {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date (optional)</Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionsTarget">Sessions Target (optional)</Label>
              <Input
                id="sessionsTarget"
                type="number"
                min="1"
                max="100"
                value={sessionsTarget}
                onChange={(e) => setSessionsTarget(e.target.value)}
                placeholder="e.g., 10"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'Creating...' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Celebration Modal
export function CelebrationModal({
  isOpen,
  onClose,
  title,
  description,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type: 'milestone' | 'goal';
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center animate-bounce-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          {type === 'goal' ? (
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-2">
          {type === 'goal' ? '🎉 Goal Achieved!' : '⭐ Milestone Reached!'}
        </h2>
        <h3 className="text-xl font-semibold text-rose-600 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>

        <Button onClick={onClose} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  );
}

// Goal Stats Card
export function GoalStatsCard({
  stats,
}: {
  stats: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    totalMilestones: number;
    achievedMilestones: number;
    averageProgress: number;
  };
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.activeGoals}</p>
            <p className="text-sm text-gray-500">Active Goals</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.completedGoals}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Trophy className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {stats.achievedMilestones}/{stats.totalMilestones}
            </p>
            <p className="text-sm text-gray-500">Milestones</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.averageProgress}%</p>
            <p className="text-sm text-gray-500">Avg Progress</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
