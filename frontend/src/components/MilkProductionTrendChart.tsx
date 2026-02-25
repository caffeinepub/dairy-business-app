import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import type { MilkRecord } from '../backend';

interface MilkProductionTrendChartProps {
  milkRecords: MilkRecord[];
}

export default function MilkProductionTrendChart({ milkRecords }: MilkProductionTrendChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const days: { date: string; liters: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86_400_000;

      const liters = milkRecords
        .filter((r) => {
          const ms = Number(r.date / 1_000_000n);
          return ms >= dayStart && ms < dayEnd;
        })
        .reduce((sum, r) => sum + r.quantityLiters, 0);

      days.push({ date: label, liters: parseFloat(liters.toFixed(2)) });
    }

    return days;
  }, [milkRecords]);

  const hasData = chartData.some((d) => d.liters > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          30-Day Milk Production Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
            No data for the last 30 days
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                interval={4}
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
                formatter={(value: number) => [`${value}L`, 'Milk']}
              />
              <Line
                type="monotone"
                dataKey="liters"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--primary)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
