import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import type { Cattle } from '../backend';

interface CattleHealthChartProps {
  cattle: Cattle[];
}

interface HealthDataPoint {
  name: string;
  value: number;
}

const HEALTH_COLORS: Record<string, string> = {
  Healthy: '#4ade80',   // green
  Sick: '#f87171',      // red
  Recovered: '#fbbf24', // amber
};

export default function CattleHealthChart({ cattle }: CattleHealthChartProps) {
  const chartData = useMemo(() => {
    let healthy = 0;
    let sick = 0;
    let recovered = 0;

    for (const c of cattle) {
      if (c.healthStatus.__kind__ === 'healthy') healthy++;
      else if (c.healthStatus.__kind__ === 'sick') sick++;
      else if (c.healthStatus.__kind__ === 'recovered') recovered++;
    }

    const data: HealthDataPoint[] = [];
    if (healthy > 0) data.push({ name: 'Healthy', value: healthy });
    if (sick > 0) data.push({ name: 'Sick', value: sick });
    if (recovered > 0) data.push({ name: 'Recovered', value: recovered });
    return data;
  }, [cattle]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Cattle Health Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cattle.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            No cattle records yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }: HealthDataPoint) => `${name}: ${value}`}
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={HEALTH_COLORS[entry.name]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => [value, name]}
              />
              <Legend
                iconType="circle"
                iconSize={10}
                formatter={(value) => (
                  <span style={{ fontSize: '12px', color: 'var(--foreground)' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
