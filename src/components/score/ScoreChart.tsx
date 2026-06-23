'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ScoreDataPoint {
  date: string;
  score: number;
}

interface ScoreChartProps {
  data: ScoreDataPoint[];
}

export function ScoreChart({ data }: ScoreChartProps) {
  if (data.length === 0) {
    return (
      <Card padding="lg" className="h-64 flex items-center justify-center border-dashed">
        <p className="text-muted text-sm">Not enough data to display score history.</p>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="w-full">
      <h3 className="text-lg font-bold text-white mb-6">30-Day Discipline Trend</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#A1A1AA" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                const d = new Date(val);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis 
              domain={[0, 100]} 
              stroke="#A1A1AA" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181B', borderColor: '#2D2D2D', borderRadius: '8px' }}
              itemStyle={{ color: '#00D084', fontWeight: 'bold' }}
              labelStyle={{ color: '#A1A1AA', marginBottom: '4px' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              name="Discipline Score"
              stroke="#00D084" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#00D084', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#00D084', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
