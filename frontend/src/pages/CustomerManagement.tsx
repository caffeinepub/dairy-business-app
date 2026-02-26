import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin, useGetAllCustomers } from '../hooks/useAdminQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, UserCheck, UserX } from 'lucide-react';
import AdminCustomerManagement from '../components/AdminCustomerManagement';

export default function CustomerManagement() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: customers = [], isLoading: customersLoading } = useGetAllCustomers();

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

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.isActive).length;
  const inactiveCustomers = customers.filter((c) => !c.isActive).length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-foreground">Customer Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage customer accounts and access</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersLoading ? '...' : totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{customersLoading ? '...' : activeCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{customersLoading ? '...' : inactiveCustomers}</div>
          </CardContent>
        </Card>
      </div>

      <AdminCustomerManagement />
    </div>
  );
}
