'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateCard, Template, TemplateCardSkeleton } from '@/components/template-card';
import { Plus, Loader2 } from 'lucide-react';

const categories = [
  { value: 'household', label: 'Household' },
  { value: 'finances', label: 'Finances' },
  { value: 'communication', label: 'Communication' },
  { value: 'parenting', label: 'Parenting' },
  { value: 'work', label: 'Work' },
  { value: 'boundaries', label: 'Boundaries' },
  { value: 'intimacy', label: 'Intimacy' },
  { value: 'other', label: 'Other' },
];

interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  promptContext: string;
  suggestedOpening: string;
}

const emptyFormData: TemplateFormData = {
  name: '',
  description: '',
  category: 'communication',
  promptContext: '',
  suggestedOpening: '',
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(emptyFormData);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTemplate, setDeleteTemplate] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

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

  const systemTemplates = templates.filter((t) => t.isSystem);
  const myTemplates = templates.filter((t) => !t.isSystem);

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData(emptyFormData);
    setShowDialog(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      promptContext: template.promptContext,
      suggestedOpening: template.suggestedOpening || '',
    });
    setShowDialog(true);
  };

  const handleDelete = (template: Template) => {
    setDeleteTemplate(template);
  };

  const confirmDelete = async () => {
    if (!deleteTemplate) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/templates/${deleteTemplate.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== deleteTemplate.id));
        setDeleteTemplate(null);
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingTemplate
        ? `/api/templates/${editingTemplate.id}`
        : '/api/templates';
      const method = editingTemplate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const savedTemplate = await res.json();
        if (editingTemplate) {
          setTemplates((prev) =>
            prev.map((t) => (t.id === savedTemplate.id ? savedTemplate : t))
          );
        } else {
          setTemplates((prev) => [savedTemplate, ...prev]);
        }
        setShowDialog(false);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-gray-600">
            Quick-start your sessions with conversation templates
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="my">My Templates ({myTemplates.length})</TabsTrigger>
          <TabsTrigger value="system">System Templates ({systemTemplates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TemplateCardSkeleton key={i} />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No templates available yet.</p>
              <Button className="mt-4" onClick={handleCreate}>
                Create your first template
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  showActions={!template.isSystem}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <TemplateCardSkeleton key={i} />
              ))}
            </div>
          ) : myTemplates.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">You haven&apos;t created any templates yet.</p>
              <Button className="mt-4" onClick={handleCreate}>
                Create your first template
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  showActions
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TemplateCardSkeleton key={i} />
              ))}
            </div>
          ) : systemTemplates.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No system templates available.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {systemTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? 'Update your template details below.'
                : 'Create a reusable template to quickly start conversations.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Household Chores Discussion"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of this template"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promptContext">Context</Label>
              <Textarea
                id="promptContext"
                placeholder="Describe the situation or topic this template addresses..."
                rows={3}
                value={formData.promptContext}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, promptContext: e.target.value }))
                }
              />
              <p className="text-xs text-gray-500">
                This context will help guide the AI mediator.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestedOpening">Suggested Opening (optional)</Label>
              <Textarea
                id="suggestedOpening"
                placeholder="A suggested way to start the conversation..."
                rows={2}
                value={formData.suggestedOpening}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    suggestedOpening: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.promptContext}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTemplate} onOpenChange={() => setDeleteTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTemplate?.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTemplate(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
