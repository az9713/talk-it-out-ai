'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  SessionRequestDialog,
  SessionRequestCard,
  SessionRequestData,
} from '@/components/session-request';
import { MessageCircle, Inbox, Send } from 'lucide-react';

interface SessionRequest {
  id: string;
  fromUser?: { name: string | null; email: string };
  toUser?: { name: string | null; email: string };
  topic: string | null;
  urgency: 'whenever' | 'soon' | 'important';
  message: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'rescheduled' | 'expired';
  createdAt: string;
  scheduledFor: string | null;
}

interface Partner {
  id: string;
  name: string | null;
  email: string;
  partnershipId: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<{
    received: SessionRequest[];
    sent: SessionRequest[];
  }>({ received: [], sent: [] });
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [requestsRes, partnersRes] = await Promise.all([
        fetch('/api/session-requests'),
        fetch('/api/partnerships'),
      ]);

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRequests(data);
      }

      if (partnersRes.ok) {
        const data = await partnersRes.json();
        // Transform partnerships to partners format
        const transformedPartners = data.map((p: { partner: { id: string; name: string | null; email: string }; id: string }) => ({
          id: p.partner.id,
          name: p.partner.name,
          email: p.partner.email,
          partnershipId: p.id,
        }));
        setPartners(transformedPartners);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async (data: SessionRequestData) => {
    try {
      const res = await fetch('/api/session-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const res = await fetch(`/api/session-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          scheduledFor: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      const res = await fetch(`/api/session-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/session-requests/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error canceling request:', error);
    }
  };

  const pendingReceivedCount = requests.received.filter((r) => r.status === 'pending').length;
  const pendingSentCount = requests.sent.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Session Requests</h1>
          <p className="text-muted-foreground mt-1">
            Request conversations with your partners or respond to their requests
          </p>
        </div>
        {partners.length > 0 && (
          <SessionRequestDialog partners={partners} onSubmit={handleCreateRequest} />
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : partners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No partners yet</h3>
            <p className="text-muted-foreground mb-4">
              Connect with a partner to start requesting conversations
            </p>
            <Button asChild>
              <a href="/dashboard/partners">Add a Partner</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="received" className="w-full">
          <TabsList>
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Received
              {pendingReceivedCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {pendingReceivedCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Sent
              {pendingSentCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs text-white">
                  {pendingSentCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="mt-6">
            {requests.received.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No requests received yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requests.received.map((request) => (
                  <SessionRequestCard
                    key={request.id}
                    request={{
                      ...request,
                      createdAt: new Date(request.createdAt),
                      scheduledFor: request.scheduledFor
                        ? new Date(request.scheduledFor)
                        : null,
                    }}
                    isReceived={true}
                    onAccept={() => handleAccept(request.id)}
                    onDecline={() => handleDecline(request.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            {requests.sent.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No requests sent yet</p>
                  <SessionRequestDialog
                    partners={partners}
                    onSubmit={handleCreateRequest}
                    trigger={
                      <Button variant="link" className="mt-2">
                        Send your first request
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requests.sent.map((request) => (
                  <SessionRequestCard
                    key={request.id}
                    request={{
                      ...request,
                      createdAt: new Date(request.createdAt),
                      scheduledFor: request.scheduledFor
                        ? new Date(request.scheduledFor)
                        : null,
                    }}
                    isReceived={false}
                    onCancel={() => handleCancel(request.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
