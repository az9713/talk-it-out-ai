'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatternCard, PatternCardCompact } from '@/components/pattern-card';
import { Brain, RefreshCw, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

interface ConflictPattern {
  id: string;
  type: string;
  title: string;
  description: string;
  frequency: string | null;
  severity: number | null;
  relatedSessionIds: string[] | null;
  exampleQuotes: string[] | null;
  suggestions: string[] | null;
  confidence: number | null;
  isAcknowledged: boolean;
  isResolved: boolean;
  detectedAt: string;
}

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<ConflictPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/patterns');
      if (res.ok) {
        const data = await res.json();
        setPatterns(data);
      }
    } catch (error) {
      console.error('Error fetching patterns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/patterns', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.patternsFound > 0) {
          fetchPatterns();
        }
      }
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await fetch(`/api/patterns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge' }),
      });
      fetchPatterns();
    } catch (error) {
      console.error('Error acknowledging pattern:', error);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await fetch(`/api/patterns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve' }),
      });
      fetchPatterns();
    } catch (error) {
      console.error('Error resolving pattern:', error);
    }
  };

  const activePatterns = patterns.filter((p) => !p.isResolved);
  const resolvedPatterns = patterns.filter((p) => p.isResolved);
  const highPriorityPatterns = activePatterns.filter((p) => p.severity && p.severity >= 4);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Conflict Patterns</h1>
          <p className="text-muted-foreground mt-1">
            AI-detected patterns in your communication
          </p>
        </div>
        <Button onClick={runAnalysis} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePatterns.length}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highPriorityPatterns.length}</div>
            <p className="text-xs text-muted-foreground">Severity 4-5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedPatterns.length}</div>
            <p className="text-xs text-muted-foreground">Patterns addressed</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading patterns...</div>
      ) : patterns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No patterns detected yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete a few more sessions for the AI to analyze your communication patterns.
            </p>
            <Button onClick={runAnalysis} disabled={isAnalyzing}>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Sessions
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activePatterns.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({resolvedPatterns.length})
            </TabsTrigger>
            <TabsTrigger value="positive">
              Positive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activePatterns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active patterns. Great job!
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activePatterns
                  .filter((p) => p.type !== 'positive_pattern')
                  .map((pattern) => (
                    <PatternCard
                      key={pattern.id}
                      pattern={pattern}
                      onAcknowledge={handleAcknowledge}
                      onResolve={handleResolve}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolved" className="mt-6">
            {resolvedPatterns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No resolved patterns yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {resolvedPatterns.map((pattern) => (
                  <PatternCard key={pattern.id} pattern={pattern} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="positive" className="mt-6">
            {patterns.filter((p) => p.type === 'positive_pattern').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No positive patterns detected yet. Keep working on your communication!
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {patterns
                  .filter((p) => p.type === 'positive_pattern')
                  .map((pattern) => (
                    <PatternCard key={pattern.id} pattern={pattern} />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
