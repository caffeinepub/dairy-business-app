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
import { useGetFlaggedFeedback } from '../hooks/useQueries';
import { nanosecondsToDate } from '../hooks/useQueries';
import { AlertTriangle, Flag, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import ResolveFeedbackDialog from './ResolveFeedbackDialog';
import type { CustomerFeedback } from '../backend';

export default function FlaggedFeedbackSection() {
  const { data: feedbackList = [], isLoading, error } = useGetFlaggedFeedback();
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);

  const handleResolve = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setResolveOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Flag className="w-4 h-4 text-destructive" />
            Customer Feedback — Flagged Issues
            {feedbackList.length > 0 && (
              <Badge variant="destructive" className="ml-auto text-xs">
                {feedbackList.length} pending
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Could not load feedback. You may not have admin access.
              </p>
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="p-6 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-farm-green flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                No pending customer feedback — all issues resolved!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackList.map((feedback) => (
                    <TableRow key={feedback.feedbackId.toString()}>
                      <TableCell className="text-sm font-medium">
                        #{feedback.deliveryId.toString()}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground max-w-[120px] truncate">
                        {feedback.customerPrincipal.toString().slice(0, 12)}…
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px]">
                        <p className="truncate" title={feedback.message}>
                          {feedback.message}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {nanosecondsToDate(feedback.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-farm-green/50 text-farm-green hover:bg-farm-green/10"
                          onClick={() => handleResolve(feedback)}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Resolve
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

      <ResolveFeedbackDialog
        open={resolveOpen}
        onClose={() => {
          setResolveOpen(false);
          setSelectedFeedback(null);
        }}
        feedback={selectedFeedback}
      />
    </>
  );
}
