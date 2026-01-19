import { useMeterStore } from "@/stores/meterStore";
import { PowerInMeter } from "@/components/PowerInMeter";
import { useLatestDataStore } from "@/stores/latestDataStore";


export default function Dashboard() {
  const meters = useMeterStore((s) => s.meters);
  const { meterDataMap } = useLatestDataStore();
  
  return (
    <>
      <h1 className="font-bold p-5 text-xl">Current Power in Each Meter</h1>
      <PowerInMeter meters={meters} meterDataMap={meterDataMap}></PowerInMeter>
    </>
  );
}
