'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/ui-utils';
import {
  LayoutDashboard,
  CheckSquare,
  FileSignature,
  Target,
  BookOpen,
  Activity,
  Settings,
  LogOut,
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

export function Navigation() {
  const pathname = usePathname();
  const [sessionStatus, setSessionStatus] = React.useState<'green' | 'yellow' | 'red'>('yellow');

  React.useEffect(() => {
    async function loadSessionStatus() {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { toIST, todayIST } = await import('@/lib/utils');
      const today = todayIST();
      
      const { data } = await supabase
        .from('daily_sessions')
        .select('checkin_completed_at')
        .eq('user_id', session.user.id)
        .eq('session_date', today)
        .single();

      if (data?.checkin_completed_at) {
        setSessionStatus('green');
      } else {
        const nowIST = toIST(new Date());
        if (nowIST.getHours() >= 9) {
          setSessionStatus('red');
        } else {
          setSessionStatus('yellow');
        }
      }
    }
    loadSessionStatus();
    // In a real app, you might want to refresh this periodically or on focus
  }, [pathname]);

  const links = [
    { href: '/', label: 'Dash', icon: LayoutDashboard },
    { href: '/checkin', label: 'Check', icon: CheckSquare, hasIndicator: true },
    { href: '/contract', label: 'Sign', icon: FileSignature },
    { href: '/intent', label: 'Intent', icon: Target },
    { href: '/journal', label: 'Journal', icon: BookOpen },
    { href: '/score', label: 'Score', icon: Activity },
  ];

  const handleSignOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex h-full w-64 flex-col bg-surface-raised border-r border-muted">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white tracking-wider">TRADING<span className="text-brand-accent">OS</span></h1>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <ul className="space-y-2">
            {[...links, { href: '/settings', label: 'Settings', icon: Settings }].map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                      isActive ? 'bg-brand-primary/10 text-brand-accent' : 'text-muted hover:bg-surface hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </div>
                    {link.hasIndicator && (
                      <div className={cn(
                        'h-2 w-2 rounded-full',
                        sessionStatus === 'green' ? 'bg-success' : sessionStatus === 'yellow' ? 'bg-yellow-500' : 'bg-danger'
                      )} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="p-4 border-t border-muted">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden flex h-16 w-full items-center justify-around bg-surface-raised border-t border-muted px-2">
        {[...links, { href: '/settings', label: 'Settings', icon: Settings }].map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative flex flex-col items-center p-2 text-[10px] transition-colors',
                isActive ? 'text-brand-accent' : 'text-muted hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="sr-only sm:not-sr-only">{link.label}</span>
              {link.hasIndicator && (
                <div className={cn(
                  'absolute top-1 right-2 h-2 w-2 rounded-full',
                  sessionStatus === 'green' ? 'bg-success' : sessionStatus === 'yellow' ? 'bg-yellow-500' : 'bg-danger'
                )} />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
