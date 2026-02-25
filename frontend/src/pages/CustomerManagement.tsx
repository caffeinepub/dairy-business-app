import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Plus, Pencil, Users } from 'lucide-react';
import { useGetCustomers, useAddCustomer, useUpdateCustomer } from '../hooks/useQueries';
import CustomerForm from '../components/CustomerForm';
import type { Customer } from '../backend';

export default function CustomerManagement() {
    const { data: customers = [], isLoading } = useGetCustomers();
    const addCustomer = useAddCustomer();
    const updateCustomer = useUpdateCustomer();

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editTarget, setEditTarget] = useState<Customer | null>(null);

    const handleAdd = (data: { name: string; address: string; phone: string; activeStatus: boolean }) => {
        addCustomer.mutate(data, {
            onSuccess: () => setShowAddDialog(false),
        });
    };

    const handleEdit = (data: { name: string; address: string; phone: string; activeStatus: boolean }) => {
        if (!editTarget) return;
        updateCustomer.mutate({ id: editTarget.id, ...data }, {
            onSuccess: () => setEditTarget(null),
        });
    };

    const handleToggleStatus = (c: Customer) => {
        updateCustomer.mutate({
            id: c.id,
            name: c.name,
            address: c.address,
            phone: c.phone,
            activeStatus: !c.activeStatus,
        });
    };

    const activeCount = customers.filter((c) => c.activeStatus).length;
    const inactiveCount = customers.filter((c) => !c.activeStatus).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Customer Management</h1>
                        <p className="text-sm text-muted-foreground">Manage your milk delivery customers</p>
                    </div>
                </div>
                <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Customer
                </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total', value: customers.length, color: 'text-foreground' },
                    { label: 'Active', value: activeCount, color: 'text-success' },
                    { label: 'Inactive', value: inactiveCount, color: 'text-muted-foreground' },
                ].map(({ label, value, color }) => (
                    <Card key={label} className="shadow-card">
                        <CardContent className="pt-4 pb-3 text-center">
                            <p className={`text-2xl font-bold ${color}`}>{isLoading ? '—' : value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <Card className="shadow-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">All Customers</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : customers.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No customers yet</p>
                            <p className="text-sm mt-1">Click "Add Customer" to get started</p>
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
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((c) => (
                                        <TableRow key={String(c.id)}>
                                            <TableCell className="font-semibold">{c.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.address || '—'}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.phone || '—'}</TableCell>
                                            <TableCell>
                                                {c.activeStatus ? (
                                                    <Badge className="bg-success text-success-foreground border-0">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleToggleStatus(c)}
                                                        disabled={updateCustomer.isPending}
                                                        className="text-xs"
                                                    >
                                                        {c.activeStatus ? 'Deactivate' : 'Activate'}
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() => setEditTarget(c)}
                                                        className="h-8 w-8"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
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

            {/* Add Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                    </DialogHeader>
                    <CustomerForm
                        mode="add"
                        onSubmit={handleAdd}
                        onCancel={() => setShowAddDialog(false)}
                        isLoading={addCustomer.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Customer — {editTarget?.name}</DialogTitle>
                    </DialogHeader>
                    {editTarget && (
                        <CustomerForm
                            mode="edit"
                            initialValues={editTarget}
                            onSubmit={handleEdit}
                            onCancel={() => setEditTarget(null)}
                            isLoading={updateCustomer.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
