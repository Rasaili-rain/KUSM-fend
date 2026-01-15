import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";

import { useMeterStore } from "@stores/meterStore";
import type { GetLatestMeterDataResponse, MeterData, TimePoint } from "@utils/types";
import { api } from "@utils/api";
import { LineGraph, type LineGraphPoint } from "@components/LineGraph";
import { OverviewInfoCard } from "@components/OverviewInfoCard";

export default function MeterDetail() {
  const { meterId } = useParams<{ meterId: string }>();
  const meters = useMeterStore((s) => s.meters);
  const meter = meters.find((m) => m.meter_id === Number(meterId));

  const [meterReadings, setMeterReadings] = useState<MeterData[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = ["#3b82f6", "#10b981", "#f59e0b"];
  const data120 = Array.from({ length: 288 }, (_, i) => {
    return (
      50 +
      20 * Math.sin(i / 10) +   // main curve
      10 * Math.sin(i / 25)    // gentle variation
    );
  });


  // Creates line graph plotable data
  const createPhaseData = (keyPrefix: string) => {
    const a: TimePoint[] = [];
    const b: TimePoint[] = [];
    const c: TimePoint[] = [];
    let totalSum = 0;
    let count = 0;

    meterReadings.forEach(d => {
      const time = new Date(d.timestamp.replace(" ", "T"));
      const valA = d[`phase_A_${keyPrefix}`];
      const valB = d[`phase_B_${keyPrefix}`];
      const valC = d[`phase_C_${keyPrefix}`];

      a.push({ x: time, y: valA });
      b.push({ x: time, y: valB });
      c.push({ x: time, y: valC });

      totalSum += valA + valB + valC;
      count += 3;
    });

    // Returning null if no data is found (to trigger the loading animation ofc)
    if (!a.length && !b.length && !c.length) return null;

    const phaseData = [
      { label: "Phase A", data: a, color: "#3b82f6" },
      { label: "Phase B", data: b, color: "#10b981" },
      { label: "Phase C", data: c, color: "#f59e0b" },
    ];

    const average = count > 0 ? totalSum / count : 0;

    return { phaseData: phaseData, average: average.toFixed(2) };
  };

  // Fetch the meter data
  useEffect(() => {
    setMeterReadings([]);
    const fetchData = async () => {
      try {
        const res = await api.getMeterDataByDate(meter.name, "2026-01-06", "2026-01-06");

        if (!res.success) {
          throw new Error(res.message);
        }

        setMeterReadings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!meter) return;
    fetchData();
  }, [meter]);

  const powerData = useMemo(() => createPhaseData('active_power'), [meterReadings]);
  const currentData = useMemo(() => createPhaseData('current'), [meterReadings]);
  const voltageData = useMemo(() => createPhaseData('voltage'), [meterReadings]);
  const gridData = useMemo(() => createPhaseData('grid_consumption'), [meterReadings]);

  return (
    <div className="grid grid-rows-2 grid-rows-[30%_70%] gap-2 h-screen">
      <div>
        <div className="grid grid-rows-2 grid-rows-[30%_100%] gap-2">
          <div className="mx-2 mt-2 text-xl">
            Overview
          </div>
          <div className="grid grid-cols-4 auto-cols-fr gap-3">
            <div>
              <OverviewInfoCard title="Power" data={powerData?.average} unit="W"/>
            </div>
            <div>
              <OverviewInfoCard title="Grid Consumption" data={gridData?.average} unit="Whr"/>
            </div>
            <div>
              <OverviewInfoCard title="Current" data={currentData?.average} unit="A"/>
            </div>
            <div>
              <OverviewInfoCard title="Voltage" data={voltageData?.average} unit="V"/>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 grid-rows-[50%_30%_30%] gap-4 h-screen">
        <div className="col-span-2">
          <LineGraph title="Power" points={powerData?.phaseData} />
        </div>
        <div className="">
          <LineGraph title="Current" points={currentData?.phaseData} />
        </div>
        <div className="row-span-2">
        </div>
        <div className="">
          <LineGraph title="Voltage" points={voltageData?.phaseData} />
        </div>
      </div>
    </div>
  );
}
