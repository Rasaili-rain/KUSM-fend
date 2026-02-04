import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";

import Dashboard from "@pages/Dashboard";
import MasterLayout from "@components/layouts/MasterLayout";
import Analysis from "@pages/Analysis";
import MeterDetail from "@pages/MeterDetail";
import Map from "@pages/Map";
import Billing from "@pages/Billing";
import Prediction from "@pages/Prediction"; // ADD THIS
import { useMeterStore } from "@stores/meterStore";
import MapAdmin from "@pages/MapAdmin";
import { useLatestDataStore } from "@stores/latestDataStore";

/*
 * Application Routes
 */

const router = createBrowserRouter([
  // {
  //   path: "/login",
  //   element: <Login />,
  // },
  {
    element: <MasterLayout title= {title} />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
        handle: { title: "Dashboard" },
      },
      {
        path: "/analysis",
        element: <Analysis />,
        handle: { title: "Analysis" },
      },
      {
        path: "/prediction", // ADD THIS
        element: <Prediction />,
        handle: { title: "Prediction" },
      },
      {
        path: "/map",
        element: <Map />,
        handle: { title: "Map" },
      },
      {
        path: "/map/admin",
        element: <MapAdmin />,
        handle: { title: "Map" },
      },
      {
        path: "/meter/:meterId",
        element: <MeterDetail />,
        handle: { title: "Meter Details" },
      },
      {
        path: "/billing",
        element: <Billing />,
        handle: { title: "Billing" },
      },
    ],
  },
]);

export default function App() {
  const { fetchMeters, meters } = useMeterStore();
  const { fetchLatestData } = useLatestDataStore();

  useEffect(() => {
    fetchMeters();
  }, [fetchMeters]);

  useEffect(() => {
    if (meters.length > 0) {
      fetchLatestData();
      const intervalId = setInterval(() => {
        fetchLatestData();
      }, 5 * 60 * 1000);

      return () => clearInterval(intervalId);
    }
  }, [meters.length, fetchLatestData]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}