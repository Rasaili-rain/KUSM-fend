
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@utils/api";
import type { Meter } from "@/utils/types";

export type PowerInMeterProps = {
    meters: Meter[]
};

export function PowerInMeter({meters}: PowerInMeterProps) {
  const [meterdata, setMeterdata] = useState<
    { meter_id: number; power: number | string }[]
  >([]);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  useEffect(() => {
    const fetchData = async () => {
      console.log()
      try {
        meters.forEach(async (meter) => {
          const res = await api.meter.getLatestMeterData(meter.meter_id);
          const power =
            res.phase_A_active_power +
            res.phase_B_active_power +
            res.phase_C_active_power;
          console.log(res);
          console.log(meterdata)
          setMeterdata((prev) => {
            const others = prev.filter(
              (m) => m.meter_id !== meter.meter_id
            );
            return [
              ...others,
              {
                meter_id: meter.meter_id,
                power
              },
            ];
          });
        });
      } catch (err) {
        console.log(err)
      }
    }
    fetchData()
  }, [refreshCount, meters]);

  setTimeout(() => {
    setRefreshCount(refreshCount + 1)
  }, 300000);

  return (
<>
  <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hidden group-hover:scrollbar-visible">
    <div className="flex flex-row gap-6 px-4 whitespace-nowrap">
      {meters.map((meter) => {
        const path = `/meter/${meter.meter_id}`;

        return (
          <div
            key={meter.meter_id}
            className="flex flex-col min-w-[250px]"
          >
            <Link
              to={path}
              className="flex items-center gap-3 p-3 text-sm rounded-md transition"
              state={{ title: meter.name }}
            >
              <span className="truncate">{meter.name}</span>
            </Link>

            <div className="bg-indigo-100 text-center p-10 m-2 rounded-2xl font-bold text-2xl text-gray-600 mb-5">
              {
                meterdata.find(
                  (m) => m.meter_id === meter.meter_id
                )?.power ?? "—"
              }{" "}
              W
            </div>
          </div>
        );
      })}
    </div>
  </div>
</>

  );
}
