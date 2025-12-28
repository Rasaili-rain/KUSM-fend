import { LineChart } from '@mui/x-charts/LineChart';

export type LineGraphProps = {
  title: string;
  data: number[];
  color: string;
};

export function LineGraph({ title, data, color }: LineGraphProps) {
  const xAxisLabels = Array.from({ length: 288 }, (_, i) => {
    const hour = Math.floor(i / 12);
    const minute = (i % 12) * 5;
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  });

  return (
    <div className="w-full h-full flex flex-col bg-[#F9F9FA] rounded-[20px]">
      <div className="px-6 py-4 flex-none">
        {title}
      </div>
      <LineChart
        series={[
          {
            data: data,
            yAxisId: 'leftAxisId',
            area: true,
            showMark: false,
            color: color,
            valueFormatter: (value) => `${value}`,
            label: title,
          },
        ]}
        xAxis={[{
          scaleType: 'point', data: xAxisLabels,
          tickInterval: (value, index) => index % (12 * 4) === 0,    // Show the interval of 4 hr
          valueFormatter: (value) => `${value}`
        }]}
        yAxis={[
          { id: 'leftAxisId', width: 50 },
          { id: 'rightAxisId', position: 'right' },
        ]}
        tooltip={{ trigger: 'axis' }}
        hideLegend={true}
        sx={{
          '& .MuiAreaElement-root': {
            fillOpacity: 0.2,
          },
        }}
      />
    </div>
  );
}

