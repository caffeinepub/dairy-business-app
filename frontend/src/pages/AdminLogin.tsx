import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Loader2, LogOut, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const qc = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  // Redirect to admin panel once verified
  React.useEffect(() => {
    if (isAuthenticated && isAdmin === true) {
      navigate({ to: '/admin' });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (e: any) {
      if (e?.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  const isLoggingIn = loginStatus === 'logging-in';
  const isChecking = isAuthenticated && (actorFetching || adminLoading);

  // Checking admin status after login
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-admin-bg to-admin-bg/80 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Access denied — authenticated but not admin
  if (isAuthenticated && isAdmin === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-admin-bg to-admin-bg/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-8 pb-8 px-8 flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-destructive">Access Denied</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Your account does not have admin privileges. Please contact the system administrator.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={handleLogout} className="flex-1 gap-2">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
              <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="flex-1 gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated — show login
  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-bg to-admin-bg/80 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardContent className="pt-8 pb-8 px-8 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <img
              src="/assets/generated/ao-farms-logo.dim_400x400.png"
              alt="AO Farms"
              className="h-16 w-16 object-contain rounded-xl"
            />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-admin-dark">Admin Login</h1>
              <p className="text-muted-foreground text-sm mt-1">AO Farms Management System</p>
            </div>
          </div>

          <div className="w-full space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              Sign in with your admin credentials to access the management panel.
            </p>
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base"
            >
              {isLoggingIn ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in...</>
              ) : (
                <><ShieldCheck className="h-4 w-4 mr-2" /> Sign In as Admin</>
              )}
            </Button>
          </div>

          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login selection
          </button>
        </CardContent>
      </Card>

      <footer className="mt-8 text-sm text-muted-foreground text-center">
        © {new Date().getFullYear()} AO Farms. Built with ❤️ using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
