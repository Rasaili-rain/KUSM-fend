import { useMeterStore } from "@/stores/meterStore";
import { PowerInMeter } from "@/components/PowerInMeter";


export default function Dashboard() {
  const meters = useMeterStore((s) => s.meters);
  return (
    <>
      <h1 className="font-bold p-5 text-xl">Current Power in Each Meter</h1>
      <PowerInMeter meters={meters}></PowerInMeter>
    </>
  );
}
