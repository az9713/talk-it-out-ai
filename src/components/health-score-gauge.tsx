'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Heart, MessageCircle, Target, Smile, BarChart3 } from 'lucide-react';

interface HealthScore {
  overallScore: number;
  communicationScore: number | null;
  resolutionScore: number | null;
  consistencyScore: number | null;
  progressScore: number | null;
  emotionalScore: number | null;
  trend: 'improving' | 'stable' | 'declining' | null;
  trendPercentage: number | null;
}

interface HealthScoreGaugeProps {
  score: HealthScore;
  showBreakdown?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
}

function getProgressColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function HealthScoreGauge({ score, showBreakdown = true }: HealthScoreGaugeProps) {
  const TrendIcon = score.trend === 'improving' ? TrendingUp :
                    score.trend === 'declining' ? TrendingDown : Minus;

  const trendColor = score.trend === 'improving' ? 'text-green-600' :
                     score.trend === 'declining' ? 'text-red-600' : 'text-gray-500';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          Relationship Health Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className={`text-5xl font-bold ${getScoreColor(score.overallScore)}`}>
              {score.overallScore}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {getScoreLabel(score.overallScore)}
            </div>
          </div>
          {score.trend && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="w-5 h-5" />
              <span className="text-sm font-medium capitalize">{score.trend}</span>
              {score.trendPercentage !== null && (
                <span className="text-xs">
                  ({score.trendPercentage > 0 ? '+' : ''}{score.trendPercentage}%)
                </span>
              )}
            </div>
          )}
        </div>

        {showBreakdown && (
          <div className="space-y-3 pt-4 border-t">
            <ScoreBar
              label="Communication"
              score={score.communicationScore}
              icon={MessageCircle}
            />
            <ScoreBar
              label="Resolution"
              score={score.resolutionScore}
              icon={Target}
            />
            <ScoreBar
              label="Consistency"
              score={score.consistencyScore}
              icon={BarChart3}
            />
            <ScoreBar
              label="Progress"
              score={score.progressScore}
              icon={TrendingUp}
            />
            <ScoreBar
              label="Emotional"
              score={score.emotionalScore}
              icon={Smile}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreBar({
  label,
  score,
  icon: Icon,
}: {
  label: string;
  score: number | null;
  icon: typeof MessageCircle;
}) {
  if (score === null) return null;

  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm">{label}</span>
          <span className={`text-sm font-medium ${getScoreColor(score)}`}>{score}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getProgressColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Compact version for dashboard
export function HealthScoreCompact({ score }: { score: number; trend?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
        {score}
      </div>
      <div>
        <div className="text-sm font-medium">{getScoreLabel(score)}</div>
        <div className="text-xs text-muted-foreground">Health Score</div>
      </div>
    </div>
  );
}

// Circular gauge version
export function HealthScoreCircle({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted"
        />
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={getScoreColor(score).replace('text-', 'text-')}
          style={{
            transition: 'stroke-dashoffset 1s ease-out',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-xs text-muted-foreground">{getScoreLabel(score)}</span>
      </div>
    </div>
  );
}
