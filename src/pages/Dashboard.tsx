import { useMeterStore } from "@/stores/meterStore";

export default function Dashboard() {
  const meters = useMeterStore((s) => s.meters);
  return (
    <>
      <h1>Meters</h1>
      <ul>
        {meters.map((meter) => (
          <li key={meter.meter_id}>{meter.name}</li>
        ))}
      </ul>
    </>
  );
}
