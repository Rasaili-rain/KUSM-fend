import { useParams } from "react-router-dom";
import { useMeterStore } from "@stores/meterStore";
import { useEffect, useState } from "react";
import type { GetLatestMeterDataResponse } from "@utils/types";
import { api } from "@utils/api";

export default function MeterDetail() {
  const { meterId } = useParams<{ meterId: string }>();
  const meters = useMeterStore((s) => s.meters);

  const meter = meters.find((m) => m.meter_id === Number(meterId));
  const [data, setData] = useState<GetLatestMeterDataResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meter) return;

    const fetchData = async () => {
      try {
        const res = await api.getMeterData(meter.meter_id);
        setData(res);
      } catch (err) {
        console.error("Failed to fetch meter data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meter]);

  if (!meter) {
    return <div className="p-6 text-gray-500">Meter not found</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">{meter.name}</h1>
      <p className="text-gray-600">Meter ID: {meter.meter_id}</p>
      <p className="text-gray-600">Serial Number: {meter.sn}</p>

      {loading ? (
        <p>Loading latest data...</p>
      ) : data ? (
        <div className="space-y-2">
          <p>Timestamp: {data.timestamp}</p>
          <h2 className="font-medium">Phase Data</h2>
          <ul className="ml-4">
            <li>
              Phase A: {data.phase_A_voltage} V, {data.phase_A_current} A, {data.phase_A_active_power} kW
            </li>
            <li>
              Phase B: {data.phase_B_voltage} V, {data.phase_B_current} A, {data.phase_B_active_power} kW
            </li>
            <li>
              Phase C: {data.phase_C_voltage} V, {data.phase_C_current} A, {data.phase_C_active_power} kW
            </li>
          </ul>
        </div>
      ) : (
        <p className="text-red-500">No data available</p>
      )}
    </div>
  );
}
