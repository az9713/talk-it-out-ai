import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#7c3aed',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#7c3aed',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    fontSize: 10,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    padding: 8,
  },
  message: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 4,
  },
  userMessage: {
    backgroundColor: '#ede9fe',
    marginLeft: 40,
  },
  assistantMessage: {
    backgroundColor: '#f3f4f6',
    marginRight: 40,
  },
  systemMessage: {
    backgroundColor: '#fef3c7',
    fontStyle: 'italic',
  },
  messageRole: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 10,
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 8,
    color: '#9ca3af',
    marginTop: 4,
  },
  perspectiveCard: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#faf5ff',
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
  },
  perspectiveTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#7c3aed',
    marginBottom: 8,
  },
  perspectiveRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  perspectiveLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    width: 80,
  },
  perspectiveValue: {
    fontSize: 10,
    color: '#4b5563',
    flex: 1,
  },
  agreementCard: {
    padding: 12,
    backgroundColor: '#ecfdf5',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    marginBottom: 10,
  },
  agreementContent: {
    fontSize: 11,
    color: '#065f46',
  },
  agreementStatus: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  emptyState: {
    fontSize: 10,
    color: '#9ca3af',
    fontStyle: 'italic',
    padding: 10,
  },
});

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  stage: string;
  createdAt: Date;
}

interface Perspective {
  id: string;
  userId: string;
  observation: string | null;
  feeling: string | null;
  need: string | null;
  request: string | null;
  user: User;
}

interface Agreement {
  id: string;
  content: string;
  agreedByUser1: boolean;
  agreedByUser2: boolean;
  createdAt: Date;
}

interface SessionExportData {
  id: string;
  topic: string;
  stage: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  initiator: User;
  partnership?: {
    user1: User;
    user2: User | null;
  } | null;
  messages: Message[];
  perspectives: Perspective[];
  agreements: Agreement[];
}

interface SessionPDFProps {
  session: SessionExportData;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatStage(stage: string): string {
  return stage
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getUserName(user: User | null | undefined): string {
  if (!user) return 'Unknown';
  return user.name || user.email.split('@')[0];
}

export function SessionPDF({ session }: SessionPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Session Summary</Text>
          <Text style={styles.subtitle}>{session.topic}</Text>
          <View style={styles.metadata}>
            <Text>Started: {formatDate(session.createdAt)}</Text>
            <Text>Status: {session.status.charAt(0).toUpperCase() + session.status.slice(1)}</Text>
            <Text>Stage: {formatStage(session.stage)}</Text>
          </View>
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <Text>Initiated by: {getUserName(session.initiator)}</Text>
          {session.partnership?.user2 && (
            <Text>Partner: {getUserName(session.partnership.user2)}</Text>
          )}
        </View>

        {/* NVC Perspectives */}
        {session.perspectives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NVC Perspectives</Text>
            {session.perspectives.map((perspective) => (
              <View key={perspective.id} style={styles.perspectiveCard}>
                <Text style={styles.perspectiveTitle}>
                  {getUserName(perspective.user)}&apos;s Perspective
                </Text>
                {perspective.observation && (
                  <View style={styles.perspectiveRow}>
                    <Text style={styles.perspectiveLabel}>Observation:</Text>
                    <Text style={styles.perspectiveValue}>{perspective.observation}</Text>
                  </View>
                )}
                {perspective.feeling && (
                  <View style={styles.perspectiveRow}>
                    <Text style={styles.perspectiveLabel}>Feeling:</Text>
                    <Text style={styles.perspectiveValue}>{perspective.feeling}</Text>
                  </View>
                )}
                {perspective.need && (
                  <View style={styles.perspectiveRow}>
                    <Text style={styles.perspectiveLabel}>Need:</Text>
                    <Text style={styles.perspectiveValue}>{perspective.need}</Text>
                  </View>
                )}
                {perspective.request && (
                  <View style={styles.perspectiveRow}>
                    <Text style={styles.perspectiveLabel}>Request:</Text>
                    <Text style={styles.perspectiveValue}>{perspective.request}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Agreements */}
        {session.agreements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agreements Reached</Text>
            {session.agreements.map((agreement) => (
              <View key={agreement.id} style={styles.agreementCard}>
                <Text style={styles.agreementContent}>{agreement.content}</Text>
                <Text style={styles.agreementStatus}>
                  Agreed: {agreement.agreedByUser1 ? 'User 1' : ''}
                  {agreement.agreedByUser1 && agreement.agreedByUser2 ? ' & ' : ''}
                  {agreement.agreedByUser2 ? 'User 2' : ''}
                  {!agreement.agreedByUser1 && !agreement.agreedByUser2 ? 'Pending' : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Talk It Out AI on {formatDate(new Date())}
        </Text>
      </Page>

      {/* Conversation Transcript Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversation Transcript</Text>
          {session.messages.length === 0 ? (
            <Text style={styles.emptyState}>No messages in this session.</Text>
          ) : (
            session.messages.map((message) => {
              const roleStyle = message.role === 'user'
                ? styles.userMessage
                : message.role === 'assistant'
                  ? styles.assistantMessage
                  : styles.systemMessage;

              return (
              <View
                key={message.id}
                style={{ ...styles.message, ...roleStyle }}
              >
                <Text style={styles.messageRole}>
                  {message.role === 'user' ? 'You' : message.role === 'assistant' ? 'AI Mediator' : 'System'}
                </Text>
                <Text style={styles.messageContent}>{message.content}</Text>
                <Text style={styles.messageTime}>{formatDateTime(message.createdAt)}</Text>
              </View>
            );})
          )}
        </View>

        <Text style={styles.footer}>
          Generated by Talk It Out AI on {formatDate(new Date())}
        </Text>
      </Page>
    </Document>
  );
}
