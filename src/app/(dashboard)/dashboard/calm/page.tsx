'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BreathingExercise, ExerciseCard } from '@/components/breathing-exercise';
import { Wind, Footprints, Eye, User, Sparkles, Clock, TrendingUp, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CalmingExercise {
  id: string;
  name: string;
  description: string | null;
  type: 'breathing' | 'grounding' | 'visualization' | 'body_scan';
  durationSeconds: number;
  instructions: any[] | null;
}

interface ExerciseCompletion {
  id: string;
  exerciseId: string;
  moodBefore: number | null;
  moodAfter: number | null;
  completedAt: string;
  exercise?: CalmingExercise;
}

interface CompletionStats {
  totalCompletions: number;
  averageMoodImprovement: number;
  favoriteExercise: string | null;
  completionsByType: { type: string; count: number }[];
}

const TYPE_ICONS = {
  breathing: Wind,
  grounding: Footprints,
  visualization: Eye,
  body_scan: User,
};

export default function CalmPage() {
  const [exercises, setExercises] = useState<CalmingExercise[]>([]);
  const [recommended, setRecommended] = useState<CalmingExercise | null>(null);
  const [history, setHistory] = useState<ExerciseCompletion[]>([]);
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeExercise, setActiveExercise] = useState<CalmingExercise | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [exercisesRes, recommendedRes, historyRes, statsRes] = await Promise.all([
        fetch('/api/calming'),
        fetch('/api/calming?type=recommended'),
        fetch('/api/calming?type=history'),
        fetch('/api/calming?type=stats'),
      ]);

      if (exercisesRes.ok) {
        setExercises(await exercisesRes.json());
      }
      if (recommendedRes.ok) {
        setRecommended(await recommendedRes.json());
      }
      if (historyRes.ok) {
        setHistory(await historyRes.json());
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseComplete = async (moodBefore: number, moodAfter: number) => {
    if (!activeExercise) return;

    try {
      await fetch(`/api/calming/${activeExercise.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodBefore, moodAfter }),
      });

      setActiveExercise(null);
      fetchData();
    } catch (error) {
      console.error('Error recording completion:', error);
    }
  };

  const filteredExercises = filterType
    ? exercises.filter((e) => e.type === filterType)
    : exercises;

  if (activeExercise) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <BreathingExercise
          exercise={activeExercise}
          onComplete={handleExerciseComplete}
          onCancel={() => setActiveExercise(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Calming Center</h1>
        <p className="text-muted-foreground mt-1">
          Relax and center yourself before difficult conversations
        </p>
      </div>

      {/* Stats overview */}
      {stats && stats.totalCompletions > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Exercises Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompletions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Avg Mood Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.averageMoodImprovement > 0 ? '+' : ''}{stats.averageMoodImprovement}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Favorite Exercise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">
                {stats.favoriteExercise || 'None yet'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Most Used Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold capitalize">
                {stats.completionsByType[0]?.type.replace('_', ' ') || 'None'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommended exercise */}
      {recommended && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Recommended for You
            </CardTitle>
            <CardDescription>Based on your history and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{recommended.name}</h3>
                <p className="text-sm text-muted-foreground">{recommended.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{recommended.type.replace('_', ' ')}</Badge>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.ceil(recommended.durationSeconds / 60)} min
                  </Badge>
                </div>
              </div>
              <Button onClick={() => setActiveExercise(recommended)}>
                Start Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="exercises" className="w-full">
        <TabsList>
          <TabsTrigger value="exercises">All Exercises</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="mt-6">
          {/* Type filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={filterType === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(null)}
            >
              All
            </Button>
            {Object.entries(TYPE_ICONS).map(([type, Icon]) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
              >
                <Icon className="w-4 h-4 mr-1" />
                {type.replace('_', ' ')}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading exercises...</div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No exercises found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onSelect={setActiveExercise}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Wind className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No exercises completed yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start with a breathing exercise to calm your mind
                </p>
                {exercises.length > 0 && (
                  <Button onClick={() => setActiveExercise(exercises[0])}>
                    Try Your First Exercise
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((completion) => {
                const Icon = TYPE_ICONS[completion.exercise?.type || 'breathing'];
                const improvement = (completion.moodAfter || 0) - (completion.moodBefore || 0);

                return (
                  <Card key={completion.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{completion.exercise?.name || 'Exercise'}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(completion.completedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {completion.moodBefore && completion.moodAfter && (
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{['😢', '😔', '😐', '🙂', '😊'][completion.moodBefore - 1]}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-xl">{['😢', '😔', '😐', '🙂', '😊'][completion.moodAfter - 1]}</span>
                              {improvement > 0 && (
                                <Badge className="bg-green-100 text-green-800">+{improvement}</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
