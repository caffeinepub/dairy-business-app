import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function InventoryManagement() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-dark flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" /> Inventory Management
        </h1>
        <p className="text-muted-foreground">Farm inventory tracking</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Feature Not Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Inventory management has been removed in the current version of the system.
            The system now focuses on cattle management, customer accounts, and order tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
