import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';
import type { DeliveryRecord } from '../backend';
import { Variant_missed_delivered } from '../backend';

interface DeliveryQuantityChartProps {
  deliveryRecords: DeliveryRecord[];
}

export default function DeliveryQuantityChart({ deliveryRecords }: DeliveryQuantityChartProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Get all days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { date: string; liters: number; deliveries: number }[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, month, day).getTime();
      const dayEnd = dayStart + 86_400_000;
      const label = `${day}`;

      const dayRecords = deliveryRecords.filter((r) => {
        const ms = Number(r.date / 1_000_000n);
        return ms >= dayStart && ms < dayEnd && r.status === Variant_missed_delivered.delivered;
      });

      const liters = dayRecords.reduce((sum, r) => sum + r.quantityLiters, 0);
      days.push({ date: label, liters: parseFloat(liters.toFixed(2)), deliveries: dayRecords.length });
    }

    return days;
  }, [deliveryRecords]);

  const hasData = chartData.some((d) => d.liters > 0);
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" />
          Daily Delivery Quantities — {monthName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            No deliveries recorded this month
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value}L`, 'Delivered']}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Bar dataKey="liters" fill="var(--farm-sky, #7dd3fc)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
