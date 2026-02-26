import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetMyDeliveries } from '../hooks/useQueries';
import { nanosecondsToDate } from '../hooks/useQueries';
import { Variant_missed_delivered } from '../backend';
import type { DeliveryRecord } from '../backend';
import CustomerFeedbackDialog from './CustomerFeedbackDialog';
import { Truck, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function CustomerDeliveryList() {
  const { data: deliveries = [], isLoading, error } = useGetMyDeliveries();
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleReportIssue = (delivery: DeliveryRecord) => {
    setSelectedDelivery(delivery);
    setFeedbackOpen(true);
  };

  const sortedDeliveries = [...deliveries].sort((a, b) => Number(b.date - a.date));

  const deliveredCount = deliveries.filter(
    (d) => d.status === Variant_missed_delivered.delivered,
  ).length;
  const missedCount = deliveries.filter(
    (d) => d.status === Variant_missed_delivered.missed,
  ).length;

  return (
    <>
      <div className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{deliveries.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total</p>
            </CardContent>
          </Card>
          <Card className="border-farm-green/30 bg-farm-green/5">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-farm-green">{deliveredCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Delivered</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-destructive">{missedCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Missed</p>
            </CardContent>
          </Card>
        </div>

        {/* Delivery table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              Delivery History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Could not load deliveries. Please try again.
                </p>
              </div>
            ) : sortedDeliveries.length === 0 ? (
              <div className="p-8 text-center">
                <Truck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No deliveries found for your account.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Deliveries will appear here once your account is linked by the admin.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Delivery By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDeliveries.map((delivery) => (
                      <TableRow key={delivery.id.toString()}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {nanosecondsToDate(delivery.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {delivery.quantityLiters.toFixed(1)} L
                        </TableCell>
                        <TableCell className="text-sm">{delivery.deliveryBoyName || '—'}</TableCell>
                        <TableCell>
                          {delivery.status === Variant_missed_delivered.delivered ? (
                            <Badge className="bg-farm-green/20 text-farm-green border-farm-green/30 text-xs flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" />
                              Delivered
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="text-xs flex items-center gap-1 w-fit"
                            >
                              <XCircle className="w-3 h-3" />
                              Missed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                          {delivery.notes || '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {delivery.status === Variant_missed_delivered.delivered && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs border-warning/50 text-warning hover:bg-warning/10"
                              onClick={() => handleReportIssue(delivery)}
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Report Issue
                            </Button>
                          )}
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

      <CustomerFeedbackDialog
        open={feedbackOpen}
        onClose={() => {
          setFeedbackOpen(false);
          setSelectedDelivery(null);
        }}
        delivery={selectedDelivery}
      />
    </>
  );
}
