import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin } from '../hooks/useAdminQueries';
import { Loader2 } from 'lucide-react';
import AdminOrdersDeliveries from '../components/AdminOrdersDeliveries';

export default function DeliveryReports() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();

  useEffect(() => {
    if (!adminCheckLoading && isAdmin === false) {
      navigate({ to: '/admin-login' });
    }
  }, [isAdmin, adminCheckLoading, navigate]);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-foreground">Orders & Deliveries</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and manage all cattle orders and deliveries</p>
      </div>
      <AdminOrdersDeliveries />
    </div>
  );
}
