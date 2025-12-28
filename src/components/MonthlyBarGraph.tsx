import { BarChart } from '@mui/x-charts/BarChart';

export type MonthlyBarGraphProps = {
  title: string;
  data: number[];
  color: string;
};

export function MonthlyBarGraph({ title, data, color }: MonthlyBarGraphProps) {
  const xAxisLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#F9F9FA] rounded-[20px]">
      <div className="px-6 py-4 flex-none">
        {title}
      </div>
      <BarChart
        xAxis={[
          {
            id: 'barCategories',
            data: xAxisLabels,
          },
        ]}
        series={[
          {
            data: data,
            color: color,
            label: title,
          },
        ]}
        hideLegend={true}
      />
    </div>
  );
}

