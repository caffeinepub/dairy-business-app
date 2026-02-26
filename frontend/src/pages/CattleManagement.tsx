import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin, useGetAllCattle } from '../hooks/useAdminQueries';
import { CattleAvailability, HealthStatus } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Beef, CheckCircle, XCircle } from 'lucide-react';
import AdminCattleManagement from '../components/AdminCattleManagement';

export default function CattleManagement() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: cattle = [], isLoading: cattleLoading } = useGetAllCattle();

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

  const totalCattle = cattle.length;
  const availableCattle = cattle.filter((c) => c.availability === CattleAvailability.Available).length;
  const soldCattle = cattle.filter((c) => c.availability === CattleAvailability.Sold).length;
  const healthyCattle = cattle.filter((c) => c.healthStatus === HealthStatus.Healthy).length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-foreground">Cattle Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your cattle inventory and health records</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Cattle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cattleLoading ? '...' : totalCattle}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{cattleLoading ? '...' : availableCattle}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{cattleLoading ? '...' : soldCattle}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Healthy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{cattleLoading ? '...' : healthyCattle}</div>
          </CardContent>
        </Card>
      </div>

      <AdminCattleManagement />
    </div>
  );
}
