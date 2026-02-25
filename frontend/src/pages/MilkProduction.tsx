import { useState, useMemo } from 'react';
import { Droplets, Plus, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useGetAllMilkRecords,
  useAddMilkRecord,
  useGetAllCattle,
  nanosecondsToDate,
  dateToNanoseconds,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import MilkProductionChart from '../components/MilkProductionChart';
import MilkProductionTrendChart from '../components/MilkProductionTrendChart';
import { exportMilkProductionRecordsToCSV } from '../utils/csvExport';
import type { MilkRecord } from '../backend';

export default function MilkProduction() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: milkRecords = [], isLoading } = useGetAllMilkRecords();
  const { data: cattle = [] } = useGetAllCattle();
  const addMilkRecord = useAddMilkRecord();

  const [cattleId, setCattleId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cattleId || !date || !quantity) return;

    await addMilkRecord.mutateAsync({
      cattleId: BigInt(cattleId),
      date: dateToNanoseconds(new Date(date)),
      quantityLiters: parseFloat(quantity),
      notes,
    });

    setCattleId('');
    setQuantity('');
    setNotes('');
  };

  const filteredRecords = useMemo(() => {
    let records = [...milkRecords];
    if (filterStart) {
      const start = dateToNanoseconds(new Date(filterStart));
      records = records.filter((r) => r.date >= start);
    }
    if (filterEnd) {
      const end = dateToNanoseconds(new Date(filterEnd + 'T23:59:59'));
      records = records.filter((r) => r.date <= end);
    }
    return records.sort((a, b) => Number(b.date - a.date));
  }, [milkRecords, filterStart, filterEnd]);

  const totalLiters = filteredRecords.reduce((sum, r) => sum + r.quantityLiters, 0);

  const handleDownloadCSV = () => {
    exportMilkProductionRecordsToCSV(filteredRecords, cattle);
  };

  const handleClearFilters = () => {
    setFilterStart('');
    setFilterEnd('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Milk Production</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track daily milk yield per cattle
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Form */}
        {isAuthenticated && (
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Log Milk Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cattle-select">Cattle</Label>
                  <Select value={cattleId} onValueChange={setCattleId}>
                    <SelectTrigger id="cattle-select">
                      <SelectValue placeholder="Select cattle" />
                    </SelectTrigger>
                    <SelectContent>
                      {cattle.map((c) => (
                        <SelectItem key={c.id.toString()} value={c.id.toString()}>
                          #{c.id.toString()} — {c.breed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="milk-date">Date</Label>
                  <Input
                    id="milk-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="milk-qty">Quantity (Liters)</Label>
                  <Input
                    id="milk-qty"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 12.5"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="milk-notes">Notes</Label>
                  <Textarea
                    id="milk-notes"
                    placeholder="Optional notes…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={addMilkRecord.isPending || !cattleId || !quantity}
                >
                  {addMilkRecord.isPending ? 'Saving…' : 'Log Record'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 7-Day Chart */}
        <div className={isAuthenticated ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <MilkProductionChart milkRecords={milkRecords} />
        </div>
      </div>

      {/* 30-Day Trend Chart */}
      <MilkProductionTrendChart milkRecords={milkRecords} />

      {/* Filter + Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Droplets className="w-4 h-4 text-primary" />
              Records
              {filteredRecords.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  — Total: {totalLiters.toFixed(1)}L
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={filterStart}
                onChange={(e) => setFilterStart(e.target.value)}
                className="w-36 h-8 text-sm"
                placeholder="From"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input
                type="date"
                value={filterEnd}
                onChange={(e) => setFilterEnd(e.target.value)}
                className="w-36 h-8 text-sm"
                placeholder="To"
              />
              {(filterStart || filterEnd) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-8 text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCSV}
                disabled={filteredRecords.length === 0}
                className="flex items-center gap-1.5 h-8"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading records…</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No milk records found for the selected range.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Cattle</TableHead>
                    <TableHead>Quantity (L)</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record: MilkRecord) => (
                    <TableRow key={record.id.toString()}>
                      <TableCell className="text-sm">
                        {nanosecondsToDate(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">#{record.cattleId.toString()}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {record.quantityLiters.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.notes || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
