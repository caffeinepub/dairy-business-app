import { useState } from 'react';
import { AlertTriangle, Plus, Edit2, ToggleLeft, ToggleRight, Beef } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAllCattle, useAddCattle, useUpdateCattle, nanosecondsToDate } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import CattleForm from '../components/CattleForm';
import type { Cattle } from '../backend';
import { toast } from 'sonner';

export default function CattleManagement() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: cattle = [], isLoading } = useGetAllCattle();
  const addCattleMutation = useAddCattle();
  const updateCattleMutation = useUpdateCattle();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCattle, setEditingCattle] = useState<Cattle | null>(null);

  const activeCattle = cattle.filter((c) => c.activeStatus);
  const healthyCattle = cattle.filter((c) => c.healthStatus.__kind__ === 'healthy');
  const sickCattle = cattle.filter((c) => c.healthStatus.__kind__ === 'sick');

  const handleEditOpen = (c: Cattle) => {
    setEditingCattle(c);
    setEditDialogOpen(true);
  };

  const getHealthBadge = (c: Cattle) => {
    if (c.healthStatus.__kind__ === 'healthy') {
      return <Badge className="bg-farm-green/20 text-farm-green border-farm-green/30">Healthy</Badge>;
    }
    if (c.healthStatus.__kind__ === 'sick') {
      return <Badge variant="destructive">Sick</Badge>;
    }
    return <Badge variant="secondary">Recovered</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Cattle Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your herd — {cattle.length} total, {activeCattle.length} active
          </p>
        </div>
        {isAuthenticated && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Cattle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Cattle</DialogTitle>
              </DialogHeader>
              <CattleForm
                onSubmit={async (data) => {
                  try {
                    await addCattleMutation.mutateAsync({
                      breed: data.breed,
                      ageMonths: data.ageMonths,
                      dailyMilkProductionLiters: data.dailyMilkProductionLiters,
                      healthStatus: data.healthStatus,
                      purchaseDate: data.purchaseDate,
                      purchaseCost: data.purchaseCost,
                      notes: data.notes,
                    });
                    toast.success('Cattle added successfully!');
                    setAddDialogOpen(false);
                  } catch (err) {
                    toast.error('Failed to add cattle. Please try again.');
                  }
                }}
                isLoading={addCattleMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!isAuthenticated && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            You are viewing in read-only mode. Please log in to add or edit cattle records.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: cattle.length, color: 'text-foreground' },
          { label: 'Active', value: activeCattle.length, color: 'text-farm-green' },
          { label: 'Healthy', value: healthyCattle.length, color: 'text-farm-sky' },
          { label: 'Sick', value: sickCattle.length, color: 'text-destructive' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Beef className="w-4 h-4 text-primary" />
            Cattle Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading cattle records…</div>
          ) : cattle.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No cattle records yet. Add your first cattle to get started.
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
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Status</TableHead>
                    {isAuthenticated && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cattle.map((c) => (
                    <TableRow key={c.id.toString()}>
                      <TableCell className="font-mono text-sm">#{c.id.toString()}</TableCell>
                      <TableCell className="font-medium">{c.breed}</TableCell>
                      <TableCell>{c.ageMonths.toString()}</TableCell>
                      <TableCell>{c.dailyMilkProductionLiters.toFixed(1)}</TableCell>
                      <TableCell>{getHealthBadge(c)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {nanosecondsToDate(c.purchaseDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.activeStatus ? 'default' : 'secondary'}>
                          {c.activeStatus ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      {isAuthenticated && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditOpen(c)}
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Cattle</DialogTitle>
          </DialogHeader>
          {editingCattle && (
            <CattleForm
              initialValues={editingCattle}
              onSubmit={async (data) => {
                try {
                  await updateCattleMutation.mutateAsync({
                    cattleId: editingCattle.id,
                    breed: data.breed,
                    ageMonths: data.ageMonths,
                    dailyMilkProductionLiters: data.dailyMilkProductionLiters,
                    healthStatus: data.healthStatus,
                    purchaseDate: data.purchaseDate,
                    purchaseCost: data.purchaseCost,
                    notes: data.notes,
                  });
                  toast.success('Cattle updated successfully!');
                  setEditDialogOpen(false);
                  setEditingCattle(null);
                } catch (err) {
                  toast.error('Failed to update cattle. Please try again.');
                }
              }}
              isLoading={updateCattleMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
