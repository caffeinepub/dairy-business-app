import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCustomerLogin } from '../hooks/useCustomerQueries';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Lock, Milk } from 'lucide-react';

export default function CustomerLogin() {
  const navigate = useNavigate();
  const { login } = useCustomerAuth();
  const loginMutation = useCustomerLogin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const sessionToken = await loginMutation.mutateAsync({ username, password });
      // Extract customer ID from session token: "session-{id}"
      const parts = sessionToken.split('-');
      const customerId = BigInt(parts[parts.length - 1]);

      login({
        customerId,
        username,
        name: username, // Will be updated when we fetch profile
        sessionToken,
      });

      navigate({ to: '/portal' });
    } catch (err: any) {
      setError(err?.message ?? 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-customer-bg px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <img src="/assets/generated/ao-farms-logo.dim_320x160.png" alt="AO Farms" className="h-16 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-primary font-display">AO Farms</h1>
        <p className="text-muted-foreground text-sm mt-1">Customer Portal</p>
      </div>

      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-farm-green/10">
            <Milk className="h-7 w-7 text-farm-green" />
          </div>
          <CardTitle className="text-2xl font-display">Customer Login</CardTitle>
          <CardDescription>
            Sign in to place orders and track your deliveries
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-farm-green hover:bg-farm-green/90 text-white"
              size="lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
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
