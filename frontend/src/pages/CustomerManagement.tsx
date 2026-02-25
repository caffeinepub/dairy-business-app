import React, { useState } from 'react';
import { toast } from 'sonner';
import { PlusCircle, Edit2, Search, Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import CustomerForm from '../components/CustomerForm';
import { useGetCustomers, useAddCustomer, useUpdateCustomer } from '../hooks/useQueries';
import type { Customer } from '../backend';
import { exportCustomerRecordsToCSV } from '../utils/csvExport';

export default function CustomerManagement() {
  const { data: customers = [], isLoading } = useGetCustomers();
  const addCustomer = useAddCustomer();
  const updateCustomer = useUpdateCustomer();

  const [addOpen, setAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.address.toLowerCase().includes(search.toLowerCase()),
  );

  const activeCount = customers.filter((c) => c.active).length;
  const inactiveCount = customers.length - activeCount;

  const handleAdd = async (data: {
    name: string;
    address: string;
    phone: string;
    active: boolean;
  }) => {
    try {
      const result = await addCustomer.mutateAsync(data);
      if (result === null) {
        toast.error('A customer with this name already exists.');
      } else {
        toast.success('Customer added successfully!');
        setAddOpen(false);
      }
    } catch (err) {
      toast.error('Failed to add customer. Please try again.');
    }
  };

  const handleEdit = async (data: {
    name: string;
    address: string;
    phone: string;
    active: boolean;
  }) => {
    if (!editCustomer) return;
    try {
      await updateCustomer.mutateAsync({ id: editCustomer.id, ...data });
      toast.success('Customer updated successfully!');
      setEditCustomer(null);
    } catch (err) {
      toast.error('Failed to update customer. Please try again.');
    }
  };

  const handleExport = () => {
    exportCustomerRecordsToCSV(customers);
    toast.success('Customer list exported!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Customer Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your milk delivery customers.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
              Inactive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">{inactiveCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name, phone, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Loading customers...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Users className="h-10 w-10 opacity-30" />
              <p>{search ? 'No customers match your search.' : 'No customers yet. Add your first customer!'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((customer) => (
                    <TableRow key={customer.id.toString()}>
                      <TableCell className="font-mono text-xs">
                        #{customer.id.toString()}
                      </TableCell>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.address || '—'}
                      </TableCell>
                      <TableCell>{customer.phone || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={customer.active ? 'default' : 'outline'}>
                          {customer.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditCustomer(customer)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>
              Enter the details for the new customer.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm onSubmit={handleAdd} isLoading={addCustomer.isPending} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCustomer} onOpenChange={(open) => !open && setEditCustomer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update the details for this customer.
            </DialogDescription>
          </DialogHeader>
          {editCustomer && (
            <CustomerForm
              initialData={editCustomer}
              onSubmit={handleEdit}
              isLoading={updateCustomer.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
