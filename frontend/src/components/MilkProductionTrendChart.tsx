import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MilkProductionRecord } from '../backend';
import { format } from 'date-fns';

interface Props {
  records: MilkProductionRecord[];
}

export default function MilkProductionTrendChart({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No milk production data to display
      </div>
    );
  }

  // Aggregate by date (sum quantities per day)
  const dateMap = new Map<string, number>();
  for (const record of records) {
    const dateStr = format(new Date(Number(record.date) / 1_000_000), 'MMM d');
    dateMap.set(dateStr, (dateMap.get(dateStr) ?? 0) + record.quantityLiters);
  }

  // Sort by original timestamp
  const sortedRecords = [...records].sort((a, b) => Number(a.date) - Number(b.date));
  const seenDates = new Set<string>();
  const chartData: { date: string; quantity: number }[] = [];

  for (const record of sortedRecords) {
    const dateStr = format(new Date(Number(record.date) / 1_000_000), 'MMM d');
    if (!seenDates.has(dateStr)) {
      seenDates.add(dateStr);
      chartData.push({ date: dateStr, quantity: Number((dateMap.get(dateStr) ?? 0).toFixed(2)) });
    }
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}L`}
        />
        <Tooltip
          formatter={(value: number) => [`${value} L`, 'Quantity']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="quantity"
          name="Milk (Liters)"
          stroke="#16a34a"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#16a34a' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
