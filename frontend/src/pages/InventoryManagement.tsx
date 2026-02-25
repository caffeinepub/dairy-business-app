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
import { Package, Plus, AlertTriangle, RefreshCw } from 'lucide-react';
import {
    useGetAllInventoryItems,
    useAddInventoryItem,
    useUpdateInventoryItem,
} from '../hooks/useQueries';
import InventoryForm from '../components/InventoryForm';
import type { InventoryItem } from '../lib/localTypes';

const LOW_STOCK_THRESHOLD = 10;

const CATEGORY_COLORS: Record<string, string> = {
    Feed: 'bg-success/10 text-success border-success/30',
    Medicine: 'bg-destructive/10 text-destructive border-destructive/30',
    Equipment: 'bg-accent/20 text-accent-foreground border-accent/30',
    Supplies: 'bg-secondary text-secondary-foreground border-border',
    Other: 'bg-muted text-muted-foreground border-border',
};

export default function InventoryManagement() {
    const { data: inventory = [], isLoading } = useGetAllInventoryItems();
    const addItem = useAddInventoryItem();
    const updateItem = useUpdateInventoryItem();

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [updateTarget, setUpdateTarget] = useState<InventoryItem | null>(null);

    const handleAdd = (data: { name: string; category: string; quantity: number; unit: string }) => {
        addItem.mutate(data, {
            onSuccess: () => setShowAddDialog(false),
        });
    };

    const handleUpdate = (data: { quantity: number }) => {
        if (!updateTarget) return;
        updateItem.mutate({ id: updateTarget.id, quantity: data.quantity }, {
            onSuccess: () => setUpdateTarget(null),
        });
    };

    const lowStockItems = inventory.filter((i) => Number(i.quantity) < LOW_STOCK_THRESHOLD);
    const totalItems = inventory.length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Inventory Management</h1>
                        <p className="text-sm text-muted-foreground">Track feed, medicine, and supplies</p>
                    </div>
                </div>
                <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Item
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Card className="shadow-card">
                    <CardContent className="pt-4 pb-3 text-center">
                        <p className="text-2xl font-bold text-foreground">{isLoading ? '—' : totalItems}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Items</p>
                    </CardContent>
                </Card>
                <Card className="shadow-card border-warning/30">
                    <CardContent className="pt-4 pb-3 text-center">
                        <p className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-warning' : 'text-success'}`}>
                            {isLoading ? '—' : lowStockItems.length}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Low Stock</p>
                    </CardContent>
                </Card>
                <Card className="shadow-card sm:block hidden">
                    <CardContent className="pt-4 pb-3 text-center">
                        <p className="text-2xl font-bold text-foreground">
                            {isLoading ? '—' : inventory.filter(i => Number(i.quantity) >= LOW_STOCK_THRESHOLD).length}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Well Stocked</p>
                    </CardContent>
                </Card>
            </div>

            {/* Low stock alert banner */}
            {!isLoading && lowStockItems.length > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/30">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-warning-foreground">
                            {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {lowStockItems.map(i => i.name).join(', ')}
                        </p>
                    </div>
                </div>
            )}

            {/* Table */}
            <Card className="shadow-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">All Inventory Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : inventory.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No inventory items yet</p>
                            <p className="text-sm mt-1">Click "Add Item" to start tracking</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventory.map((item) => {
                                        const qty = Number(item.quantity);
                                        const isLow = qty < LOW_STOCK_THRESHOLD;
                                        return (
                                            <TableRow
                                                key={String(item.id)}
                                                className={isLow ? 'bg-warning/5' : ''}
                                            >
                                                <TableCell className="font-semibold">
                                                    <div className="flex items-center gap-2">
                                                        {isLow && <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />}
                                                        {item.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS['Other']}`}
                                                    >
                                                        {item.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className={`text-right font-bold ${isLow ? 'text-warning' : 'text-foreground'}`}>
                                                    {qty}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                                                <TableCell>
                                                    {isLow ? (
                                                        <Badge variant="outline" className="text-xs border-warning text-warning">
                                                            Low Stock
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs border-success/40 text-success">
                                                            OK
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setUpdateTarget(item)}
                                                        className="gap-1.5 h-8 text-xs"
                                                    >
                                                        <RefreshCw className="w-3 h-3" />
                                                        Update Qty
                                                    </Button>
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

            {/* Add Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Inventory Item</DialogTitle>
                    </DialogHeader>
                    <InventoryForm
                        mode="add"
                        onSubmit={handleAdd}
                        onCancel={() => setShowAddDialog(false)}
                        isLoading={addItem.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Update Dialog */}
            <Dialog open={!!updateTarget} onOpenChange={(open) => !open && setUpdateTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Quantity</DialogTitle>
                    </DialogHeader>
                    {updateTarget && (
                        <InventoryForm
                            mode="update"
                            itemName={updateTarget.name}
                            currentQuantity={Number(updateTarget.quantity)}
                            onSubmit={handleUpdate}
                            onCancel={() => setUpdateTarget(null)}
                            isLoading={updateItem.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
