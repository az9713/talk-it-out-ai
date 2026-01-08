'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import {
  StatsCard,
  SessionsChart,
  StatusPieChart,
  ActivityChart,
  TopicChart,
} from '@/components/analytics';
import type { AnalyticsData } from '@/services/analytics';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
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
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="text-rose-500 hover:text-rose-600 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const { sessionMetrics, timeMetrics, sessionsOverTime, statusBreakdown, recentActivity, topTopics } = analytics;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Insights into your conflict resolution journey
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Sessions"
          value={sessionMetrics.totalSessions}
          subtitle={`${timeMetrics.totalMessages} total messages`}
          icon={MessageCircle}
        />
        <StatsCard
          title="Completed"
          value={sessionMetrics.completedSessions}
          subtitle={`${sessionMetrics.completionRate}% completion rate`}
          icon={CheckCircle}
        />
        <StatsCard
          title="Active Sessions"
          value={sessionMetrics.activeSessions}
          subtitle={`${sessionMetrics.pausedSessions} paused`}
          icon={Clock}
        />
        <StatsCard
          title="Avg Messages"
          value={timeMetrics.averageMessagesPerSession}
          subtitle="per session"
          icon={TrendingUp}
        />
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SessionsChart data={sessionsOverTime} />
        <StatusPieChart data={statusBreakdown} />
      </div>

      {/* Secondary Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityChart data={recentActivity} />
        <TopicChart data={topTopics} />
      </div>

      {/* Empty State Message */}
      {sessionMetrics.totalSessions === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No sessions yet
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Start your first conflict resolution session to see your analytics and track your progress over time.
          </p>
        </div>
      )}
    </div>
  );
}
