import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useIsCallerAdmin,
  useGetAllMilkProductionRecords,
  useGetMilkProductionStats,
  useAddMilkProductionRecord,
  useUpdateMilkProductionRecord,
  useDeleteMilkProductionRecord,
} from '../hooks/useAdminQueries';
import { MilkProductionRecord } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Droplets, Plus, Pencil, Trash2, TrendingUp, BarChart2, Beef } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import MilkProductionTrendChart from '../components/MilkProductionTrendChart';

interface RecordFormData {
  cattleTag: string;
  quantityLiters: string;
  date: string;
  notes: string;
}

const emptyForm: RecordFormData = {
  cattleTag: '',
  quantityLiters: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
};

export default function MilkProduction() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: records = [], isLoading: recordsLoading } = useGetAllMilkProductionRecords();
  const { data: stats } = useGetMilkProductionStats();
  const addMutation = useAddMilkProductionRecord();
  const updateMutation = useUpdateMilkProductionRecord();
  const deleteMutation = useDeleteMilkProductionRecord();

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MilkProductionRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MilkProductionRecord | null>(null);
  const [form, setForm] = useState<RecordFormData>(emptyForm);
  const [sortField, setSortField] = useState<'date' | 'quantity'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

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

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleOpenEdit = (record: MilkProductionRecord) => {
    setEditingRecord(record);
    setForm({
      cattleTag: record.cattleTag,
      quantityLiters: record.quantityLiters.toString(),
      date: format(new Date(Number(record.date) / 1_000_000), 'yyyy-MM-dd'),
      notes: record.notes,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dateMs = new Date(form.date).getTime();
    const dateNs = BigInt(dateMs) * 1_000_000n;

    try {
      if (editingRecord) {
        await updateMutation.mutateAsync({
          id: editingRecord.id,
          cattleTag: form.cattleTag,
          quantityLiters: parseFloat(form.quantityLiters),
          date: dateNs,
          notes: form.notes,
        });
        toast.success('Record updated successfully');
      } else {
        await addMutation.mutateAsync({
          cattleTag: form.cattleTag,
          quantityLiters: parseFloat(form.quantityLiters),
          date: dateNs,
          notes: form.notes,
        });
        toast.success('Record added successfully');
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save record');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Record deleted');
    } catch {
      toast.error('Failed to delete record');
    }
    setDeleteTarget(null);
  };

  const sortedRecords = [...records].sort((a, b) => {
    if (sortField === 'date') {
      const diff = Number(a.date) - Number(b.date);
      return sortDir === 'asc' ? diff : -diff;
    } else {
      const diff = a.quantityLiters - b.quantityLiters;
      return sortDir === 'asc' ? diff : -diff;
    }
  });

  const toggleSort = (field: 'date' | 'quantity') => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-dark flex items-center gap-2 font-display">
            <Droplets className="h-6 w-6 text-primary" /> Milk Production
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track daily milk production records</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Record
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
            <BarChart2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? Number(stats.totalRecords) : '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Quantity</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? `${stats.totalQuantity.toFixed(1)} L` : '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Daily</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? `${stats.avgDailyProduction.toFixed(1)} L` : '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cattle Tracked</CardTitle>
            <Beef className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? Number(stats.uniqueCattleCount) : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Production Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recordsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <MilkProductionTrendChart records={records} />
          )}
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Droplets className="h-5 w-5 text-primary" />
            Production Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recordsLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : sortedRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Droplets className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No records yet</p>
              <Button variant="link" onClick={handleOpenAdd} className="mt-1">
                Add your first record
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none hover:text-foreground"
                      onClick={() => toggleSort('date')}
                    >
                      Date {sortField === 'date' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead>Cattle Tag</TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-foreground"
                      onClick={() => toggleSort('quantity')}
                    >
                      Quantity (L) {sortField === 'quantity' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRecords.map((record) => (
                    <TableRow key={record.id.toString()}>
                      <TableCell className="font-medium">
                        {format(new Date(Number(record.date) / 1_000_000), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="font-mono">{record.cattleTag}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">
                          {record.quantityLiters.toFixed(2)} L
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                        {record.notes || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(record)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(record)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && setShowForm(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Edit Production Record' : 'Add Production Record'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cattleTag">Cattle Tag *</Label>
                <Input
                  id="cattleTag"
                  value={form.cattleTag}
                  onChange={(e) => setForm((f) => ({ ...f, cattleTag: e.target.value }))}
                  placeholder="e.g. TAG-001"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity (Liters) *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                value={form.quantityLiters}
                onChange={(e) => setForm((f) => ({ ...f, quantityLiters: e.target.value }))}
                placeholder="e.g. 12.5"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any observations..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingRecord ? (
                  'Update Record'
                ) : (
                  'Add Record'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this milk production record for cattle{' '}
              <strong>{deleteTarget?.cattleTag}</strong>? This action cannot be undone.
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
    </div>
  );
}
