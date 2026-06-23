import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 text-6xl font-bold text-brand-accent">404</h1>
      <h2 className="mb-4 text-2xl font-semibold text-white">Page Not Found</h2>
      <p className="mb-8 text-muted">The page you are looking for does not exist or has been moved.</p>
      <Link href="/">
        <Button>Go to dashboard</Button>
      </Link>
    </div>
  );
}
