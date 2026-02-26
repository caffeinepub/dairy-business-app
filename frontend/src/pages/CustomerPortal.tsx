import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import CustomerPlaceOrder from '../components/CustomerPlaceOrder';
import CustomerMyDeliveries from '../components/CustomerMyDeliveries';
import { type CattleOrder } from '../backend';
import { Loader2, LogOut, User, ShoppingCart, Package } from 'lucide-react';

export default function CustomerPortal() {
  const navigate = useNavigate();
  const { session, isAuthenticated, logout } = useCustomerAuth();
  const { actor, isFetching: actorFetching } = useActor();

  const { data: myOrders = [], isLoading: ordersLoading } = useQuery<CattleOrder[]>({
    queryKey: ['customer', 'my-orders', session?.customerId?.toString()],
    queryFn: async () => {
      if (!actor || !session) return [];
      const all = await actor.getAllOrders().catch(() => []);
      return all.filter(o => o.customerId.toString() === session.customerId.toString());
    },
    enabled: !!actor && !actorFetching && isAuthenticated && !!session,
  });

  // Not authenticated — redirect to customer login
  if (!isAuthenticated) {
    navigate({ to: '/customer-login' });
    return null;
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { logout(); navigate({ to: '/customer-login' }); }}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
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
              <span className="hidden sm:inline">Place Order</span>
            </TabsTrigger>
            <TabsTrigger value="my-deliveries" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">My Deliveries</span>
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
