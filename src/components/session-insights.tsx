'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Circle,
  MessageSquare,
  Clock,
  Target,
  Lightbulb,
  Heart,
  Star,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import type { SessionInsights, SessionTimeline, SessionBreakthrough, SessionPattern } from '@/services/insights';

// Timeline component showing session progress
export function SessionTimeline({ timeline }: { timeline: SessionTimeline[] }) {
  if (timeline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-4">
        {timeline.map((item, index) => (
          <div key={item.id} className="relative flex gap-4">
            {/* Icon */}
            <div
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                item.isBreakthrough
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {item.isBreakthrough ? (
                <Star className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.stageLabel}</span>
                {item.isBreakthrough && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    Breakthrough
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {item.messageCount} messages
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Breakthroughs list component
export function BreakthroughsList({ breakthroughs }: { breakthroughs: SessionBreakthrough[] }) {
  if (breakthroughs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No breakthroughs yet - keep going!</p>
      </div>
    );
  }

  const getIcon = (type: SessionBreakthrough['type']) => {
    switch (type) {
      case 'agreement':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'common_ground':
        return <Heart className="h-5 w-5 text-rose-500" />;
      case 'reflection':
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      case 'progress':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default:
        return <Star className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-3">
      {breakthroughs.map((breakthrough) => (
        <div
          key={breakthrough.id}
          className="flex gap-3 p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(breakthrough.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">{breakthrough.title}</h4>
            <p className="text-sm text-gray-600 mt-0.5">{breakthrough.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(breakthrough.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Patterns analysis component
export function PatternsAnalysis({ patterns }: { patterns: SessionPattern[] }) {
  if (patterns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Not enough data to analyze patterns</p>
      </div>
    );
  }

  const getSentimentStyles = (sentiment: SessionPattern['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'concern':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSentimentIcon = (sentiment: SessionPattern['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'concern':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {patterns.map((pattern, index) => (
        <div
          key={index}
          className={`flex gap-3 p-3 rounded-lg border ${getSentimentStyles(pattern.sentiment)}`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getSentimentIcon(pattern.sentiment)}
          </div>
          <div>
            <h4 className="font-medium text-sm">{pattern.category}</h4>
            <p className="text-sm mt-0.5 opacity-90">{pattern.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Session progress card
export function SessionProgressCard({
  progress,
  stage,
  stageLabel,
  status,
}: {
  progress: number;
  stage: string;
  stageLabel: string;
  status: string;
}) {
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
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Session Progress</h3>
        <Badge className={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>
      <Progress value={progress} className="h-2 mb-2" />
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Current: {stageLabel}</span>
        <span className="font-medium">{progress}%</span>
      </div>
    </Card>
  );
}

// Message stats card
export function MessageStatsCard({
  stats,
}: {
  stats: SessionInsights['messageStats'];
}) {
  return (
    <Card className="p-4">
      <h3 className="font-medium mb-3">Message Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold text-rose-500">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Messages</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-500">{stats.userMessages}</p>
          <p className="text-sm text-gray-500">Your Messages</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-purple-500">{stats.assistantMessages}</p>
          <p className="text-sm text-gray-500">AI Responses</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-500">{stats.averageLength}</p>
          <p className="text-sm text-gray-500">Avg Length</p>
        </div>
      </div>
    </Card>
  );
}

// Duration card
export function DurationCard({
  duration,
}: {
  duration: SessionInsights['duration'];
}) {
  return (
    <Card className="p-4">
      <h3 className="font-medium mb-3">Duration</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Started</span>
          <span>{new Date(duration.started).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Last Activity</span>
          <span>{new Date(duration.lastActivity).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Days Active</span>
          <span className="font-medium">{duration.daysActive} day{duration.daysActive !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </Card>
  );
}

// Agreements list
export function AgreementsList({
  agreements,
}: {
  agreements: SessionInsights['agreements'];
}) {
  if (agreements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No agreements yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {agreements.map((agreement) => (
        <div
          key={agreement.id}
          className="p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm">{agreement.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(agreement.createdAt).toLocaleDateString()}
                {agreement.agreedByBoth && (
                  <span className="ml-2 text-green-600">• Agreed by both</span>
                )}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// NVC Perspectives summary
export function PerspectivesSummary({
  perspectives,
}: {
  perspectives: SessionInsights['perspectives'];
}) {
  if (!perspectives) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Perspectives not yet captured</p>
      </div>
    );
  }

  const items = [
    { label: 'Observation', value: perspectives.observation, color: 'blue' },
    { label: 'Feeling', value: perspectives.feeling, color: 'rose' },
    { label: 'Need', value: perspectives.need, color: 'amber' },
    { label: 'Request', value: perspectives.request, color: 'green' },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="p-3 bg-gray-50 rounded-lg">
          <p className={`text-xs font-medium text-${item.color}-600 uppercase tracking-wide mb-1`}>
            {item.label}
          </p>
          <p className="text-sm">
            {item.value || <span className="text-gray-400 italic">Not yet expressed</span>}
          </p>
        </div>
      ))}
    </div>
  );
}
