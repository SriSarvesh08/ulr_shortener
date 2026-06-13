import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-surface-200 rounded-md px-3 py-2 shadow-sm">
        <p className="text-xs text-surface-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-surface-900">
          {payload[0].value} click{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

const ClickChart = ({ data = [], height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-surface-500 text-sm"
        style={{ height }}
      >
        No click data available yet.
      </div>
    );
  }

  // Format dates for display
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
        <XAxis
          dataKey="displayDate"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#71717a', fontSize: 11 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#71717a', fontSize: 11 }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e4e4e7', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area
          type="monotone"
          dataKey="clicks"
          stroke="#2563eb"
          strokeWidth={2}
          fill="url(#clickGradient)"
          dot={false}
          activeDot={{
            r: 4,
            fill: '#2563eb',
            stroke: '#ffffff',
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ClickChart;
