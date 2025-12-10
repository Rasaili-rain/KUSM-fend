import { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { useAuthStore } from "@stores/authStore";
import Login from "@pages/Login";
import Dashboard from "@pages/Dashboard";
import MasterLayout from "@components/layouts/MasterLayout";
import Analysis from "@pages/Analysis";
import MeterDetail from "@pages/MeterDetail";
import Map from "@pages/Map";
import { useMeterStore } from "./stores/meterStore";


/*
 * Application Routes
 */

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <MasterLayout />,
    children: [
      { 
        path: "/", 
        element: <Dashboard />,
        handle: { title: "Dashboard" }
      },
      { 
        path: "/analysis", 
        element: <Analysis />,
        handle: { title: "Analysis" }
      },
      { 
        path: "/map", 
        element: <Map />,
        handle: { title: "Map" }
      },
      { 
        path: "/meter/:meterId", 
        element: <MeterDetail />,
        handle: { title: "Meter Details" }
      },
    ],
  },
]);


export default function App() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  const { fetchMeters } = useMeterStore();

  useEffect(() => {
    const init = async () => {
      await initializeAuth();

      // Fetch meters only if logged in
      // if (useAuthStore.getState().isAuthenticated) {
        fetchMeters();
      // }
    };

    init();
  }, [initializeAuth, fetchMeters]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
