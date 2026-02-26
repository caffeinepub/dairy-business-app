import { useState } from 'react';
import {
  useGetAllCustomers,
  useDeleteCustomer,
  useSetCustomerActive,
} from '../hooks/useAdminQueries';
import { CustomerAccount } from '../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import CustomerForm from './CustomerForm';

export default function AdminCustomerManagement() {
  const { data: customers = [], isLoading } = useGetAllCustomers();
  const deleteMutation = useDeleteCustomer();
  const toggleActiveMutation = useSetCustomerActive();

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerAccount | null>(null);
  // Track which customer ID is currently being toggled
  const [togglingId, setTogglingId] = useState<bigint | null>(null);

  const handleEdit = (c: CustomerAccount) => {
    setEditingCustomer(c);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Customer deleted');
    } catch {
      toast.error('Failed to delete customer');
    }
    setDeleteTarget(null);
  };

  const handleToggleActive = async (customer: CustomerAccount) => {
    setTogglingId(customer.id);
    try {
      await toggleActiveMutation.mutateAsync({
        customerId: customer.id,
        isActive: !customer.isActive,
      });
      toast.success(
        `Customer ${customer.name} ${customer.isActive ? 'deactivated' : 'activated'} successfully`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update customer status';
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
            <Users className="h-5 w-5 text-primary" />
            Customer Accounts
          </CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Customer
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No customers yet</p>
              <Button variant="link" onClick={handleAdd} className="mt-1">
                Add your first customer
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => {
                    const isToggling = togglingId === c.id;
                    return (
                      <TableRow key={c.id.toString()}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="font-mono text-sm">{c.username}</TableCell>
                        <TableCell>{c.phone}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{c.address}</TableCell>
                        <TableCell>
                          {c.isActive ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isToggling ? (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            ) : (
                              <Switch
                                checked={c.isActive}
                                onCheckedChange={() => handleToggleActive(c)}
                                disabled={isToggling || toggleActiveMutation.isPending}
                              />
                            )}
                          </div>
                        </TableCell>
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

      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete customer{' '}
              <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
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
