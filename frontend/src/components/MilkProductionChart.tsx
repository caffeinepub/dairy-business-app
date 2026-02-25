import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';
import type { MilkRecord } from '../backend';
import { nanosecondsToDate } from '../hooks/useQueries';

interface MilkProductionChartProps {
  milkRecords: MilkRecord[];
}

export default function MilkProductionChart({ milkRecords }: MilkProductionChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const days: { date: string; liters: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Droplets className="w-4 h-4 text-primary" />
          7-Day Milk Production
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickLine={false}
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
            <Bar dataKey="liters" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
