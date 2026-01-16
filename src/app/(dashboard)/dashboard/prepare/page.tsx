'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PreparationWizard, PreparationData } from '@/components/preparation-wizard';
import { ClipboardList, Plus, Trash2, Play, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Preparation {
  id: string;
  situation: string | null;
  initialFeelings: string[] | null;
  desiredOutcome: string | null;
  identifiedNeeds: string[] | null;
  draftOpening: string | null;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PreparePage() {
  const router = useRouter();
  const [preparations, setPreparations] = useState<Preparation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePreparation, setActivePreparation] = useState<Preparation | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchPreparations();
  }, []);

  const fetchPreparations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/preparations');
      if (res.ok) {
        const data = await res.json();
        setPreparations(data);
      }
    } catch (error) {
      console.error('Error fetching preparations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/preparations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const prep = await res.json();
        setActivePreparation(prep);
      }
    } catch (error) {
      console.error('Error creating preparation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async (data: PreparationData) => {
    if (!activePreparation) return;

    try {
      await fetch(`/api/preparations/${activePreparation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error saving preparation:', error);
    }
  };

  const handleGenerateSuggestion = async (): Promise<string | null> => {
    if (!activePreparation) return null;

    try {
      const res = await fetch(`/api/preparations/${activePreparation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggest' }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.suggestedOpening || null;
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
    }
    return null;
  };

  const handleComplete = async (data: PreparationData) => {
    if (!activePreparation) return;

    try {
      // Complete the preparation
      await fetch(`/api/preparations/${activePreparation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      });

      // Navigate to create a new session with this preparation
      router.push(`/dashboard/sessions/new?preparationId=${activePreparation.id}`);
    } catch (error) {
      console.error('Error completing preparation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this preparation?')) return;

    try {
      await fetch(`/api/preparations/${id}`, {
        method: 'DELETE',
      });
      fetchPreparations();
    } catch (error) {
      console.error('Error deleting preparation:', error);
    }
  };

  const handleResume = (prep: Preparation) => {
    setActivePreparation(prep);
  };

  const handleStartSession = (prep: Preparation) => {
    router.push(`/dashboard/sessions/new?preparationId=${prep.id}`);
  };

  if (activePreparation) {
    return (
      <div className="py-8">
        <Button
          variant="ghost"
          onClick={() => {
            setActivePreparation(null);
            fetchPreparations();
          }}
          className="mb-4"
        >
          ← Back to preparations
        </Button>
        <PreparationWizard
          preparationId={activePreparation.id}
          initialData={{
            situation: activePreparation.situation || undefined,
            initialFeelings: activePreparation.initialFeelings || undefined,
            desiredOutcome: activePreparation.desiredOutcome || undefined,
            identifiedNeeds: activePreparation.identifiedNeeds || undefined,
            draftOpening: activePreparation.draftOpening || undefined,
          }}
          onSave={handleSave}
          onComplete={handleComplete}
          onGenerateSuggestion={handleGenerateSuggestion}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Session Preparation</h1>
          <p className="text-muted-foreground mt-1">
            Prepare for difficult conversations before they happen
          </p>
        </div>
        <Button onClick={handleCreateNew} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? 'Creating...' : 'New Preparation'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Empty state */}
        {!isLoading && preparations.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No preparations yet</h3>
              <p className="text-muted-foreground mb-4">
                Prepare for a conversation by identifying your feelings, needs, and goals beforehand
              </p>
              <Button onClick={handleCreateNew} disabled={isCreating}>
                <Plus className="w-4 h-4 mr-2" />
                Start Preparing
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Loading...
          </div>
        )}

        {/* Preparation cards */}
        {preparations.map((prep) => (
          <Card key={prep.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base line-clamp-1">
                    {prep.situation
                      ? prep.situation.slice(0, 50) + (prep.situation.length > 50 ? '...' : '')
                      : 'Untitled preparation'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(prep.updatedAt), { addSuffix: true })}
                  </CardDescription>
                </div>
                <Badge variant={prep.isComplete ? 'default' : 'secondary'}>
                  {prep.isComplete ? 'Ready' : 'In Progress'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {prep.initialFeelings && prep.initialFeelings.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {prep.initialFeelings.slice(0, 3).map((feeling) => (
                    <Badge key={feeling} variant="outline" className="text-xs">
                      {feeling}
                    </Badge>
                  ))}
                  {prep.initialFeelings.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{prep.initialFeelings.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {prep.desiredOutcome && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Goal: {prep.desiredOutcome}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                {prep.isComplete ? (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleStartSession(prep)}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start Session
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleResume(prep)}
                  >
                    Continue
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(prep.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
