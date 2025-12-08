import { useState, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuthStore } from "@stores/authStore";
import { api } from "@utils/api";
import Login from "@pages/Login";
import Dashboard from "@pages/Dashboard-bak";
import MasterLayout from "@components/layouts/MasterLayout";


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
    handle: { title: "Dashboard" },
    children: [
      { path: "/", element: <Dashboard /> }
    ],
  },
]);


export default function App() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    initializeAuth();
    api
      .healthCheck()
      .then(setApiHealthy)
      .catch(() => setApiHealthy(false));
  }, [initializeAuth]);

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
      <div
        className="fixed top-2 right-2 w-3 h-3 rounded-full border border-gray-300"
        style={{
          backgroundColor: apiHealthy === null ? "gray" : apiHealthy ? "green" : "red",
        }}
        title={apiHealthy === null ? "Checking API..." : apiHealthy ? "API is healthy" : "API offline"}
      />
      <RouterProvider router={router} />
    </>
  );
}
