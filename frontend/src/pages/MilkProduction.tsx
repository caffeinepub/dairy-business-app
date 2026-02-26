import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';

export default function MilkProduction() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-dark flex items-center gap-2">
          <Droplets className="h-6 w-6 text-primary" /> Milk Production
        </h1>
        <p className="text-muted-foreground">Milk production tracking</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Feature Not Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Milk production tracking has been removed in the current version of the system.
            Please use the Cattle Management section to view milking capacity per animal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
