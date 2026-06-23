import * as React from 'react';
import { Navigation } from './Navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full flex-col md:flex-row bg-surface text-white overflow-hidden">
      <div className="hidden md:block shrink-0 h-full">
        <Navigation />
      </div>
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
        <div className="mx-auto max-w-5xl h-full">
          {children}
        </div>
      </main>
      <div className="block md:hidden fixed bottom-0 left-0 right-0 z-50">
        <Navigation />
      </div>
    </div>
  );
}
