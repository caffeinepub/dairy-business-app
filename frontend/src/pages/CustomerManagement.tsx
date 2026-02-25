import { useState } from 'react';
import { Users, Plus, Edit2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetCustomers, useAddCustomer, useUpdateCustomer } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import CustomerForm from '../components/CustomerForm';
import type { Customer } from '../backend';
import { toast } from 'sonner';

export default function CustomerManagement() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: customers = [], isLoading } = useGetCustomers();
  const addCustomerMutation = useAddCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const activeCustomers = customers.filter((c) => c.active === true);

  const handleEditOpen = (c: Customer) => {
    setEditingCustomer(c);
    setEditDialogOpen(true);
  };

  const handleAddDialogChange = (open: boolean) => {
    // Prevent closing while a submission is in progress
    if (!open && addCustomerMutation.isPending) return;
    if (!open) addCustomerMutation.reset();
    setAddDialogOpen(open);
  };

  const handleEditDialogChange = (open: boolean) => {
    // Prevent closing while a submission is in progress
    if (!open && updateCustomerMutation.isPending) return;
    if (!open) {
      updateCustomerMutation.reset();
      setEditingCustomer(null);
    }
    setEditDialogOpen(open);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Customer Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {customers.length} customers — {activeCustomers.length} active
          </p>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>
        )}
      </div>

      {!isAuthenticated && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            You are viewing in read-only mode. Please log in to manage customers.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total', value: customers.length },
          { label: 'Active', value: activeCustomers.length },
          { label: 'Inactive', value: customers.length - activeCustomers.length },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Customer Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading customers…</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No customers yet. Add your first customer to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    {isAuthenticated && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.id.toString()}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.address}</TableCell>
                      <TableCell className="text-sm">{c.phone}</TableCell>
                      <TableCell>
                        <Badge variant={c.active ? 'default' : 'secondary'}>
                          {c.active ? 'Active' : 'Inactive'}
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

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={handleAddDialogChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSubmit={async (data) => {
              try {
                await addCustomerMutation.mutateAsync({
                  name: data.name,
                  address: data.address,
                  phone: data.phone,
                  active: data.active,
                });
                toast.success('Customer added successfully!');
                setAddDialogOpen(false);
                addCustomerMutation.reset();
              } catch (err) {
                toast.error('Failed to add customer. Please try again.');
              }
            }}
            isLoading={addCustomerMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <CustomerForm
              initialValues={editingCustomer}
              onSubmit={async (data) => {
                try {
                  await updateCustomerMutation.mutateAsync({
                    customerId: editingCustomer.id,
                    name: data.name,
                    address: data.address,
                    phone: data.phone,
                    active: data.active,
                  });
                  toast.success('Customer updated successfully!');
                  setEditDialogOpen(false);
                  setEditingCustomer(null);
                  updateCustomerMutation.reset();
                } catch (err) {
                  toast.error('Failed to update customer. Please try again.');
                }
              }}
              isLoading={updateCustomerMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
