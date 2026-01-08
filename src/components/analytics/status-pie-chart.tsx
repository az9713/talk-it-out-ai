'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatusData {
  status: string;
  count: number;
  color: string;
}

interface StatusPieChartProps {
  data: StatusData[];
}

export function StatusPieChart({ data }: StatusPieChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Outcomes</CardTitle>
          <CardDescription>Distribution of session statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No session data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for recharts compatibility
  const chartData = data.map((d) => ({
    ...d,
    name: d.status,
    value: d.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Outcomes</CardTitle>
        <CardDescription>Distribution of session statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
