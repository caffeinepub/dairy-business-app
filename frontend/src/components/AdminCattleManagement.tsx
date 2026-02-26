import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useGetAllCattle, useAddCattle, useUpdateCattle, useDeleteCattle } from '../hooks/useAdminQueries';
import { CattleAvailability, HealthStatus, type Cattle } from '../backend';

const emptyForm = {
  tagNumber: '',
  breed: '',
  dateOfPurchase: '',
  milkingCapacity: '',
  purchasePrice: '',
  availability: CattleAvailability.Available as CattleAvailability,
  healthStatus: HealthStatus.Healthy as HealthStatus,
};

function availabilityBadge(a: CattleAvailability) {
  if (a === CattleAvailability.Available) return <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>;
  if (a === CattleAvailability.Sold) return <Badge className="bg-red-100 text-red-800 border-red-200">Sold</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Reserved</Badge>;
}

function healthBadge(h: HealthStatus) {
  if (h === HealthStatus.Healthy) return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Healthy</Badge>;
  if (h === HealthStatus.Sick) return <Badge className="bg-red-100 text-red-800 border-red-200">Sick</Badge>;
  return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Recovered</Badge>;
}

export default function AdminCattleManagement() {
  const { data: cattle = [], isLoading } = useGetAllCattle();
  const addCattle = useAddCattle();
  const updateCattle = useUpdateCattle();
  const deleteCattle = useDeleteCattle();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCattle, setEditingCattle] = useState<Cattle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<Cattle | null>(null);

  const openAdd = () => {
    setEditingCattle(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: Cattle) => {
    setEditingCattle(c);
    const d = new Date(Number(c.dateOfPurchase) / 1_000_000);
    setForm({
      tagNumber: c.tagNumber,
      breed: c.breed,
      dateOfPurchase: d.toISOString().split('T')[0],
      milkingCapacity: c.milkingCapacity.toString(),
      purchasePrice: c.purchasePrice.toString(),
      availability: c.availability,
      healthStatus: c.healthStatus,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dateMs = new Date(form.dateOfPurchase).getTime();
    const dateNs = BigInt(dateMs) * BigInt(1_000_000);
    const payload = {
      tagNumber: form.tagNumber,
      breed: form.breed,
      dateOfPurchase: dateNs,
      milkingCapacity: parseFloat(form.milkingCapacity),
      purchasePrice: parseFloat(form.purchasePrice),
      availability: form.availability,
      healthStatus: form.healthStatus,
    };
    if (editingCattle) {
      await updateCattle.mutateAsync({ cattleId: editingCattle.id, ...payload });
    } else {
      await addCattle.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteCattle.mutateAsync(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const isPending = addCattle.isPending || updateCattle.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-admin-dark">Cattle Management</h2>
          <p className="text-sm text-muted-foreground">{cattle.length} records total</p>
        </div>
        <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Add Cattle
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Tag #</TableHead>
              <TableHead>Breed</TableHead>
              <TableHead>Date of Purchase</TableHead>
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
            ) : cattle.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No cattle records found. Add your first cattle record.
                </TableCell>
              </TableRow>
            ) : (
              cattle.map((c) => (
                <TableRow key={c.id.toString()} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-medium">{c.tagNumber}</TableCell>
                  <TableCell>{c.breed}</TableCell>
                  <TableCell>{new Date(Number(c.dateOfPurchase) / 1_000_000).toLocaleDateString()}</TableCell>
                  <TableCell>{c.milkingCapacity.toFixed(1)}</TableCell>
                  <TableCell>₹{c.purchasePrice.toLocaleString()}</TableCell>
                  <TableCell>{availabilityBadge(c.availability)}</TableCell>
                  <TableCell>{healthBadge(c.healthStatus)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(c)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteConfirm(c)} className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCattle ? 'Edit Cattle Record' : 'Add New Cattle'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Tag Number *</Label>
                <Input value={form.tagNumber} onChange={e => setForm(f => ({ ...f, tagNumber: e.target.value }))} required placeholder="e.g. TAG-001" />
              </div>
              <div className="space-y-1">
                <Label>Breed *</Label>
                <Input value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} required placeholder="e.g. Holstein" />
              </div>
              <div className="space-y-1">
                <Label>Date of Purchase *</Label>
                <Input type="date" value={form.dateOfPurchase} onChange={e => setForm(f => ({ ...f, dateOfPurchase: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Milking Capacity (L/day) *</Label>
                <Input type="number" step="0.1" min="0" value={form.milkingCapacity} onChange={e => setForm(f => ({ ...f, milkingCapacity: e.target.value }))} required placeholder="e.g. 15.5" />
              </div>
              <div className="space-y-1">
                <Label>Purchase Price (₹) *</Label>
                <Input type="number" min="0" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))} required placeholder="e.g. 50000" />
              </div>
              <div className="space-y-1">
                <Label>Availability *</Label>
                <Select value={form.availability} onValueChange={v => setForm(f => ({ ...f, availability: v as CattleAvailability }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CattleAvailability.Available}>Available</SelectItem>
                    <SelectItem value={CattleAvailability.Reserved}>Reserved</SelectItem>
                    <SelectItem value={CattleAvailability.Sold}>Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Health Status *</Label>
                <Select value={form.healthStatus} onValueChange={v => setForm(f => ({ ...f, healthStatus: v as HealthStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={HealthStatus.Healthy}>Healthy</SelectItem>
                    <SelectItem value={HealthStatus.Sick}>Sick</SelectItem>
                    <SelectItem value={HealthStatus.Recovered}>Recovered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
                {isPending ? 'Saving...' : editingCattle ? 'Update' : 'Add Cattle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Cattle Record</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete cattle <strong>{deleteConfirm?.tagNumber}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteCattle.isPending}>
              {deleteCattle.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
