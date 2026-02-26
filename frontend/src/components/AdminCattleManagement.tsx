import { useState } from 'react';
import { useGetAllCattle, useDeleteCattle, useUpdateCattle } from '../hooks/useAdminQueries';
import { Cattle, CattleAvailability, HealthStatus } from '../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Pencil, Trash2, Beef } from 'lucide-react';
import { toast } from 'sonner';
import CattleForm from './CattleForm';

function availabilityBadge(status: CattleAvailability) {
  switch (status) {
    case CattleAvailability.Available:
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>;
    case CattleAvailability.Reserved:
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Reserved</Badge>;
    case CattleAvailability.Sold:
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Sold</Badge>;
  }
}

function healthBadge(status: HealthStatus) {
  switch (status) {
    case HealthStatus.Healthy:
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Healthy</Badge>;
    case HealthStatus.Sick:
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Sick</Badge>;
    case HealthStatus.Recovered:
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Recovered</Badge>;
  }
}

export default function AdminCattleManagement() {
  const { data: cattle = [], isLoading } = useGetAllCattle();
  const deleteMutation = useDeleteCattle();
  const updateMutation = useUpdateCattle();

  const [showForm, setShowForm] = useState(false);
  const [editingCattle, setEditingCattle] = useState<Cattle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cattle | null>(null);
  // Track which cattle ID is currently being toggled for availability
  const [togglingId, setTogglingId] = useState<bigint | null>(null);

  const handleEdit = (c: Cattle) => {
    setEditingCattle(c);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingCattle(null);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Cattle record deleted');
    } catch {
      toast.error('Failed to delete cattle record');
    }
    setDeleteTarget(null);
  };

  const handleAvailabilityChange = async (c: Cattle, newAvailability: CattleAvailability) => {
    if (newAvailability === c.availability) return;
    setTogglingId(c.id);
    try {
      await updateMutation.mutateAsync({
        id: c.id,
        tagNumber: c.tagNumber,
        breed: c.breed,
        dateOfPurchase: c.dateOfPurchase,
        purchasePrice: c.purchasePrice,
        availability: newAvailability,
        healthStatus: c.healthStatus,
      });
      toast.success(`Cattle ${c.tagNumber} marked as ${newAvailability}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update availability';
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Beef className="h-5 w-5 text-primary" />
            Cattle Records
          </CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Cattle
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : cattle.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Beef className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No cattle records yet</p>
              <Button variant="link" onClick={handleAdd} className="mt-1">
                Add your first cattle record
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag #</TableHead>
                    <TableHead>Breed</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Price (₹)</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cattle.map((c) => {
                    const isToggling = togglingId === c.id;
                    return (
                      <TableRow key={c.id.toString()}>
                        <TableCell className="font-mono font-medium">{c.tagNumber}</TableCell>
                        <TableCell>{c.breed}</TableCell>
                        <TableCell>
                          {new Date(Number(c.dateOfPurchase) / 1_000_000).toLocaleDateString()}
                        </TableCell>
                        <TableCell>₹{c.purchasePrice.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isToggling ? (
                              <div className="flex items-center gap-1.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                {availabilityBadge(c.availability)}
                              </div>
                            ) : (
                              <Select
                                value={c.availability}
                                onValueChange={(v) =>
                                  handleAvailabilityChange(c, v as CattleAvailability)
                                }
                                disabled={isToggling || updateMutation.isPending}
                              >
                                <SelectTrigger className="h-7 w-[120px] text-xs border-0 p-0 shadow-none focus:ring-0 bg-transparent">
                                  <SelectValue>
                                    {availabilityBadge(c.availability)}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={CattleAvailability.Available}>
                                    Available
                                  </SelectItem>
                                  <SelectItem value={CattleAvailability.Reserved}>
                                    Reserved
                                  </SelectItem>
                                  <SelectItem value={CattleAvailability.Sold}>
                                    Sold
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{healthBadge(c.healthStatus)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(c)}
                              disabled={isToggling}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(c)}
                              disabled={isToggling}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form Dialog */}
      {showForm && (
        <CattleForm
          cattle={editingCattle}
          onClose={() => {
            setShowForm(false);
            setEditingCattle(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cattle Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete cattle with tag{' '}
              <strong>{deleteTarget?.tagNumber}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
