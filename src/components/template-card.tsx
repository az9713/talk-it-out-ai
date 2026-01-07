'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Home,
  DollarSign,
  MessageCircle,
  Baby,
  Briefcase,
  Shield,
  Heart,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  promptContext: string;
  suggestedOpening: string | null;
  isSystem: boolean;
  usageCount: number;
}

interface TemplateCardProps {
  template: Template;
  onSelect?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  showActions?: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  household: <Home className="h-4 w-4" />,
  finances: <DollarSign className="h-4 w-4" />,
  communication: <MessageCircle className="h-4 w-4" />,
  parenting: <Baby className="h-4 w-4" />,
  work: <Briefcase className="h-4 w-4" />,
  boundaries: <Shield className="h-4 w-4" />,
  intimacy: <Heart className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  household: 'bg-blue-100 text-blue-800',
  finances: 'bg-green-100 text-green-800',
  communication: 'bg-purple-100 text-purple-800',
  parenting: 'bg-pink-100 text-pink-800',
  work: 'bg-orange-100 text-orange-800',
  boundaries: 'bg-yellow-100 text-yellow-800',
  intimacy: 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-800',
};

export function TemplateCard({
  template,
  onSelect,
  onEdit,
  onDelete,
  showActions = false,
}: TemplateCardProps) {
  const canEdit = !template.isSystem && showActions;

  return (
    <Card
      className={`p-4 hover:shadow-md transition-shadow ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={() => onSelect?.(template)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="secondary"
              className={`${categoryColors[template.category]} flex items-center gap-1`}
            >
              {categoryIcons[template.category]}
              <span className="capitalize">{template.category}</span>
            </Badge>
            {template.isSystem && (
              <Badge variant="outline" className="text-xs">
                System
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 truncate">
            {template.name}
          </h3>
          {template.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {template.description}
            </p>
          )}
          {template.usageCount > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(template);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(template);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </Card>
  );
}

export function TemplateCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-5 w-24 bg-gray-200 rounded" />
        </div>
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-full bg-gray-200 rounded" />
      </div>
    </Card>
  );
}
