'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoginSchema } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastContext';

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const supabase = createBrowserClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    setIsLoading(false);

    if (error) {
      showToast({ message: error.message, variant: 'error' });
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      showToast({ message: error.message, variant: 'error' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card variant="raised" padding="lg" className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-white text-center">Log in to TradingOS</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Log In
          </Button>
        </form>

        <div className="my-6 flex items-center justify-center space-x-2">
          <div className="h-px flex-1 bg-muted"></div>
          <span className="text-sm text-muted">or</span>
          <div className="h-px flex-1 bg-muted"></div>
        </div>

        <Button 
          variant="secondary" 
          className="w-full" 
          onClick={handleGoogleLogin}
          type="button"
        >
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-brand-accent hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
