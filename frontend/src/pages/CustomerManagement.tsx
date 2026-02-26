import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Users, UserCheck, UserX, Search, AlertTriangle, Download } from 'lucide-react';
import { useGetAllCustomers, useAddCustomer, useUpdateCustomer, useDeleteCustomer, useSetCustomerActive } from '../hooks/useAdminQueries';
import type { CustomerAccount } from '../backend';
import CustomerForm from '../components/CustomerForm';
import { exportCustomersToCSV } from '../utils/csvExport';

export default function CustomerManagement() {
  const { data: customers = [], isLoading } = useGetAllCustomers();
  const addCustomer = useAddCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const setActive = useSetCustomerActive();

  const [addOpen, setAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<CustomerAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CustomerAccount | null>(null);
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const activeCount = customers.filter(c => c.isActive).length;
  const inactiveCount = customers.length - activeCount;

  const handleAdd = async (data: Parameters<typeof addCustomer.mutateAsync>[0]) => {
    await addCustomer.mutateAsync(data);
    setAddOpen(false);
  };

  const handleEdit = async (data: Parameters<typeof addCustomer.mutateAsync>[0]) => {
    if (!editCustomer) return;
    await updateCustomer.mutateAsync({ customerId: editCustomer.id, ...data });
    setEditCustomer(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteCustomer.mutateAsync(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-dark flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Customer Management
          </h1>
          <p className="text-muted-foreground">Manage customer accounts and access</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportCustomersToCSV(customers)} className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button onClick={() => setAddOpen(true)} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{isLoading ? '—' : customers.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">{isLoading ? '—' : activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4 flex items-center gap-2">
            <UserX className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold text-red-500">{isLoading ? '—' : inactiveCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, username, phone..."
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
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
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  {search ? 'No customers match your search.' : 'No customers yet. Add your first customer.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(c => (
                <TableRow key={c.id.toString()} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-sm">{c.username}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell className="max-w-[180px] truncate text-sm">{c.address}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={c.isActive}
                        onCheckedChange={() => setActive.mutateAsync({ customerId: c.id, isActive: !c.isActive })}
                        disabled={setActive.isPending}
                      />
                      <Badge className={c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditCustomer(c)}>Edit</Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm(c)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
          <CustomerForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} isLoading={addCustomer.isPending} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCustomer} onOpenChange={() => setEditCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Customer</DialogTitle></DialogHeader>
          {editCustomer && (
            <CustomerForm
              initialData={editCustomer}
              onSubmit={handleEdit}
              onCancel={() => setEditCustomer(null)}
              isLoading={updateCustomer.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Customer</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 py-2">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Delete customer <strong>{deleteConfirm?.name}</strong>? They will lose portal access.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteCustomer.isPending}>
              {deleteCustomer.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
