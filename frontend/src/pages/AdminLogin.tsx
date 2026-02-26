import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldCheck, LogIn, AlertCircle, CheckCircle2, Users } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'slots-full' | 'anonymous' | 'generic' | null>(null);

  // Track the principal we last attempted adminLogin for, to avoid duplicate calls
  const lastAttemptedPrincipal = useRef<string | null>(null);

  // Once authenticated and actor is ready (with the authenticated identity), call adminLogin()
  useEffect(() => {
    if (!isAuthenticated || actorFetching || !actor) return;

    const currentPrincipal = identity?.getPrincipal().toString() ?? null;
    if (!currentPrincipal) return;

    // Avoid calling adminLogin() multiple times for the same principal session
    if (lastAttemptedPrincipal.current === currentPrincipal) return;
    lastAttemptedPrincipal.current = currentPrincipal;

    let cancelled = false;
    setIsChecking(true);
    setError(null);
    setErrorType(null);

    // adminLogin() returns void on success, traps (throws) on unauthorized
    actor.adminLogin('', '')
      .then(() => {
        if (cancelled) return;
        setIsChecking(false);
        // Success — invalidate role queries and navigate to dashboard
        queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
        queryClient.invalidateQueries({ queryKey: ['callerRole'] });
        navigate({ to: '/dashboard' });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setIsChecking(false);
        const raw = err instanceof Error ? err.message : String(err);
        const lower = raw.toLowerCase();

        // Check for "both admin slots are full" error first
        if (
          lower.includes('slots are full') ||
          lower.includes('admin slots') ||
          lower.includes('already registered') ||
          (lower.includes('2') && lower.includes('admin'))
        ) {
          setErrorType('slots-full');
          setError(
            'Both admin accounts are already registered. Please use one of the registered Internet Identity accounts.'
          );
        } else if (lower.includes('anonymous')) {
          setErrorType('anonymous');
          setError('Anonymous login is not allowed. Please authenticate with Internet Identity.');
        } else if (
          lower.includes('unauthorized') ||
          lower.includes('access denied') ||
          lower.includes('admin')
        ) {
          setErrorType('slots-full');
          setError(
            'Both admin accounts are already registered. Please use one of the registered Internet Identity accounts.'
          );
        } else {
          setErrorType('generic');
          setError('Login failed. Please try again.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, actorFetching, actor, identity, navigate, queryClient]);

  const handleLogin = async () => {
    setError(null);
    setErrorType(null);
    // Reset the attempted principal so a fresh login attempt is made
    lastAttemptedPrincipal.current = null;
    try {
      await login();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    lastAttemptedPrincipal.current = null;
    setError(null);
    setErrorType(null);
    await clear();
    queryClient.clear();
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-admin-bg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-admin-bg px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <img src="/assets/generated/ao-farms-logo.dim_320x160.png" alt="AO Farms" className="h-16 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-primary font-display">AO Farms</h1>
        <p className="text-muted-foreground text-sm mt-1">Dairy Business Management</p>
      </div>

      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">Admin Login</CardTitle>
          <CardDescription>
            Sign in with your Internet Identity to access the admin dashboard.
            Up to 2 admin accounts are supported — the first two logins are auto-registered.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isAuthenticated ? (
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login with Internet Identity
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3 text-sm text-center">
                <p className="text-muted-foreground text-xs">Logged in as:</p>
                <p className="font-mono text-xs mt-1 truncate text-foreground">
                  {identity?.getPrincipal().toString()}
                </p>
              </div>

              {(isChecking || actorFetching) ? (
                <div className="flex items-center justify-center py-4 gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {actorFetching ? 'Initializing...' : 'Verifying admin access...'}
                  </span>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  {errorType === 'slots-full' ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {error}
                    {errorType === 'slots-full' && (
                      <p className="mt-2 text-xs opacity-80">
                        Sign out and try again with one of the two registered admin accounts.
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="flex items-center justify-center py-2 gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Access granted, redirecting...</span>
                </div>
              )}

              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full"
                disabled={isChecking || actorFetching}
              >
                Sign Out & Try Different Account
              </Button>
            </div>
          )}

          <div className="text-center">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
