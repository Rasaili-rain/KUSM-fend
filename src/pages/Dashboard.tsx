import { useEffect, useState, useMemo } from "react";

import { api } from "@utils/api";
import { getYearRange } from "@utils/utils";
import { EnergyMap, type EnergyMapProps, type EnergyMapValue } from "@components/EnergyMap";


export default function Dashboard() {
  const [data, setData] = useState<EnergyMapValue[] | null>(null);
  const [loading, setLoading] = useState(true);

  const { start, end } = useMemo(() => getYearRange(), []);

  useEffect(() => {
    setLoading(true);
    api.meter
      .getAvgDailyEnergy(start, end)
      .then((energyData) => {
        setData(
          energyData.map((d) => ({
            date: d.date,
            count: d.average_energy,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [start, end]);

  return (
    <div className="grid grid-rows-2 grid-rows-[220px_70%] gap-2 h-screen">
      <EnergyMap
        title="Energy"
        data={data}
        colors={[
          "#f5f3ff",
          "#ddd6fe",
          "#a78bfa",
          "#7c3aed",
          "#4c1d95",
        ]}
        start_date={start}
        end_date={end}
      />
    </div>
  );
}
