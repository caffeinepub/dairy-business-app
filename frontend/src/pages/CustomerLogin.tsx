import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useCustomerLogin } from '../hooks/useCustomerQueries';
import { Loader2, ArrowLeft, User } from 'lucide-react';

export default function CustomerLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useCustomerAuth();
  const customerLogin = useCustomerLogin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Already authenticated — redirect to portal
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/portal' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const token = await customerLogin.mutateAsync({ username, password });
      // Parse customerId from token: "session-{id}"
      const idStr = token.replace('session-', '');
      const customerId = BigInt(idStr);
      login({
        customerId,
        username,
        name: username,
        sessionToken: token,
      });
      navigate({ to: '/portal' });
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-customer-bg to-green-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <img
            src="/assets/generated/ao-farms-logo.dim_400x400.png"
            alt="AO Farms"
            className="h-16 w-16 object-contain mx-auto mb-4 rounded-xl shadow-card"
          />
          <h1 className="text-3xl font-bold text-admin-dark">Customer Portal</h1>
          <p className="text-muted-foreground mt-2">Sign in to place orders and track deliveries</p>
        </div>

        <Card className="shadow-xl border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Customer Sign In
            </CardTitle>
            <CardDescription>Enter your credentials provided by AO Farms admin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Your username"
                  required
                  autoComplete="username"
                  disabled={customerLogin.isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                  disabled={customerLogin.isPending}
                />
              </div>

              {loginError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {loginError}
                </div>
              )}

              <Button
                type="submit"
                disabled={customerLogin.isPending}
                className="w-full bg-primary hover:bg-primary/90 h-11 text-base"
              >
                {customerLogin.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in...</>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Don't have an account? Contact AO Farms admin to get access.
            </p>
          </CardContent>
        </Card>

        <button
          onClick={() => navigate({ to: '/' })}
          className="mt-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login selection
        </button>
      </div>

      <footer className="mt-10 text-sm text-muted-foreground text-center">
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
