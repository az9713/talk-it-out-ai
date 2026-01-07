import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSessionForExport } from '@/services/session';
import { generateSessionMarkdown } from '@/lib/export/markdown-template';
import { renderToBuffer } from '@react-pdf/renderer';
import { SessionPDF } from '@/lib/export/pdf-template';
import React from 'react';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'markdown';

    // Fetch session data
    const sessionData = await getSessionForExport(id);
    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify user has access to this session
    if (sessionData.initiatorId !== session.user.id) {
      // Check if user is part of the partnership
      const isPartner =
        sessionData.partnership?.user1Id === session.user.id ||
        sessionData.partnership?.user2Id === session.user.id;

      if (!isPartner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Format the session data for export
    const exportData = {
      id: sessionData.id,
      topic: sessionData.topic,
      stage: sessionData.stage,
      status: sessionData.status,
      createdAt: sessionData.createdAt,
      updatedAt: sessionData.updatedAt,
      initiator: sessionData.initiator,
      partnership: sessionData.partnership,
      messages: sessionData.messages || [],
      perspectives: sessionData.perspectives || [],
      agreements: sessionData.agreements || [],
    };

    if (format === 'pdf') {
      // Generate PDF
      const pdfBuffer = await renderToBuffer(
        // @ts-expect-error - SessionPDF returns Document which is compatible
        React.createElement(SessionPDF, { session: exportData })
      );

      const filename = `session-${sessionData.topic.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}-${id.slice(0, 8)}.pdf`;

      // Convert Buffer to Uint8Array for NextResponse
      const uint8Array = new Uint8Array(pdfBuffer);

      return new NextResponse(uint8Array, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      // Generate Markdown
      const markdown = generateSessionMarkdown(exportData);
      const filename = `session-${sessionData.topic.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}-${id.slice(0, 8)}.md`;

      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    console.error('Export session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
