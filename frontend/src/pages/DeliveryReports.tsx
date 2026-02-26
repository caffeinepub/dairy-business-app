import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import AdminOrdersDeliveries from '../components/AdminOrdersDeliveries';

export default function DeliveryReports() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-dark flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" /> Delivery Reports
        </h1>
        <p className="text-muted-foreground">Track and manage all cattle orders and deliveries</p>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <AdminOrdersDeliveries />
      </div>
    </div>
  );
}
