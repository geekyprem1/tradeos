'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastContext';

const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordPage() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  
  const supabase = createBrowserClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    setIsLoading(false);

    if (error) {
      showToast({ message: error.message, variant: 'error' });
    } else {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card variant="raised" padding="lg" className="w-full max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-success">Check your email</h1>
          <p className="mb-6 text-muted">
            We&apos;ve sent a password reset link to your email address. Please check your inbox.
          </p>
          <Link href="/auth/login">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card variant="raised" padding="lg" className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-white text-center">Reset Password</h1>
        
        <p className="mb-6 text-sm text-muted text-center">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Send Reset Link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-brand-accent hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
