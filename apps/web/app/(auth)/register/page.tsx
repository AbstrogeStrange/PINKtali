'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const StrictRegisterDto = z.object({
  email: z.string().email(),
  password: z.string().regex(/(?=.*[A-Z])(?=.*[0-9]).{8,}/, 'Min 8 chars, 1 uppercase, 1 number'),
  displayName: z.string().min(2),
});

type RegisterFormValues = z.infer<typeof StrictRegisterDto>;

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, trigger, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(StrictRegisterDto),
    mode: 'onTouched',
  });

  const onNextStep = async () => {
    const isValid = await trigger(['email', 'password']);
    if (isValid) setStep(2);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    console.log('Registering:', data);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Join StreamVerse</h2>
          <p className="mt-2 text-sm text-muted-foreground">Step {step} of 2</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <Input id="email-address" type="email" autoComplete="email" placeholder="Email address" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <Input id="password" type="password" placeholder="Password" {...register('password')} />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>
              <Button type="button" className="w-full" onClick={onNextStep}>Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <label htmlFor="displayName" className="sr-only">Display Name</label>
                <Input id="displayName" type="text" placeholder="Display Name" {...register('displayName')} />
                {errors.displayName && <p className="text-xs text-destructive mt-1">{errors.displayName.message}</p>}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>{isLoading ? 'Creating Account...' : 'Sign up'}</Button>
              </div>
            </div>
          )}
        </form>
        <div className="text-center text-sm">
          <Link href="/login" className="font-medium text-primary hover:text-primary/80">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
