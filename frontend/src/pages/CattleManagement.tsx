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
import { Plus, Pencil, Beef } from 'lucide-react';
import { useGetAllCattle, useAddCattle, useUpdateCattle, formatDate } from '../hooks/useQueries';
import CattleForm from '../components/CattleForm';
import type { Cattle } from '../lib/localTypes';

export default function CattleManagement() {
    const { data: cattle = [], isLoading } = useGetAllCattle();
    const addCattle = useAddCattle();
    const updateCattle = useUpdateCattle();

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editTarget, setEditTarget] = useState<Cattle | null>(null);

    const handleAdd = (data: { name: string; breed: string; birthDate: Date; status: string }) => {
        addCattle.mutate(data, {
            onSuccess: () => setShowAddDialog(false),
        });
    };

    const handleEdit = (data: { name: string; breed: string; birthDate: Date; status: string }) => {
        if (!editTarget) return;
        updateCattle.mutate({ id: editTarget.id, ...data }, {
            onSuccess: () => setEditTarget(null),
        });
    };

    const handleToggleStatus = (c: Cattle) => {
        const newStatus = c.status === 'active' ? 'inactive' : 'active';
        updateCattle.mutate({
            id: c.id,
            name: c.name,
            breed: c.breed,
            birthDate: new Date(Number(c.birthDate / BigInt(1_000_000))),
            status: newStatus,
        });
    };

    const statusBadge = (status: string) => {
        if (status === 'active') return <Badge className="bg-success text-success-foreground border-0">Active</Badge>;
        if (status === 'sold') return <Badge variant="secondary">Sold</Badge>;
        return <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Beef className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Cattle Management</h1>
                        <p className="text-sm text-muted-foreground">Manage your herd records</p>
                    </div>
                </div>
                <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Cattle
                </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total', value: cattle.length, color: 'text-foreground' },
                    { label: 'Active', value: cattle.filter(c => c.status === 'active').length, color: 'text-success' },
                    { label: 'Inactive', value: cattle.filter(c => c.status !== 'active').length, color: 'text-muted-foreground' },
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
                    <CardTitle className="text-base font-semibold">All Cattle</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : cattle.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Beef className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No cattle records yet</p>
                            <p className="text-sm mt-1">Click "Add Cattle" to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Breed</TableHead>
                                        <TableHead>Birth Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cattle.map((c) => (
                                        <TableRow key={String(c.id)}>
                                            <TableCell className="font-semibold">{c.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.breed}</TableCell>
                                            <TableCell className="text-muted-foreground">{formatDate(c.birthDate)}</TableCell>
                                            <TableCell>{statusBadge(c.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleToggleStatus(c)}
                                                        disabled={updateCattle.isPending}
                                                        className="text-xs"
                                                    >
                                                        {c.status === 'active' ? 'Deactivate' : 'Activate'}
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
                        <DialogTitle>Add New Cattle</DialogTitle>
                    </DialogHeader>
                    <CattleForm
                        mode="add"
                        onSubmit={handleAdd}
                        onCancel={() => setShowAddDialog(false)}
                        isLoading={addCattle.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Cattle — {editTarget?.name}</DialogTitle>
                    </DialogHeader>
                    {editTarget && (
                        <CattleForm
                            mode="edit"
                            initialValues={editTarget}
                            onSubmit={handleEdit}
                            onCancel={() => setEditTarget(null)}
                            isLoading={updateCattle.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
