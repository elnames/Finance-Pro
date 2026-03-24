'use client';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts';

interface DayData {
  name: string;
  ingresos: number;
  gastos: number;
}

interface Props {
  data: DayData[];
}

export default function WeeklyActivityChart({ data }: Props) {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
            }}
          />
          <Area
            type="monotone"
            dataKey="ingresos"
            stroke="#34d399"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorIngresos)"
          />
          <Area
            type="monotone"
            dataKey="gastos"
            stroke="#f43f5e"
            strokeWidth={3}
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
