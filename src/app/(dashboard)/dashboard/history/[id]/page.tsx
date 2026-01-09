'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  SessionTimeline,
  BreakthroughsList,
  PatternsAnalysis,
  SessionProgressCard,
  MessageStatsCard,
  DurationCard,
  AgreementsList,
  PerspectivesSummary,
} from '@/components/session-insights';
import {
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import type { SessionInsights } from '@/services/insights';

export default function SessionInsightsPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [insights, setInsights] = useState<SessionInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [sessionId]);

  const fetchInsights = async () => {
    try {
      const response = await fetch(`/api/insights/sessions/${sessionId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Session not found');
        }
        throw new Error('Failed to fetch session insights');
      }
      const data = await response.json();
      setInsights(data);
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
        <Button asChild variant="outline">
          <Link href="/dashboard/history">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Link>
        </Button>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/history"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to History
          </Link>
          <h1 className="text-2xl font-bold">{insights.topic}</h1>
          <p className="text-gray-600 mt-1">
            Session insights and progress analysis
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/sessions/${sessionId}`}>
            <MessageSquare className="h-4 w-4 mr-2" />
            View Session
            <ExternalLink className="h-3 w-3 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Progress and Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <SessionProgressCard
          progress={insights.progress}
          stage={insights.stage}
          stageLabel={insights.stageLabel}
          status={insights.status}
        />
        <MessageStatsCard stats={insights.messageStats} />
        <DurationCard duration={insights.duration} />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timeline */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Session Timeline</h2>
          <SessionTimeline timeline={insights.timeline} />
        </Card>

        {/* Breakthroughs */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Key Breakthroughs</h2>
          <BreakthroughsList breakthroughs={insights.breakthroughs} />
        </Card>

        {/* Patterns */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Communication Patterns</h2>
          <PatternsAnalysis patterns={insights.patterns} />
        </Card>

        {/* NVC Perspectives */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your NVC Perspectives</h2>
          <PerspectivesSummary perspectives={insights.perspectives} />
        </Card>
      </div>

      {/* Agreements Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Agreements Reached</h2>
        <AgreementsList agreements={insights.agreements} />
      </Card>
    </div>
  );
}
