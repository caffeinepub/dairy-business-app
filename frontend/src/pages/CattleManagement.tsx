import React, { useState } from 'react';
import { toast } from 'sonner';
import { PlusCircle, Edit2, Beef } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CattleForm from '../components/CattleForm';
import { useGetAllCattle, useAddCattle, useUpdateCattle } from '../hooks/useQueries';
import type { Cattle, HealthStatus } from '../backend';
import { CattleStatus } from '../backend';

function healthLabel(h: HealthStatus): string {
  if (h.__kind__ === 'sick') return `Sick (${h.sick.condition})`;
  if (h.__kind__ === 'recovered') return 'Recovered';
  return 'Healthy';
}

function healthVariant(h: HealthStatus): 'default' | 'destructive' | 'secondary' | 'outline' {
  if (h.__kind__ === 'sick') return 'destructive';
  if (h.__kind__ === 'recovered') return 'secondary';
  return 'default';
}

export default function CattleManagement() {
  const { data: cattleList = [], isLoading } = useGetAllCattle();
  const addCattle = useAddCattle();
  const updateCattle = useUpdateCattle();

  const [addOpen, setAddOpen] = useState(false);
  const [editCattle, setEditCattle] = useState<Cattle | null>(null);

  const activeCattle = cattleList.filter((c) => c.status === CattleStatus.active);
  const sickCattle = cattleList.filter((c) => c.healthStatus.__kind__ === 'sick');
  const avgMilk =
    cattleList.length > 0
      ? cattleList.reduce((sum, c) => sum + c.dailyMilkProductionLiters, 0) / cattleList.length
      : 0;

  const handleAdd = async (data: {
    breed: string;
    ageMonths: bigint;
    dailyMilkProductionLiters: number;
    healthStatus: HealthStatus;
    purchaseDate: bigint;
    purchaseCost: number;
    notes: string;
    status: CattleStatus;
  }) => {
    try {
      const result = await addCattle.mutateAsync(data);
      if (result === null) {
        toast.error('A cattle record with this breed already exists.');
      } else {
        toast.success('Cattle added successfully!');
        setAddOpen(false);
      }
    } catch (err) {
      toast.error('Failed to add cattle. Please try again.');
    }
  };

  const handleEdit = async (data: {
    breed: string;
    ageMonths: bigint;
    dailyMilkProductionLiters: number;
    healthStatus: HealthStatus;
    purchaseDate: bigint;
    purchaseCost: number;
    notes: string;
    status: CattleStatus;
  }) => {
    if (!editCattle) return;
    try {
      await updateCattle.mutateAsync({ id: editCattle.id, ...data });
      toast.success('Cattle updated successfully!');
      setEditCattle(null);
    } catch (err) {
      toast.error('Failed to update cattle. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Cattle Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your herd, health records, and milk production data.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Cattle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Cattle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cattleList.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{activeCattle.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
              Sick
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{sickCattle.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
              Avg Daily Milk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgMilk.toFixed(1)} L</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Loading cattle records...
            </div>
          ) : cattleList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Beef className="h-10 w-10 opacity-30" />
              <p>No cattle records yet. Add your first cattle!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Breed</TableHead>
                    <TableHead>Age (mo)</TableHead>
                    <TableHead>Daily Milk (L)</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchase Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cattleList.map((cattle) => (
                    <TableRow key={cattle.id.toString()}>
                      <TableCell className="font-mono text-xs">
                        #{cattle.id.toString()}
                      </TableCell>
                      <TableCell className="font-medium">{cattle.breed}</TableCell>
                      <TableCell>{cattle.ageMonths.toString()}</TableCell>
                      <TableCell>{cattle.dailyMilkProductionLiters.toFixed(1)}</TableCell>
                      <TableCell>
                        <Badge variant={healthVariant(cattle.healthStatus)}>
                          {healthLabel(cattle.healthStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            cattle.status === CattleStatus.active ? 'default' : 'outline'
                          }
                        >
                          {cattle.status === CattleStatus.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{cattle.purchaseCost.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditCattle(cattle)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Cattle</DialogTitle>
            <DialogDescription>
              Enter the details for the new cattle record.
            </DialogDescription>
          </DialogHeader>
          <CattleForm onSubmit={handleAdd} isLoading={addCattle.isPending} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCattle} onOpenChange={(open) => !open && setEditCattle(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Cattle</DialogTitle>
            <DialogDescription>
              Update the details for this cattle record.
            </DialogDescription>
          </DialogHeader>
          {editCattle && (
            <CattleForm
              initialData={editCattle}
              onSubmit={handleEdit}
              isLoading={updateCattle.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
