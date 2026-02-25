import type { MilkRecord } from '../lib/localTypes';
import { timeToDate } from '../hooks/useQueries';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface MilkProductionChartProps {
    records: MilkRecord[];
}

export default function MilkProductionChart({ records }: MilkProductionChartProps) {
    // Build last 7 days array
    const today = new Date();
    const days: { date: string; label: string; total: number }[] = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        days.push({
            date: dateStr,
            label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            total: 0,
        });
    }

    // Aggregate records
    for (const record of records) {
        const dateStr = timeToDate(record.date).toISOString().split('T')[0];
        const day = days.find((d) => d.date === dateStr);
        if (day) {
            day.total += record.quantity;
        }
    }

    const chartData = days.map((d) => ({
        name: d.label,
        liters: parseFloat(d.total.toFixed(1)),
    }));

    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d0" vertical={false} />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#7a6a50' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fontSize: 12, fill: '#7a6a50' }}
                    axisLine={false}
                    tickLine={false}
                    unit="L"
                />
                <Tooltip
                    formatter={(value: number) => [`${value} L`, 'Milk Yield']}
                    contentStyle={{
                        background: '#fdf8f0',
                        border: '1px solid #d4c9a8',
                        borderRadius: '8px',
                        fontSize: '13px',
                    }}
                />
                <Bar dataKey="liters" fill="#5a8a3c" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
        </ResponsiveContainer>
    );
}
