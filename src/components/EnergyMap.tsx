import HeatMap from "@uiw/react-heat-map";

export type EnergyMapValue = {
  date: string;
  count: number;
};

export type EnergyMapProps = {
  title: string;
  data?: EnergyMapValue[] | null;
  colors: string[];
  start_date: string;
  end_date: string;
};

export function EnergyMap({
  title,
  data,
  colors = [ "#eeeeee", "#c7e9c0", "#74c476", "#31a354", "#006d2c" ],
  start_date,
  end_date,
} : EnergyMapProps) {
  // Loading
  if (!data) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-gray-100">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Fetching Energy..</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-gray-100">
      <div className="px-6 py-4 text-sm font-medium text-gray-900">
        {title}
      </div>

      <HeatMap
        value={data}
        startDate={new Date(start_date)}
        endDate={new Date(end_date)}
        rectSize={12}
        space={5}
        legendCellSize={0}
        panelColors={colors}
        rectRender={(props, data) => (
          <rect {...props}>
            <title>
              {data?.date}: {(data?.count / 1000).toFixed(2)} kWh
            </title>
          </rect>
        )}
      />
    </div>
  );
}
