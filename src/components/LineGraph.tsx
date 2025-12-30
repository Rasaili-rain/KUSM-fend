import { LineChart } from '@mui/x-charts/LineChart';
import type { TimePoint } from "@utils/types";

export type LineGraphPoint = {
  label: string;
  data: TimePoint[];
  color: string;
};

export type LineGraphProps = {
  title: string;
  points?: LineGraphPoint[];
};

export function LineGraph({ title, points }: LineGraphProps) {
  // Loading animation
  if (!points) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#F9F9FA] rounded-[20px]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500">Fetching {title}...</span>
      </div>
    );
  }

  const safePoints = Array.isArray(points)
    ? points.filter(p => Array.isArray(p.data) && p.data.length > 0)
    : [];

  if (safePoints.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
        No data available
      </div>
    );
  }

  const allValues = safePoints.flatMap(p => p.data.map(d => d.y));
  const minY = Math.min(...allValues);
  const maxY = Math.max(...allValues);
  const padding = (maxY - minY) * 0.1 || 1;

  // Extract x-axis data (timestamps) from the first series
  const xAxisData = safePoints[0]?.data.map(point => point.x) || [];

  // Convert series data to just y-values
  const series = safePoints.map((point) => ({
    data: point.data.map(d => d.y),
    label: point.label,
    showMark: false,
    area: true,
    color: point.color,
  }));

  return (
    <div className="w-full h-full flex flex-col bg-[#F9F9FA] rounded-[20px]">
      <div className="px-6 py-4 flex-none">{title}</div>
      <LineChart
        series={series}
        xAxis={[
          {
            scaleType: 'time',
            data: xAxisData,
            valueFormatter: (d: Date) =>
              d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]}
        yAxis={[
          {
            min: minY - padding,
            max: maxY + padding,
            width: 50,
          },
        ]}
        tooltip={{ trigger: 'axis' }}
        hideLegend
        sx={{
          '& .MuiAreaElement-root': {
            fillOpacity: 0.2,
          },
        }}
      />
    </div>
  );
}
