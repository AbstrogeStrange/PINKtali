'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const ForgotSchema = z.object({
  email: z.string().email(),
});

export default function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    resolver: zodResolver(ForgotSchema)
  });

  const onSubmit = (data: { email: string }) => {
    console.log(data);
    setIsSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Reset Password</h2>
          <p className="mt-2 text-sm text-muted-foreground">We'll send you a link to reset your password</p>
        </div>
        
        {isSent ? (
          <div className="bg-primary/10 text-primary p-4 rounded-lg text-sm text-center">
            If an account exists, an email was sent.
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input type="email" placeholder="Email address" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full">Send Link</Button>
          </form>
        )}
        
        <div className="text-center text-sm">
          <Link href="/login" className="font-medium text-primary hover:text-primary/80">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
