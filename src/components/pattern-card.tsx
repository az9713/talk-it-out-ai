'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Check,
  Eye,
  Lightbulb,
} from 'lucide-react';

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
  detectedAt: Date | string;
}

interface PatternCardProps {
  pattern: ConflictPattern;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
}

const TYPE_ICONS: Record<string, typeof AlertTriangle> = {
  recurring_topic: MessageSquare,
  trigger: AlertTriangle,
  timing: Clock,
  communication_style: MessageSquare,
  escalation_pattern: ArrowUpRight,
  resolution_pattern: ArrowDownRight,
  positive_pattern: Star,
};

const TYPE_COLORS: Record<string, string> = {
  recurring_topic: 'bg-blue-100 text-blue-800',
  trigger: 'bg-red-100 text-red-800',
  timing: 'bg-purple-100 text-purple-800',
  communication_style: 'bg-orange-100 text-orange-800',
  escalation_pattern: 'bg-red-100 text-red-800',
  resolution_pattern: 'bg-green-100 text-green-800',
  positive_pattern: 'bg-emerald-100 text-emerald-800',
};

const TYPE_LABELS: Record<string, string> = {
  recurring_topic: 'Recurring Topic',
  trigger: 'Trigger',
  timing: 'Timing Pattern',
  communication_style: 'Communication Style',
  escalation_pattern: 'Escalation Pattern',
  resolution_pattern: 'Resolution Pattern',
  positive_pattern: 'Positive Pattern',
};

const SEVERITY_COLORS = ['', 'bg-gray-200', 'bg-yellow-200', 'bg-orange-200', 'bg-red-200', 'bg-red-400'];

export function PatternCard({ pattern, onAcknowledge, onResolve }: PatternCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = TYPE_ICONS[pattern.type] || AlertTriangle;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className={`cursor-pointer hover:shadow-md transition-shadow ${pattern.isResolved ? 'opacity-60' : ''}`}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${TYPE_COLORS[pattern.type] || 'bg-gray-100'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base">{pattern.title}</CardTitle>
                  <Badge variant="outline" className="text-xs mt-1">
                    {TYPE_LABELS[pattern.type] || pattern.type}
                  </Badge>
                </div>
              </div>
              {pattern.severity && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-2 h-4 rounded-sm ${
                        level <= pattern.severity! ? SEVERITY_COLORS[pattern.severity!] : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">{pattern.description}</p>
            <div className="flex items-center gap-2 mt-3">
              {pattern.frequency && (
                <Badge variant="secondary" className="text-xs">
                  {pattern.frequency}
                </Badge>
              )}
              {pattern.isAcknowledged && !pattern.isResolved && (
                <Badge variant="outline" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Acknowledged
                </Badge>
              )}
              {pattern.isResolved && (
                <Badge className="text-xs bg-green-100 text-green-800">
                  <Check className="w-3 h-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${TYPE_COLORS[pattern.type] || 'bg-gray-100'}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>{pattern.title}</DialogTitle>
              <DialogDescription>
                {TYPE_LABELS[pattern.type] || pattern.type}
                {pattern.frequency && ` • ${pattern.frequency}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{pattern.description}</p>
          </div>

          {pattern.exampleQuotes && pattern.exampleQuotes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Examples</h4>
              <div className="space-y-2">
                {pattern.exampleQuotes.map((quote, i) => (
                  <div key={i} className="text-sm text-muted-foreground italic bg-muted p-2 rounded">
                    "{quote}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {pattern.suggestions && pattern.suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Suggestions
              </h4>
              <ul className="space-y-2">
                {pattern.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pattern.confidence && (
            <div className="text-xs text-muted-foreground">
              Confidence: {Math.round(pattern.confidence * 100)}%
            </div>
          )}

          {!pattern.isResolved && (
            <div className="flex gap-2 pt-4 border-t">
              {!pattern.isAcknowledged && onAcknowledge && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onAcknowledge(pattern.id);
                    setIsOpen(false);
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Acknowledge
                </Button>
              )}
              {onResolve && (
                <Button
                  size="sm"
                  onClick={() => {
                    onResolve(pattern.id);
                    setIsOpen(false);
                  }}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark Resolved
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Compact version for dashboard preview
export function PatternCardCompact({ pattern }: { pattern: ConflictPattern }) {
  const Icon = TYPE_ICONS[pattern.type] || AlertTriangle;

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <div className={`p-1.5 rounded ${TYPE_COLORS[pattern.type] || 'bg-gray-100'}`}>
        <Icon className="w-3 h-3" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{pattern.title}</p>
        <p className="text-xs text-muted-foreground">{TYPE_LABELS[pattern.type]}</p>
      </div>
      {pattern.severity && pattern.severity >= 4 && (
        <Badge variant="destructive" className="text-xs">High</Badge>
      )}
    </div>
  );
}
