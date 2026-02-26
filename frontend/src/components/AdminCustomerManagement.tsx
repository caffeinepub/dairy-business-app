import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  useGetAllCustomers, useAddCustomer, useUpdateCustomer,
  useDeleteCustomer, useSetCustomerActive
} from '../hooks/useAdminQueries';
import type { CustomerAccount } from '../backend';

const emptyForm = {
  name: '',
  phone: '',
  address: '',
  username: '',
  password: '',
  isActive: true,
};

export default function AdminCustomerManagement() {
  const { data: customers = [], isLoading } = useGetAllCustomers();
  const addCustomer = useAddCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const setActive = useSetCustomerActive();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerAccount | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<CustomerAccount | null>(null);

  const openAdd = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: CustomerAccount) => {
    setEditingCustomer(c);
    setForm({
      name: c.name,
      phone: c.phone,
      address: c.address,
      username: c.username,
      password: '',
      isActive: c.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      await updateCustomer.mutateAsync({
        customerId: editingCustomer.id,
        name: form.name,
        phone: form.phone,
        address: form.address,
        username: form.username,
        passwordHash: form.password || editingCustomer.passwordHash,
        isActive: form.isActive,
      });
    } else {
      await addCustomer.mutateAsync({
        name: form.name,
        phone: form.phone,
        address: form.address,
        username: form.username,
        passwordHash: form.password,
        isActive: form.isActive,
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteCustomer.mutateAsync(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (c: CustomerAccount) => {
    await setActive.mutateAsync({ customerId: c.id, isActive: !c.isActive });
  };

  const isPending = addCustomer.isPending || updateCustomer.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-admin-dark">Customer Management</h2>
          <p className="text-sm text-muted-foreground">{customers.length} customers total</p>
        </div>
        <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No customers found. Add your first customer.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id.toString()} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-sm">{c.username}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{c.address}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={c.isActive}
                        onCheckedChange={() => handleToggleActive(c)}
                        disabled={setActive.isPending}
                      />
                      <Badge variant={c.isActive ? 'default' : 'secondary'} className={c.isActive ? 'bg-green-100 text-green-800' : ''}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
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
            <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Customer name" />
              </div>
              <div className="space-y-1">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Address *</Label>
                <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required placeholder="Full address" />
              </div>
              <div className="space-y-1">
                <Label>Username *</Label>
                <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required placeholder="Login username" />
              </div>
              <div className="space-y-1">
                <Label>{editingCustomer ? 'New Password (leave blank to keep)' : 'Password *'}</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required={!editingCustomer}
                  placeholder={editingCustomer ? 'Leave blank to keep current' : 'Set password'}
                />
              </div>
              <div className="space-y-1 col-span-2 flex items-center gap-3">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
                />
                <Label>Account Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
                {isPending ? 'Saving...' : editingCustomer ? 'Update' : 'Add Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete customer <strong>{deleteConfirm?.name}</strong>? This will remove their account and they will no longer be able to log in.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteCustomer.isPending}>
              {deleteCustomer.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
