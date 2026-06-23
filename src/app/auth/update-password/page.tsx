'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastContext';

const UpdatePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UpdatePasswordFormValues = z.infer<typeof UpdatePasswordSchema>;

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const supabase = createBrowserClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(UpdatePasswordSchema),
  });

  const onSubmit = async (data: UpdatePasswordFormValues) => {
    setIsLoading(true);
    
    // Auth session is already set via the callback route from the reset link
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    setIsLoading(false);

    if (error) {
      showToast({ message: error.message, variant: 'error' });
    } else {
      showToast({ message: 'Password successfully updated!', variant: 'success' });
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card variant="raised" padding="lg" className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-white text-center">Update Password</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
