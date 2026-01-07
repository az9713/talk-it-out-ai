'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { TemplatePickerDialog } from '@/components/template-picker-dialog';
import { Template } from '@/components/template-card';

export default function NewSessionPage() {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function createSession(templateId?: string) {
    setCreating(true);
    setError('');

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create session');
      }

      const session = await res.json();
      router.replace(`/dashboard/sessions/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      setCreating(false);
    }
  }

  const handleTemplateSelect = (template: Template) => {
    setShowPicker(false);
    createSession(template.id);
  };

  const handleStartBlank = () => {
    setShowPicker(false);
    createSession();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => {
              setError('');
              setShowPicker(true);
            }}
            className="text-rose-500 hover:underline"
          >
            Try again
          </button>
        </Card>
      </div>
    );
  }

  if (creating) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-rose-500" />
          <p className="text-gray-600">Creating your session...</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="p-6 text-center">
          <p className="text-gray-600">Select a template to start your session...</p>
        </Card>
      </div>

      <TemplatePickerDialog
        open={showPicker}
        onOpenChange={(open) => {
          if (!open) {
            router.back();
          }
        }}
        onSelect={handleTemplateSelect}
        onStartBlank={handleStartBlank}
      />
    </>
  );
}
