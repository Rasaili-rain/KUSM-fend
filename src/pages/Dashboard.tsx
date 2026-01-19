import { useMeterStore } from "@/stores/meterStore";
import { PowerInMeter } from "@/components/PowerInMeter";
import { useLatestDataStore } from "@/stores/latestDataStore";
import { PieGraph, type PieGraphPoint } from "@/components/PieGraph";
import { use, useEffect, useState } from "react";
import { api } from "@/utils/api";
import { getColorByID } from "@/utils/utils";
import type { GetAverageConsumptionAndPowerResponse } from "@/utils/types";
export default function Dashboard() {
  const meters = useMeterStore((s) => s.meters);
  const { meterDataMap } = useLatestDataStore();
  const [averageData, setAverageData] = useState<GetAverageConsumptionAndPowerResponse | null>(null);
  const [powerData, setPowerData] = useState<PieGraphPoint[] | null>(null);
  const [consumptionData, setConsumptionData] = useState<PieGraphPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await api.getAverageConsmuptionAndPower();
        setAverageData(data);
      }
      catch (err) {
        console.error("Failed to fetch average consumption and power:", err);
      }
      finally {
        setLoading(false);
        console.log(loading)
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (averageData) {
      const powerPieData: PieGraphPoint[] = averageData.map((item, index) => ({
        id: index,
        label: item.meter_name,
        value: item.average_power,
        color: getColorByID(index),
      }));
      setPowerData(powerPieData);

      const consumptionPieData: PieGraphPoint[] = averageData.map((item, index) => ({
        id: index,
        label: item.meter_name,
        value: item.average_energy,
        color: getColorByID(index),
      }));
      setConsumptionData(consumptionPieData);
    } else {
      setPowerData(null);
    }
  }, [averageData]);

  if (loading) {
    return (
      <>
        <h1 className="font-bold p-5 text-xl">Current Power in Each Meter</h1>
        <PowerInMeter meters={meters} meterDataMap={meterDataMap}></PowerInMeter>
        <div className="h-screen flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-600 animate-spin" />
            </div>

            <div className="text-center">
              <div className="text-lg font-medium text-gray-900">
                Calculating Average
              </div>
              <div className="text-sm text-gray-500 animate-pulse">
                Aggregating meter consumption…
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <h1 className="font-bold p-5 text-xl">Current Power in Each Meter</h1>
      <PowerInMeter meters={meters} meterDataMap={meterDataMap}></PowerInMeter>
      <div className="flex p-5 gap-5">
        <PieGraph title="Average Power Distribution Across Meters (W)" data={powerData} />
        <PieGraph title="Average Energy Distribution Across Meters (kWh)" data={consumptionData} />
      </div>

    </>
  );
}
