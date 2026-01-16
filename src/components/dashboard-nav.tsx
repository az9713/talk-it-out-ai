'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, Users, Settings, LogOut, Menu, X, FileText, BarChart3, Bell, History, Target, Smile, ClipboardList, Inbox } from 'lucide-react';
import { useState } from 'react';

interface DashboardNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Heart },
  { href: '/dashboard/sessions', label: 'Sessions', icon: MessageCircle },
  { href: '/dashboard/prepare', label: 'Prepare', icon: ClipboardList },
  { href: '/dashboard/requests', label: 'Requests', icon: Inbox },
  { href: '/dashboard/emotions', label: 'Emotions', icon: Smile },
  { href: '/dashboard/templates', label: 'Templates', icon: FileText },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/goals', label: 'Goals', icon: Target },
  { href: '/dashboard/partners', label: 'Partners', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500" />
          <span className="font-semibold">Talk It Out AI</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-40 p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100',
                  pathname === item.href && 'bg-rose-50 text-rose-700'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col bg-white border-r">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-2 h-16 px-6 border-b">
            <Heart className="h-6 w-6 text-rose-500" />
            <span className="font-semibold">Talk It Out AI</span>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors',
                  pathname === item.href && 'bg-rose-50 text-rose-700 font-medium'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ''} />
                    <AvatarFallback>
                      {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{user.name || 'User'}</span>
                    <span className="text-gray-500 text-xs truncate max-w-[140px]">
                      {user.email}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings/reminders">
                    <Bell className="h-4 w-4 mr-2" />
                    Reminders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile spacer */}
      <div className="lg:hidden h-16" />
    </>
  );
}
