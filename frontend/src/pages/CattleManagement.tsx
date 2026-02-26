import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Beef, Heart, AlertTriangle, Tag } from 'lucide-react';
import { useGetAllCattle, useAddCattle, useUpdateCattle, useDeleteCattle } from '../hooks/useAdminQueries';
import { CattleAvailability, HealthStatus, type Cattle } from '../backend';
import CattleForm from '../components/CattleForm';
import CattleHealthChart from '../components/CattleHealthChart';

function healthLabel(h: HealthStatus): string {
  if (h === HealthStatus.Sick) return 'Sick';
  if (h === HealthStatus.Recovered) return 'Recovered';
  return 'Healthy';
}

function healthVariant(h: HealthStatus): 'default' | 'destructive' | 'secondary' | 'outline' {
  if (h === HealthStatus.Sick) return 'destructive';
  if (h === HealthStatus.Recovered) return 'secondary';
  return 'default';
}

export default function CattleManagement() {
  const { data: cattleList = [], isLoading } = useGetAllCattle();
  const addCattle = useAddCattle();
  const updateCattle = useUpdateCattle();
  const deleteCattle = useDeleteCattle();

  const [addOpen, setAddOpen] = useState(false);
  const [editCattle, setEditCattle] = useState<Cattle | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Cattle | null>(null);

  const availableCattle = cattleList.filter(c => c.availability === CattleAvailability.Available).length;
  const sickCattle = cattleList.filter(c => c.healthStatus === HealthStatus.Sick).length;
  const avgMilking = cattleList.length > 0
    ? cattleList.reduce((sum, c) => sum + c.milkingCapacity, 0) / cattleList.length
    : 0;

  const handleAdd = async (data: Parameters<typeof addCattle.mutateAsync>[0]) => {
    await addCattle.mutateAsync(data);
    setAddOpen(false);
  };

  const handleEdit = async (data: Parameters<typeof addCattle.mutateAsync>[0]) => {
    if (!editCattle) return;
    await updateCattle.mutateAsync({ cattleId: editCattle.id, ...data });
    setEditCattle(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteCattle.mutateAsync(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-dark flex items-center gap-2">
            <Beef className="h-6 w-6 text-primary" /> Cattle Management
          </h1>
          <p className="text-muted-foreground">Manage your cattle records</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="h-4 w-4" /> Add Cattle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{isLoading ? '—' : cattleList.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-green-600">{isLoading ? '—' : availableCattle}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Sick</p>
            <p className="text-2xl font-bold text-red-600">{isLoading ? '—' : sickCattle}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Avg Milking (L/day)</p>
            <p className="text-2xl font-bold">{isLoading ? '—' : avgMilking.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Tag #</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Milking (L/day)</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : cattleList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      No cattle records. Add your first cattle.
                    </TableCell>
                  </TableRow>
                ) : (
                  cattleList.map(cattle => (
                    <TableRow key={cattle.id.toString()} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-medium">
                        <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{cattle.tagNumber}</span>
                      </TableCell>
                      <TableCell>{cattle.breed}</TableCell>
                      <TableCell>{new Date(Number(cattle.dateOfPurchase) / 1_000_000).toLocaleDateString()}</TableCell>
                      <TableCell>{cattle.milkingCapacity.toFixed(1)}</TableCell>
                      <TableCell>₹{cattle.purchasePrice.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={cattle.availability === CattleAvailability.Available ? 'default' : 'outline'}>
                          {String(cattle.availability)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={healthVariant(cattle.healthStatus)}>
                          {healthLabel(cattle.healthStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setEditCattle(cattle)}>Edit</Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm(cattle)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Health Chart */}
        <div>
          <Card className="shadow-card">
            <CardContent className="pt-4">
              <p className="text-sm font-semibold mb-2 flex items-center gap-1"><Heart className="h-4 w-4 text-red-500" /> Health Overview</p>
              <CattleHealthChart cattle={cattleList} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New Cattle</DialogTitle></DialogHeader>
          <CattleForm
            onSubmit={handleAdd}
            onCancel={() => setAddOpen(false)}
            isLoading={addCattle.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCattle} onOpenChange={() => setEditCattle(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Cattle Record</DialogTitle></DialogHeader>
          {editCattle && (
            <CattleForm
              initialData={editCattle}
              onSubmit={handleEdit}
              onCancel={() => setEditCattle(null)}
              isLoading={updateCattle.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Cattle</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 py-2">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete cattle <strong>{deleteConfirm?.tagNumber}</strong>? This cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteCattle.isPending}>
              {deleteCattle.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
