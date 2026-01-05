import { auth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { getSessionCounts } from '@/services/session';
import { getPartnershipCount } from '@/services/partnership';

export default async function DashboardPage() {
  const session = await auth();

  // Get real counts from database
  const sessionCounts = session?.user?.id
    ? await getSessionCounts(session.user.id)
    : { active: 0, completed: 0, paused: 0, total: 0 };

  const partnerCount = session?.user?.id
    ? await getPartnershipCount(session.user.id)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name || 'friend'}</h1>
        <p className="text-gray-600 mt-2">
          Ready to improve your communication? Start a new session or continue where you left off.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <MessageCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionCounts.active}</div>
            <p className="text-xs text-gray-500">Ongoing conversations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <Heart className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionCounts.completed}</div>
            <p className="text-xs text-gray-500">Resolved conflicts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Partners</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partnerCount}</div>
            <p className="text-xs text-gray-500">Connected partners</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Start a New Session</CardTitle>
            <CardDescription>
              Begin a guided conversation to work through a conflict using NVC techniques.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/sessions/new">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invite a Partner</CardTitle>
            <CardDescription>
              Connect with your partner or teammate to start resolving conflicts together.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/partners">
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Manage Partners
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
