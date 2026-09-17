'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signInAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, LogIn, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [state, formAction, isPending] = useActionState(signInAction, {
    success: false,
  });

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-card border rounded-2xl shadow-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand/10 text-brand mb-4">
          <BookOpen className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to your Polytechnic student account
        </p>
      </div>

      {state.message && !state.success && (
        <div className="mb-6 flex items-center gap-3 p-3.5 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirect" value={redirect} />

        <div className="space-y-1.5">
          <Label htmlFor="email">Institute Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="student@polytechnic.edu"
              required
              className="pl-9"
              autoComplete="email"
            />
          </div>
          {state.errors?.email && (
            <p className="text-xs text-destructive">{state.errors.email[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="pl-9"
              autoComplete="current-password"
            />
          </div>
          {state.errors?.password && (
            <p className="text-xs text-destructive">{state.errors.password[0]}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-medium py-2.5 mt-2"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </>
          )}
        </Button>
      </form>

      {/* Quick Testing Accounts */}
      <div className="mt-4 p-3 rounded-xl bg-muted/50 border text-xs space-y-2">
        <p className="font-semibold text-muted-foreground">Quick Testing Accounts:</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const emailInput = document.getElementById('email') as HTMLInputElement;
              const passInput = document.getElementById('password') as HTMLInputElement;
              if (emailInput) emailInput.value = 'tanvir.student@mpi.edu.bd';
              if (passInput) passInput.value = 'student12345';
            }}
            className="flex-1 py-1 px-2 text-center rounded border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            Fill Demo Student
          </button>
          <button
            type="button"
            onClick={() => {
              const emailInput = document.getElementById('email') as HTMLInputElement;
              const passInput = document.getElementById('password') as HTMLInputElement;
              if (emailInput) emailInput.value = 'admin@mpi.edu.bd';
              if (passInput) passInput.value = 'admin12345';
            }}
            className="flex-1 py-1 px-2 text-center rounded border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            Fill Campus Admin
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground border-t pt-6">
        Don&apos;t have an account yet?{' '}
        <Link
          href="/register"
          className="font-semibold text-brand hover:underline"
        >
          Register as Student
        </Link>
      </div>
    </div>
  );
}
