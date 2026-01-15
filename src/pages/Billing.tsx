import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";

import { useMeterStore } from "@/stores/meterStore";
import type { BillingResponse } from "@utils/types";
import { api } from "@utils/api";
import { OverviewInfoCard } from "@components/OverviewInfoCard";
import { LineGraph, type LineGraphPoint } from "@components/LineGraph";
import { PieGraph, type PieGraphPoint } from "@components/PieGraph";
import { BarGraph, type BarGraphPoint } from "@components/BarGraph";


export default function Billing() {
  const year = 2024;
  const month = 1;

  const meters = useMeterStore((state) => state.meters);
  const meterIdToName = Object.fromEntries(
    meters.map((m) => [m.meter_id, m.name])
  );

  const [billData, setBillData] = useState<BillingResponse | null>(null);
  const [costPerDayPoints, setCostPerDayPoints] = useState<LineGraphPoint[]|null>(null);
  const [costPerMeterData, setCostPerMeterData] = useState<PieGraphPoint[]|null>(null);
  const [weekDayData, setWeekDayData] = useState<BarGraphData[]|null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.billing.getBillingData(year, month);
        setBillData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []); // TODO: add year and month as dependency

  // Extract daily cost data
  useEffect(() => {
    let points: LineGraphPoint = {
      label: "Daily Cost",
      color: "#3b82f6", // blue
      data: billData?.cost_per_day.map((d) => ({
        x: d.day,
        y: d.cost,
      })),
    }

    if (points.data) {
      setCostPerDayPoints([points]);
    } else {
      setCostPerDayPoints(null);
    }

  }, [billData]);

  // Extract per meter cost
  useEffect(() => {
    const data = billData
      ? billData.cost_per_meter.map((m, index) => ({
          id: m.meter_id,
          label: meterIdToName[m.meter_id] ?? `Meter ${m.meter_id}`,
          value: m.cost,
        }))
      : null;
    setCostPerMeterData(data);
  }, [billData]);

  // Extract average day cost
  useEffect(() => {
    const weekdayOrder = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let data = billData
      ? weekdayOrder.map(day => ({
          label: day.slice(0, 3),
          value: billData.avg_cost_per_weekday[day] ?? 0,
        }))
      : null;
    setWeekDayData(data);
  }, [billData]);

  useEffect(() => {
    console.log(costPerDayPoints);
  }, [costPerDayPoints]);

  return (
    <div className="grid grid-rows-2 grid-rows-[30%_70%] gap-15 h-screen">
      <div>
        <div className="grid grid-rows-2 grid-rows-[30%_100%] gap-2">
          <div className="mx-2 mt-2 text-xl">
            Overview
          </div>
          <div className="flex justify-center gap-20">
            <div>
              <OverviewInfoCard title="Total Cost" data={billData?.billing.total_cost} prefix="Rs."/>
            </div>
            <div>
              <OverviewInfoCard title="Average Cost" data={billData?.billing.avg_cost_per_day} prefix="Rs."/>
            </div>
            <div>
              <OverviewInfoCard title="Expensive Day" data={billData?.billing.expensive_day_cost} footer={`${year}-${month}-${billData?.billing.expensive_day}`} prefix="Rs."/>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 grid-rows-[50%_50%] gap-4 h-screen">
        <div className="col-span-2">
          <LineGraph title="Cost per Day" points={costPerDayPoints} />
        </div>
        <div>
          <PieGraph title="Cost Distribution by Meter" data={costPerMeterData} />
        </div>
        <div>
          <BarGraph title="Average Cost by Weekday" data={weekDayData} color="#10b981" />
        </div>
      </div>
    </div>
  );
}
