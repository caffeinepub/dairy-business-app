import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useCustomerLogin } from '../hooks/useCustomerQueries';
import CustomerPlaceOrder from '../components/CustomerPlaceOrder';
import CustomerMyDeliveries from '../components/CustomerMyDeliveries';
import { type CattleOrder } from '../backend';
import { Loader2, LogOut, User, ShoppingCart, Package } from 'lucide-react';

export default function CustomerPortal() {
  const { session, isAuthenticated, login, logout } = useCustomerAuth();
  const { actor, isFetching: actorFetching } = useActor();
  const customerLogin = useCustomerLogin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const { data: myOrders = [], isLoading: ordersLoading } = useQuery<CattleOrder[]>({
    queryKey: ['customer', 'my-orders', session?.customerId?.toString()],
    queryFn: async () => {
      if (!actor || !session) return [];
      // Since getMyOrders requires Internet Identity auth, we fetch all orders
      // and filter by customerId from the session
      const all = await actor.getAllOrders().catch(() => []);
      return all.filter(o => o.customerId.toString() === session.customerId.toString());
    },
    enabled: !!actor && !actorFetching && isAuthenticated && !!session,
  });

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
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-customer-bg to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/assets/generated/ao-farms-logo.dim_320x160.png" alt="AO Farms" className="h-16 object-contain mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-admin-dark">Customer Portal</h1>
            <p className="text-muted-foreground mt-2">Sign in to place orders and track deliveries</p>
          </div>

          <Card className="shadow-xl border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Sign In</CardTitle>
              <CardDescription>Enter your credentials provided by AO Farms admin</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Your username"
                    required
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                    autoComplete="current-password"
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customer-bg">
      {/* Customer Header */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/generated/ao-farms-logo.dim_320x160.png" alt="AO Farms" className="h-8 object-contain" />
            <span className="font-semibold text-admin-dark hidden sm:block">Customer Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{session?.name || session?.username}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-admin-dark">Welcome back, {session?.name || session?.username}!</h1>
          <p className="text-muted-foreground">Place orders and track your deliveries.</p>
        </div>

        <Tabs defaultValue="place-order" className="space-y-6">
          <TabsList className="bg-white border border-border shadow-sm h-12 p-1 gap-1">
            <TabsTrigger value="place-order" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingCart className="h-4 w-4" />
              Place Order
            </TabsTrigger>
            <TabsTrigger value="my-deliveries" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="h-4 w-4" />
              My Deliveries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="place-order">
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              {session && <CustomerPlaceOrder customerId={session.customerId} />}
            </div>
          </TabsContent>

          <TabsContent value="my-deliveries">
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <CustomerMyDeliveries orders={myOrders} isLoading={ordersLoading} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} AO Farms. Built with ❤️ using{' '}
          <a href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">caffeine.ai</a>
        </p>
      </footer>
    </div>
  );
}
