import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useMeterStore } from "@stores/meterStore";
import type { GetLatestMeterDataResponse } from "@utils/types";
import { api } from "@utils/api";
import { LineGraph } from "@components/LineGraph";
import { MonthlyBarGraph } from "@components/MonthlyBarGraph";
import { OverviewInfoCard } from "@components/OverviewInfoCard";

export default function MeterDetail() {
  const { meterId } = useParams<{ meterId: string }>();
  const meters = useMeterStore((s) => s.meters);
  const meter = meters.find((m) => m.meter_id === Number(meterId));

  const [meterReadings, setMeterReadings] = useState<MeterData[]>([]);

  // Fake data
  const data120 = Array.from({ length: 288 }, (_, i) => {
    return (
      50 +
      20 * Math.sin(i / 10) +   // main curve
      10 * Math.sin(i / 25)    // gentle variation
    );
  });
  const [loading, setLoading] = useState(true);

  return (
    <div className="grid grid-rows-2 grid-rows-[30%_70%] gap-2 h-screen">
      <div>
        <div className="grid grid-rows-2 grid-rows-[30%_100%] gap-2">
          <div className="mx-2 mt-2 text-xl">
            Overview
          </div>
          <div className="grid grid-cols-4 auto-cols-fr gap-10">
            <div>
              <OverviewInfoCard title="Power" data="1,024 W"/>
            </div>
            <div>
              <OverviewInfoCard title="Grid Consumption" data="1,024 W"/>
            </div>
            <div>
              <OverviewInfoCard title="Current" data="1,024 A"/>
            </div>
            <div>
              <OverviewInfoCard title="Voltage" data="1,024 V"/>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 grid-rows-[50%_30%_30%] gap-4 h-screen">
        <div className="col-span-2">
          <LineGraph title="Power" data={data120} color="#3b82f6" />
        </div>
        <div className="">
          <LineGraph title="Current" data={data120} color="#10b981" />
        </div>
        <div className="row-span-2">
          <MonthlyBarGraph title="Monthly Power" data={data120} color="#10b981"/>
        </div>
        <div className="">
          <LineGraph title="Voltage" data={data120} color="#f59e0b" />
        </div>
      </div>
    </div>
  );
}
