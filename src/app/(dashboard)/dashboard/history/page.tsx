'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  History,
  ChevronRight,
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Star,
  AlertCircle,
} from 'lucide-react';
import type { SessionHistoryData, SessionHistoryItem } from '@/services/insights';

export default function HistoryPage() {
  const [data, setData] = useState<SessionHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/insights');
      if (!response.ok) {
        throw new Error('Failed to fetch session history');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
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
        <Button onClick={fetchHistory} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { sessions, stats, themes } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Session History & Insights</h1>
        <p className="text-gray-600 mt-1">
          Track your progress and discover patterns in your conflict resolution journey
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={MessageSquare}
          color="blue"
        />
        <StatsCard
          title="Completed"
          value={stats.completedSessions}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Avg Progress"
          value={`${stats.averageProgress}%`}
          icon={TrendingUp}
          color="amber"
        />
        <StatsCard
          title="Breakthroughs"
          value={stats.totalBreakthroughs}
          icon={Star}
          color="rose"
        />
      </div>

      {/* Themes Analysis */}
      {themes.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-rose-500" />
            Resolution Themes
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {themes.map((theme) => (
              <div
                key={theme.theme}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{theme.theme}</span>
                  <Badge variant="secondary">{theme.count} sessions</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={theme.successRate} className="h-2 flex-1" />
                  <span className="text-sm text-gray-500">{theme.successRate}% resolved</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Session List */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-rose-500" />
          All Sessions
        </h2>

        {sessions.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sessions yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start your first conflict resolution session to begin tracking your progress.
            </p>
            <Button asChild>
              <Link href="/dashboard/sessions/new">Start a Session</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: typeof MessageSquare;
  color: 'blue' | 'green' | 'amber' | 'rose';
}) {
  const colorStyles = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorStyles[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </div>
    </Card>
  );
}

function SessionCard({ session }: { session: SessionHistoryItem }) {
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
    <Link href={`/dashboard/history/${session.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{session.topic}</h3>
              <Badge className={getStatusColor(session.status)}>
                {session.status}
              </Badge>
              {session.hasAgreements && (
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Agreements
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {session.messageCount} messages
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(session.updatedAt).toLocaleDateString()}
              </span>
              <span>{session.stageLabel}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={session.progress} className="h-1.5 flex-1 max-w-xs" />
              <span className="text-xs text-gray-500">{session.progress}%</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </Card>
    </Link>
  );
}
