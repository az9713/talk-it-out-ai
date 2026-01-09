'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GoalCard,
  CreateGoalDialog,
  GoalStatsCard,
  CelebrationModal,
} from '@/components/goal-tracking';
import { Target, AlertCircle } from 'lucide-react';
import type { Goal, Milestone } from '@/services/goals';

interface GoalWithMilestones extends Goal {
  milestones?: Milestone[];
}

interface GoalStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalMilestones: number;
  achievedMilestones: number;
  averageProgress: number;
}

interface Celebration {
  type: 'milestone' | 'goal';
  title: string;
  description: string;
  id: string;
  milestoneId?: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalWithMilestones[]>([]);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      const [goalsRes, statsRes] = await Promise.all([
        fetch('/api/goals'),
        fetch('/api/goals?filter=stats'),
      ]);

      if (!goalsRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch goals');
      }

      const goalsData = await goalsRes.json();
      const statsData = await statsRes.json();

      // Fetch milestones for each goal
      const goalsWithMilestones = await Promise.all(
        goalsData.map(async (goal: Goal) => {
          const res = await fetch(`/api/goals/${goal.id}`);
          if (res.ok) {
            return res.json();
          }
          return goal;
        })
      );

      setGoals(goalsWithMilestones);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkCelebrations = useCallback(async () => {
    try {
      const res = await fetch('/api/goals?filter=celebrations');
      if (res.ok) {
        const data = await res.json();

        // Show first uncelebrated achievement
        if (data.completedGoals?.length > 0) {
          const goal = data.completedGoals[0];
          setCelebration({
            type: 'goal',
            title: goal.title,
            description: 'You\'ve successfully achieved this goal!',
            id: goal.id,
          });
        } else if (data.milestones?.length > 0) {
          const milestone = data.milestones[0];
          setCelebration({
            type: 'milestone',
            title: milestone.title,
            description: milestone.description || `Progress on: ${milestone.goalTitle}`,
            id: milestone.goalId,
            milestoneId: milestone.id,
          });
        }
      }
    } catch (err) {
      console.error('Error checking celebrations:', err);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
    checkCelebrations();
  }, [fetchGoals, checkCelebrations]);

  const handleUpdateGoal = async (goalId: string, data: Partial<Goal>) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await fetchGoals();
        await checkCelebrations();
      }
    } catch (err) {
      console.error('Error updating goal:', err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchGoals();
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  const handleCelebrationClose = async () => {
    if (celebration) {
      try {
        await fetch(`/api/goals/${celebration.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'acknowledge_celebration',
            milestoneId: celebration.milestoneId,
          }),
        });
      } catch (err) {
        console.error('Error acknowledging celebration:', err);
      }
    }
    setCelebration(null);
    checkCelebrations();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchGoals} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const pausedGoals = goals.filter((g) => g.status === 'paused');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-gray-600 mt-1">
            Track your relationship goals and celebrate progress
          </p>
        </div>
        <CreateGoalDialog onGoalCreated={fetchGoals} />
      </div>

      {/* Stats */}
      {stats && <GoalStatsCard stats={stats} />}

      {/* Active Goals */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          Active Goals ({activeGoals.length})
        </h2>

        {activeGoals.length === 0 ? (
          <Card className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active goals</h3>
            <p className="text-gray-500 mb-4">
              Set a goal to start tracking your progress toward better relationships.
            </p>
            <CreateGoalDialog onGoalCreated={fetchGoals} />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdate={handleUpdateGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Paused Goals */}
      {pausedGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-amber-600">
            Paused Goals ({pausedGoals.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pausedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdate={handleUpdateGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-green-600">
            Completed Goals ({completedGoals.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdate={handleUpdateGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {celebration && (
        <CelebrationModal
          isOpen={true}
          onClose={handleCelebrationClose}
          title={celebration.title}
          description={celebration.description}
          type={celebration.type}
        />
      )}
    </div>
  );
}
