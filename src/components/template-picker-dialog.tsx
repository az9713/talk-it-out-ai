'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TemplateCard, Template, TemplateCardSkeleton } from '@/components/template-card';
import { Search, FileText } from 'lucide-react';

interface TemplatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: Template) => void;
  onStartBlank: () => void;
}

const categories = [
  { value: 'all', label: 'All' },
  { value: 'communication', label: 'Communication' },
  { value: 'household', label: 'Household' },
  { value: 'finances', label: 'Finances' },
  { value: 'parenting', label: 'Parenting' },
  { value: 'work', label: 'Work' },
  { value: 'boundaries', label: 'Boundaries' },
  { value: 'intimacy', label: 'Intimacy' },
  { value: 'other', label: 'Other' },
];

export function TemplatePickerDialog({
  open,
  onOpenChange,
  onSelect,
  onStartBlank,
}: TemplatePickerDialogProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      search === '' ||
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === 'all' || template.category === category;

    return matchesSearch && matchesCategory;
  });

  const handleSelect = (template: Template) => {
    onSelect(template);
    onOpenChange(false);
  };

  const handleStartBlank = () => {
    onStartBlank();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Start with a template to guide your conversation, or begin with a blank session.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={handleStartBlank}>
            <FileText className="h-4 w-4 mr-2" />
            Start Blank
          </Button>
        </div>

        <Tabs value={category} onValueChange={setCategory} className="flex-1 flex flex-col min-h-0">
          <TabsList className="flex-wrap h-auto gap-1 justify-start">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={category} className="flex-1 mt-4 min-h-0">
            <ScrollArea className="h-[300px] pr-4">
              {loading ? (
                <div className="grid gap-3">
                  {[1, 2, 3].map((i) => (
                    <TemplateCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No templates found.</p>
                  {search && (
                    <Button
                      variant="link"
                      className="mt-2"
                      onClick={() => setSearch('')}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
