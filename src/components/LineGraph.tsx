import { LineChart } from "@mui/x-charts/LineChart";
import { useMemo } from "react";
import type { TimePoint } from "@utils/types";

export type LineGraphPoint = {
  label: string;
  data: TimePoint[];
  color: string;
};

export type LineGraphProps = {
  title: string;
  points?: LineGraphPoint[] | null;
};

export function LineGraph({ title, points }: LineGraphProps) {
  // Loading
  if (!points) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-gray-100">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Fetching {title}</span>
      </div>
    );
  }

  const safePoints = useMemo(
    () => points.filter((p) => p.data && p.data.length > 0),
    [points]
  );

  if (safePoints.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
        No data available
      </div>
    );
  }

  const { series, xAxis, yAxis } = useMemo(() => {
    const allValues = safePoints.flatMap((p) => p.data.map((d) => d.y));
    const minY = Math.min(...allValues);
    const maxY = Math.max(...allValues);
    const padding = (maxY - minY) * 0.1 || 1;

    const firstX = safePoints[0].data[0].x;
    const isTimeAxis = firstX instanceof Date;

    const xValues = safePoints[0].data.map((d) =>
      isTimeAxis ? d.x.getTime() : d.x
    );

    return {
      series: safePoints.map((p) => ({
        data: p.data.map((d) => d.y),
        label: p.label,
        color: p.color,
        showMark: false,
        area: true,
      })),
      xAxis: isTimeAxis
        ? [
            {
              scaleType: "time",
              data: xValues,
              valueFormatter: (v: number) =>
                new Date(v).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
            },
          ]
        : [
            {
              scaleType: "band",
              data: xValues,
            },
          ],
      yAxis: [
        {
          min: minY - padding,
          max: maxY + padding,
          width: 50,
        },
      ],
    };
  }, [safePoints]);

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-gray-100">
      <div className="px-6 py-4 text-sm font-medium text-gray-900">
        {title}
      </div>

      <LineChart
        series={series}
        xAxis={xAxis}
        yAxis={yAxis}
        hideLegend
        tooltip={{ trigger: "axis" }}
        sx={{
          "& .MuiAreaElement-root": {
            fillOpacity: 0.15,
          },
        }}
      />
    </div>
  );
}
