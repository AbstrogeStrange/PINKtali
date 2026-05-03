'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginUserDto } from '@streamverse/types';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

type LoginFormValues = z.infer<typeof LoginUserDto>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginUserDto),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    // API Call goes here
    console.log(data);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back to StreamVerse</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
        </div>
        
        <div className="space-y-4 mt-8">
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/api/v1/auth/google'}>
            Continue with Google
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/api/v1/auth/apple'}>
            Continue with Apple
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <Input id="email-address" type="email" autoComplete="email" placeholder="Email address" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <Input id="password" type="password" autoComplete="current-password" placeholder="Password" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80">Forgot your password?</Link>
          </div>
          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'}</Button>
          </div>
        </form>
        <div className="text-center text-sm">
          <Link href="/register" className="font-medium text-primary hover:text-primary/80">
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
