import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useAdminQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, LayoutDashboard, Beef, Users, Truck, BarChart3 } from 'lucide-react';
import AdminCattleManagement from '../components/AdminCattleManagement';
import AdminCustomerManagement from '../components/AdminCustomerManagement';
import AdminOrdersDeliveries from '../components/AdminOrdersDeliveries';

export default function AdminPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clear, identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();

  useEffect(() => {
    if (!adminCheckLoading && isAdmin === false) {
      navigate({ to: '/admin-login' });
    }
  }, [isAdmin, adminCheckLoading, navigate]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/admin-login' });
  };

  if (adminCheckLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your dairy business operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="cattle">
        <TabsList className="mb-6 flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="cattle" className="flex items-center gap-2">
            <Beef className="h-4 w-4" />
            Cattle
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Orders & Deliveries
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cattle">
          <AdminCattleManagement />
        </TabsContent>

        <TabsContent value="customers">
          <AdminCustomerManagement />
        </TabsContent>

        <TabsContent value="orders">
          <AdminOrdersDeliveries />
        </TabsContent>

        <TabsContent value="reports">
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>View detailed reports in the Monthly Reports page</p>
            <Button
              variant="link"
              onClick={() => navigate({ to: '/reports' })}
              className="mt-2"
            >
              Go to Monthly Reports →
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
