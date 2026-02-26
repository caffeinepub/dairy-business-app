import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useGetAllOrders } from '../hooks/useAdminQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, ShoppingBag, Truck } from 'lucide-react';
import CustomerPlaceOrder from '../components/CustomerPlaceOrder';
import CustomerMyDeliveries from '../components/CustomerMyDeliveries';
import { CattleOrder } from '../backend';

export default function CustomerPortal() {
  const navigate = useNavigate();
  const { session, logout, isAuthenticated } = useCustomerAuth();

  // Fetch all orders and filter by customerId client-side
  const { data: allOrders = [], isLoading: ordersLoading } = useGetAllOrders();

  const myOrders: CattleOrder[] = session
    ? allOrders.filter((o) => o.customerId.toString() === session.customerId.toString())
    : [];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/customer-login' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !session) return null;

  const handleLogout = () => {
    logout();
    navigate({ to: '/customer-login' });
  };

  return (
    <div className="min-h-screen bg-customer-bg">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-4xl">
          <div className="flex items-center gap-3">
            <img src="/assets/generated/dairy-logo.dim_128x128.png" alt="AO Farms" className="h-8 w-8" />
            <div>
              <h1 className="text-base font-bold font-display text-primary">AO Farms</h1>
              <p className="text-xs text-muted-foreground">Welcome, {session.name}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="order">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="order" className="flex-1 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Place Order
            </TabsTrigger>
            <TabsTrigger value="deliveries" className="flex-1 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              My Deliveries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="order">
            <CustomerPlaceOrder customerId={session.customerId} />
          </TabsContent>

          <TabsContent value="deliveries">
            <CustomerMyDeliveries orders={myOrders} isLoading={ordersLoading} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border mt-8">
        <p>
          © {new Date().getFullYear()} AO Farms · Built with{' '}
          <span className="text-red-500">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
