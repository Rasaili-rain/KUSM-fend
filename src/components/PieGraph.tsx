import { PieChart } from "@mui/x-charts/PieChart";

export type PieGraphPoint = {
  id: number | string;
  label: string;
  value: number;
  color?: string;
};

export type PieGraphProps = {
  title: string;
  data?: PieGraphPoint[];
  minSliceAngle?: number;
};

const shortenLabel = (label: string, max = 12) => {
  if (label.length <= max) return label;
  return label.slice(0, max - 1) + "…";
};

// Adjust data to ensure minimum slice thickness
function adjustDataForMinimumSlice(data: PieGraphPoint[], minAngleDegrees: number = 5): PieGraphPoint[] {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const minPercentage = minAngleDegrees / 360;
  const minValue = total * minPercentage;
  
  // Separate small and large slices
  const smallSlices = data.filter(item => (item.value / total) < minPercentage);
  const largeSlices = data.filter(item => (item.value / total) >= minPercentage);
  
  if (smallSlices.length === 0) {
    return data; // No adjustment needed
  }
  
  // Calculate how much we need to add to small slices
  const totalAddition = smallSlices.reduce((sum, item) => {
    return sum + (minValue - item.value);
  }, 0);
  
  // Subtract proportionally from large slices
  const largeTotal = largeSlices.reduce((sum, item) => sum + item.value, 0);
  
  return data.map(item => {
    const currentPercentage = item.value / total;
    
    if (currentPercentage < minPercentage) {
      // Boost small slices to minimum
      return { ...item, value: minValue };
    } else {
      // Reduce large slices proportionally
      const reduction = (item.value / largeTotal) * totalAddition;
      return { ...item, value: Math.max(minValue, item.value - reduction) };
    }
  });
}

export function PieGraph({ title, data, minSliceAngle = 5 }: PieGraphProps) {
  if (!data) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3
        bg-white rounded-2xl border border-gray-100">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Fetching {title}</span>
      </div>
    );
  }
  
  const safeData = data.filter(
    (d) => typeof d.value === "number" && d.value > 0
  );
  
  if (safeData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-gray-400
        bg-white rounded-2xl border border-gray-100">
        No data available
      </div>
    );
  }
  
  // Adjust data to ensure minimum slice visibility
  const adjustedData = adjustDataForMinimumSlice(safeData, minSliceAngle);
  
  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-gray-100">
      {/* Header */}
      <div className="px-6 pt-5 pb-2 text-sm font-medium text-gray-900">
        {title}
      </div>
      {/* Chart */}
      <div className="flex-1 flex items-center justify-center">
        <PieChart
          width={420}
          height={360}
          series={[
            {
              data: adjustedData.map((item) => ({
                id: item.id,
                value: item.value,
                label: item.label,
                color: item.color,
              })),
              innerRadius: 100,
              outerRadius: 180,
              paddingAngle: 2,
              cornerRadius: 4,
              highlightScope: {
                faded: "global",
                highlighted: "item",
              },
              faded: {
                additionalRadius: -6,
              },
            },
          ]}
          slotProps={{
            legend: { hidden: true },
          }}
        />
      </div>
    </div>
  );
}
