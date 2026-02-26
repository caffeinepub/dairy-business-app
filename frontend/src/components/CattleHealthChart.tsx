import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { HealthStatus, type Cattle } from '../backend';

interface Props {
  cattle: Cattle[];
}

interface HealthDataPoint {
  name: string;
  value: number;
  color: string;
}

export default function CattleHealthChart({ cattle }: Props) {
  let healthy = 0, sick = 0, recovered = 0;
  for (const c of cattle) {
    if (c.healthStatus === HealthStatus.Healthy) healthy++;
    else if (c.healthStatus === HealthStatus.Sick) sick++;
    else if (c.healthStatus === HealthStatus.Recovered) recovered++;
  }

  const data: HealthDataPoint[] = [
    { name: 'Healthy', value: healthy, color: '#22c55e' },
    { name: 'Sick', value: sick, color: '#ef4444' },
    { name: 'Recovered', value: recovered, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No cattle data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [value, 'Cattle']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
