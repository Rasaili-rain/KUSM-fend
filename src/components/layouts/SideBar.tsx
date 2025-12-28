import {
  LayoutDashboard,
  BarChart3,
  Map,
  Gauge,
  Box,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useMeterStore } from "@/stores/meterStore";

export default function SideBar() {
  const location = useLocation();
  const meters = useMeterStore((state) => state.meters);

  const mainMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Analysis", icon: BarChart3, path: "/analysis" },
    { name: "Map", icon: Map, path: "/map" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 h-screen bg-gray-50 text-gray-700 flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800">
          Smart Meter
        </h1>
      </div>

      {/* Main Navigation */}
      <div className="px-4 py-4">
        <nav className="space-y-1">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition ${
                  active
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Available Meters */}
      <div className="px-4 py-2 flex-1 overflow-y-auto">
        <h2 className="text-xs font-medium text-gray-500 px-3 py-2">
          Available Meters
        </h2>

        <div className="space-y-1">
          {meters.map((meter) => {
            const path = `/meter/${meter.meter_id}`;
            const active = isActive(path);

            return (
              <Link
                key={meter.meter_id}
                to={path}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition ${
                  active
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "hover:bg-gray-100"
                }`}
                state={{ title: meter.name }}
              >
                <Gauge className="w-4 h-4" />
                <span className="truncate">{meter.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
