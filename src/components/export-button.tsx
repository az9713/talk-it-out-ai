'use client';

import { useState } from 'react';
import { Download, FileText, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportButtonProps {
  sessionId: string;
}

export function ExportButton({ sessionId }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState<'pdf' | 'markdown' | null>(null);

  const handleExport = async (format: 'pdf' | 'markdown') => {
    setIsExporting(format);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/export?format=${format}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = format === 'pdf' ? 'session-export.pdf' : 'session-export.md';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export session. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting !== null}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="ml-2">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExporting !== null}
        >
          <File className="h-4 w-4 mr-2" />
          Export as PDF
          {isExporting === 'pdf' && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('markdown')}
          disabled={isExporting !== null}
        >
          <FileText className="h-4 w-4 mr-2" />
          Export as Markdown
          {isExporting === 'markdown' && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
