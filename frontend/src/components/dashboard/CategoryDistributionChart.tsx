'use client';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

interface ChartEntry {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: ChartEntry[];
}

export default function CategoryDistributionChart({ data }: Props) {
  return (
    <>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '16px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full mt-6">
        {(() => {
          const total = data.reduce((s, d) => s + d.value, 0);
          return data.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{item.name}</p>
                <p className="text-[10px] text-muted-foreground leading-none">
                  {item.value > 0
                    ? `${((item.value / total) * 100).toFixed(0)}%`
                    : '—'}
                </p>
              </div>
            </div>
          ));
        })()}
      </div>
    </>
  );
}
