'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HealthScoreGauge, HealthScoreCircle } from '@/components/health-score-gauge';
import { RefreshCw, TrendingUp, Lightbulb, Calendar, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HealthScore {
  id: string;
  overallScore: number;
  communicationScore: number | null;
  resolutionScore: number | null;
  consistencyScore: number | null;
  progressScore: number | null;
  emotionalScore: number | null;
  trend: 'improving' | 'stable' | 'declining' | null;
  trendPercentage: number | null;
  factors: {
    sessionCompletionRate: number;
    averageMoodImprovement: number;
    agreementCount: number;
    goalProgress: number;
    sessionFrequency: number;
    positiveInteractions: number;
  } | null;
  periodStart: string;
  periodEnd: string;
  calculatedAt: string;
}

export default function HealthPage() {
  const [score, setScore] = useState<HealthScore | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [history, setHistory] = useState<HealthScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    fetchHealthScore();
    fetchHistory();
  }, []);

  const fetchHealthScore = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/health-score');
      if (res.ok) {
        const data = await res.json();
        setScore(data.score);
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error fetching health score:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/health-score?type=history&months=6');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const recalculateScore = async () => {
    setIsRecalculating(true);
    try {
      const res = await fetch('/api/health-score', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setScore(data.score);
        setInsights(data.insights || []);
        fetchHistory();
      }
    } catch (error) {
      console.error('Error recalculating score:', error);
    } finally {
      setIsRecalculating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading health score...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relationship Health</h1>
          <p className="text-muted-foreground mt-1">
            Track your overall relationship wellness
          </p>
        </div>
        <Button onClick={recalculateScore} disabled={isRecalculating}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRecalculating ? 'animate-spin' : ''}`} />
          Recalculate
        </Button>
      </div>

      {!score ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No health score yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete some sessions to calculate your relationship health score.
            </p>
            <Button onClick={recalculateScore} disabled={isRecalculating}>
              Calculate Score
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main score gauge */}
            <div className="lg:col-span-2">
              <HealthScoreGauge score={score} showBreakdown={true} />
            </div>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No specific recommendations at this time.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Factors breakdown */}
          {score.factors && (
            <Card>
              <CardHeader>
                <CardTitle>Contributing Factors</CardTitle>
                <CardDescription>What's influencing your health score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <FactorCard
                    label="Session Completion"
                    value={`${score.factors.sessionCompletionRate}%`}
                    description="Sessions completed vs started"
                  />
                  <FactorCard
                    label="Mood Improvement"
                    value={score.factors.averageMoodImprovement > 0
                      ? `+${score.factors.averageMoodImprovement}`
                      : score.factors.averageMoodImprovement.toString()}
                    description="Average change after sessions"
                  />
                  <FactorCard
                    label="Agreements Made"
                    value={score.factors.agreementCount.toString()}
                    description="Total agreements reached"
                  />
                  <FactorCard
                    label="Goal Progress"
                    value={`${score.factors.goalProgress}%`}
                    description="Average goal completion"
                  />
                  <FactorCard
                    label="Session Frequency"
                    value={`${score.factors.sessionFrequency}/week`}
                    description="Sessions per week"
                  />
                  <FactorCard
                    label="Positive Interactions"
                    value={score.factors.positiveInteractions.toString()}
                    description="Sessions reaching agreement"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* History */}
          {history.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Score History
                </CardTitle>
                <CardDescription>Your health score over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.slice(0, 5).map((h, i) => (
                    <div key={h.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <HealthScoreCircle score={h.overallScore} />
                        <div>
                          <div className="text-sm font-medium">Score: {h.overallScore}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(h.calculatedAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      {h.trend && (
                        <Badge
                          variant={h.trend === 'improving' ? 'default' : h.trend === 'declining' ? 'destructive' : 'secondary'}
                        >
                          {h.trend}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function FactorCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  );
}
