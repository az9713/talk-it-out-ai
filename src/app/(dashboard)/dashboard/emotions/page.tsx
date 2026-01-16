'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmotionCheckIn, EmotionCheckInData } from '@/components/emotion-check-in';
import { Heart, TrendingUp, Calendar, Plus } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface EmotionRecord {
  id: string;
  type: 'pre_session' | 'post_session' | 'daily';
  overallMood: number;
  primaryEmotion: string | null;
  feelings: string[] | null;
  energyLevel: number | null;
  opennessToTalk: number | null;
  note: string | null;
  createdAt: string;
}

interface EmotionStats {
  totalCheckIns: number;
  averageMood: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  topFeelings: { feeling: string; count: number }[];
  checkInsByType: { type: string; count: number }[];
}

const moodEmojis = ['😢', '😔', '😐', '🙂', '😊'];
const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Great'];

export default function EmotionsPage() {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [history, setHistory] = useState<EmotionRecord[]>([]);
  const [stats, setStats] = useState<EmotionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [historyRes, statsRes] = await Promise.all([
        fetch('/api/emotions?type=history'),
        fetch('/api/emotions?type=stats'),
      ]);

      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(data);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching emotion data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckInComplete = async (data: EmotionCheckInData) => {
    try {
      const res = await fetch('/api/emotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setShowCheckIn(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving check-in:', error);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <span className="w-4 h-4 text-gray-400">―</span>;
    }
  };

  if (showCheckIn) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <EmotionCheckIn
          type="daily"
          onComplete={handleCheckInComplete}
          onSkip={() => setShowCheckIn(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emotion Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track your emotional well-being over time
          </p>
        </div>
        <Button onClick={() => setShowCheckIn(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Daily Check-In
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Check-Ins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCheckIns}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{moodEmojis[Math.round(stats.averageMood) - 1] || '😐'}</span>
                <span className="text-lg font-semibold">
                  {stats.averageMood.toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Mood Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getTrendIcon(stats.moodTrend)}
                <span className="capitalize">{stats.moodTrend}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Feeling</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {stats.topFeelings[0]?.feeling || 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading...
            </div>
          ) : history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No check-ins yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your emotions to see patterns over time
                </p>
                <Button onClick={() => setShowCheckIn(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  First Check-In
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <Card key={record.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">
                          {moodEmojis[record.overallMood - 1]}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {moodLabels[record.overallMood - 1]}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {record.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          {record.feelings && record.feelings.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {record.feelings.slice(0, 5).map((feeling) => (
                                <Badge key={feeling} variant="secondary" className="text-xs">
                                  {feeling}
                                </Badge>
                              ))}
                              {record.feelings.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{record.feelings.length - 5}
                                </Badge>
                              )}
                            </div>
                          )}
                          {record.note && (
                            <p className="text-sm text-muted-foreground mt-1 italic">
                              "{record.note}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {stats && stats.topFeelings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Most Common Feelings</CardTitle>
                  <CardDescription>
                    Feelings you've experienced most often
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topFeelings.slice(0, 5).map((item, index) => (
                      <div key={item.feeling} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="text-muted-foreground">{index + 1}.</span>
                          {item.feeling}
                        </span>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {stats && stats.checkInsByType.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Check-In Types</CardTitle>
                  <CardDescription>
                    Breakdown of your check-ins
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.checkInsByType.map((item) => (
                      <div key={item.type} className="flex items-center justify-between">
                        <span className="capitalize">{item.type.replace('_', ' ')}</span>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
