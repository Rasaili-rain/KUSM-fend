import { useState, useRef } from "react";
import { X, MapPin, Zap, AlertTriangle, Activity, Layers, Thermometer } from "lucide-react";
import { useMeterStore } from "@/stores/meterStore";
import type { Meter, MeterData } from "@/utils/types";
import { useLatestDataStore } from "@/stores/latestDataStore";

const VOLTAGE_LIMITS = {
  normal: { min: 200, max: 220 },
  warning: { min: 180, max: 240 },
  critical: null, // everything else
};

// Helper function to get voltage status
const getVoltageStatus = (voltage: number): "critical" | "warning" | "normal" => {
  if (voltage >= VOLTAGE_LIMITS.normal.min && voltage <= VOLTAGE_LIMITS.normal.max) return "normal";
  if (voltage >= VOLTAGE_LIMITS.warning.min && voltage <= VOLTAGE_LIMITS.warning.max) return "warning";
  return "critical";
};

function LayerToggleButton({
  layer,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  layer: "markers" | "voltageAlerts" | "outages";
  label: string;
  icon: any;
  active: boolean;
  onClick: (layer: "markers" | "voltageAlerts" | "outages") => void;
}) {
  return (
    <button
      onClick={() => onClick(layer)}
      className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all font-medium ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = "blue",
}: {
  icon: any;
  label: string;
  value: string | number;
  color?: "blue" | "green" | "yellow" | "red";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className={`rounded-lg p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function VoltageLegend() {
  return (
    <div className="space-y-2">
      <div className="font-semibold text-sm">Voltage Status</div>
      <div className="space-y-2">
        {[
          {
            icon: MapPin,
            color: "text-green-600 fill-green-200",
            label: "Normal",
            detail: `${VOLTAGE_LIMITS.normal.min}-${VOLTAGE_LIMITS.normal.max}V`,
          },
          {
            icon: MapPin,
            color: "text-yellow-600 fill-yellow-200",
            label: "Warning",
            detail: `${VOLTAGE_LIMITS.warning.min}-${VOLTAGE_LIMITS.warning.max}V`,
          },
          {
            icon: MapPin,
            color: "text-red-600 fill-red-200",
            label: "Critical",
            detail: `<${VOLTAGE_LIMITS.warning.min}V or >${VOLTAGE_LIMITS.warning.max}V`,
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-3">
              <Icon className={`w-6 h-6 ${item.color}`} />
              <div className="flex-1">
                <div className="text-xs font-medium">{item.label}</div>
                <div className="text-xs text-gray-500">{item.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OutageLegend() {
  return (
    <div className="space-y-2">
      <div className="font-semibold text-sm">Outage</div>
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-gray-600 fill-gray-300" />
        <div className="flex-1">
          <div className="text-xs font-medium">No Power</div>
          <div className="text-xs text-gray-500">Meter offline</div>
        </div>
      </div>
    </div>
  );
}

function MapLegend({
  activeLayers,
}: {
  activeLayers: {
    markers: boolean;
    voltageAlerts: boolean;
    outages: boolean;
  };
}) {
  const hasActiveLegends = activeLayers.voltageAlerts || activeLayers.outages;

  if (!hasActiveLegends) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-2 text-gray-400">
          <Layers className="w-5 h-5" />
          <span className="font-semibold">Map Legend</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-gray-700" />
        <span className="font-bold text-gray-800">Map Legend</span>
      </div>

      <div className="space-y-6">
        {activeLayers.voltageAlerts && <VoltageLegend />}
        {activeLayers.outages && <OutageLegend />}
      </div>
    </div>
  );
}

function MeterMarker({
  meter,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  colorClass,
  showOutageIcon,
  power,
  avgVoltage,
  isOutageActive,
}: {
  meter: Meter;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  colorClass: string;
  showOutageIcon: boolean;
  power: number;
  avgVoltage?: number;
  isOutageActive: boolean;
}) {
  const Icon = showOutageIcon ? AlertTriangle : MapPin;

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 group z-10 ${
        isSelected ? "scale-125 animate-pulse" : ""
      }`}
      style={{
        left: `${meter.x}%`,
        top: `${meter.y}%`,
      }}
    >
      <Icon className={`w-8 h-8 ${colorClass} drop-shadow-lg`} />

      {isHovered && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg shadow-2xl p-3 whitespace-nowrap z-20 min-w-48 border border-gray-700">
          <div className="font-bold mb-2 text-sm">{meter.name}</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Power:</span>
              <span className="font-semibold">{power.toFixed(1)} kW</span>
            </div>
            {avgVoltage !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Voltage:</span>
                <span className="font-semibold">{avgVoltage} V</span>
              </div>
            )}
            {isOutageActive && <div className="text-red-400 font-bold pt-1 border-t border-gray-700">⚠ OUTAGE</div>}
          </div>
        </div>
      )}
    </button>
  );
}

function MapImageAndOverlays({
  imageRef,
  metersWithLocation,
  activeLayers,
  selectedMeter,
  hoveredMeter,
  setSelectedMeter,
  setHoveredMeter,
  getMarkerColor,
  getPowerLevel,
  isOutage,
  getVoltageStatus,
}: any) {
  return (
    <div className="relative inline-block">
      <div ref={imageRef} className="relative border-2 border-gray-300 rounded-xl shadow-xl overflow-hidden">
        <img
          src="/KuMap.png"
          alt="Campus Map"
          className="block max-w-none"
          style={{ width: "800px", height: "600px" }}
        />

        {/* Markers */}
        {activeLayers.markers &&
          metersWithLocation.map((meter: Meter) => {
            const isOut = isOutage(meter.meter_id);
            const colorClass = getMarkerColor(meter);
            const showOutageIcon = isOut && activeLayers.outages;
            const power = getPowerLevel(meter.meter_id);
            const avgVoltage = getVoltageStatus(meter.meter_id);

            return (
              <MeterMarker
                key={meter.meter_id}
                meter={meter}
                isSelected={selectedMeter?.meter_id === meter.meter_id}
                isHovered={hoveredMeter?.meter_id === meter.meter_id}
                onClick={() => setSelectedMeter(meter)}
                onMouseEnter={() => setHoveredMeter(meter)}
                onMouseLeave={() => setHoveredMeter(null)}
                colorClass={colorClass}
                showOutageIcon={showOutageIcon}
                power={power}
                avgVoltage={avgVoltage}
                isOutageActive={isOut && activeLayers.outages}
              />
            );
          })}
      </div>
    </div>
  );
}

function MeterDetailSidebar({
  meter,
  onClose,
  isOutage,
  meterData,
  getPowerLevel,
  getVoltageStatus,
}: {
  meter: Meter | null;
  onClose: () => void;
  isOutage: (id: number) => boolean;
  meterData: MeterData | undefined;
  getPowerLevel: (id: number) => number;
  getVoltageStatus: (id: number) => string;
}) {
  if (!meter || !meterData) {
    return (
      <div className="w-96 bg-linear-to-br from-gray-50 to-white shadow-2xl border-l border-gray-200">
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Meter Selected</h3>
          <p className="text-sm text-gray-500">Click on a meter marker to view detailed information</p>
        </div>
      </div>
    );
  }

  const outage = isOutage(meter.meter_id);
  const voltageStatus = getVoltageStatus(meter.meter_id);
  const totalPower = getPowerLevel(meter.meter_id);

  return (
    <div className="w-96 bg-gradient-to-br from-white to-gray-50 shadow-2xl border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <div className="flex justify-between items-start mb-3">
          <p className="text-2xl font-bold">{meter.name}</p>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-lg p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-sm text-blue-100 font-mono">SN: {meter.sn}</p>
        <p className="text-xs text-blue-200">ID: {meter.meter_id}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {outage ? (
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 text-red-700 font-bold text-lg mb-2">
              <AlertTriangle className="w-6 h-6" />
              OUTAGE DETECTED
            </div>
            <p className="text-sm text-red-600">
              No power reading available. The meter may be offline or experiencing connectivity issues.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={Zap}
                label="Power"
                value={`${totalPower.toFixed(1)}kW`}
                color={totalPower > 25 ? "red" : totalPower > 18 ? "yellow" : "green"}
              />
              <StatCard
                icon={Activity}
                label="Status"
                value={voltageStatus === "normal" ? "Normal" : voltageStatus === "warning" ? "Warning" : "Critical"}
                color={voltageStatus === "normal" ? "green" : voltageStatus === "warning" ? "yellow" : "red"}
              />
            </div>

            {/* Current Data */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Zap className="w-5 h-5 text-yellow-600" />
                Current (A)
              </h3>
              <div className="space-y-3">
                {[
                  { phase: "A", value: meterData.phase_A_current, color: "bg-red-500" },
                  { phase: "B", value: meterData.phase_B_current, color: "bg-yellow-500" },
                  { phase: "C", value: meterData.phase_C_current, color: "bg-blue-500" },
                ].map(({ phase, value, color }) => (
                  <div key={phase} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Phase {phase}</span>
                      <span className="font-mono font-bold text-gray-900">{value.toFixed(2)} A</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} transition-all duration-300`}
                        style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voltage Data */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Activity className="w-5 h-5 text-green-600" />
                Voltage (V)
              </h3>
              <div className="space-y-3">
                {[
                  { phase: "A", value: meterData.phase_A_voltage, color: "bg-red-500" },
                  { phase: "B", value: meterData.phase_B_voltage, color: "bg-yellow-500" },
                  { phase: "C", value: meterData.phase_C_voltage, color: "bg-blue-500" },
                ].map(({ phase, value, color }) => (
                  <div key={phase} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Phase {phase}</span>
                      <span className="font-mono font-bold text-gray-900">{value.toFixed(2)} V</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} transition-all duration-300`}
                        style={{ width: `${((value - 180) / (250 - 180)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {voltageStatus !== "normal" && (
                <div
                  className={`mt-4 p-3 rounded-lg ${
                    voltageStatus === "critical"
                      ? "bg-red-50 border border-red-200 text-red-700"
                      : "bg-yellow-50 border border-yellow-200 text-yellow-700"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    Voltage outside normal range
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Map() {
  const { meters, error} = useMeterStore();
  const { meterDataMap, isLoading } = useLatestDataStore();

  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [hoveredMeter, setHoveredMeter] = useState<Meter | null>(null);
  const [activeLayers, setActiveLayers] = useState({
    markers: true,
    voltageAlerts: true,
    outages: true,
  });

  const imageRef = useRef<HTMLDivElement>(null);

  const toggleLayer = (layer: "markers" | "voltageAlerts" | "outages") => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const getVoltageStatusForMeter = (meterId: number): "critical" | "warning" | "normal" => {
    const data = meterDataMap[meterId];
    if (!data) return "normal";

    const avg = (data.phase_A_voltage + data.phase_B_voltage + data.phase_C_voltage) / 3;
    return getVoltageStatus(avg);
  };

  const getPowerLevel = (meterId: number) => {
    const data = meterDataMap[meterId];
    if (!data) return 0;
    return (
      ((data.phase_A_active_power || 0) + (data.phase_B_active_power || 0) + (data.phase_C_active_power || 0)) / 1000
    );
  };

  const isOutageFn = (meterId: number): boolean => {
    const data = meterDataMap[meterId];
    if (!data) return false;
    return (
      data.phase_A_current === 0 &&
      data.phase_B_current === 0 &&
      data.phase_C_current === 0
    );
  };

  const getMarkerColor = (meter: Meter) => {
    if (activeLayers.outages && isOutageFn(meter.meter_id)) return "text-gray-600 fill-gray-300";

    if (activeLayers.voltageAlerts) {
      const status = getVoltageStatusForMeter(meter.meter_id);
      if (status === "critical") return "text-red-600 fill-red-200";
      if (status === "warning") return "text-yellow-600 fill-yellow-200";
      return "text-green-600 fill-green-200";
    }
    return selectedMeter?.meter_id === meter.meter_id ? "text-blue-600 fill-blue-200" : "text-green-600 fill-green-200";
  };

  // Calculate global statistics
  const totalPower = meters.reduce((sum, m) => sum + getPowerLevel(m.meter_id), 0);
  const activeMeters = meters.filter((m) => !isOutageFn(m.meter_id)).length;
  const criticalAlerts = meters.filter((m) => getVoltageStatusForMeter(m.meter_id) === "critical").length;

  const avgVoltage =
    meters.length > 0
      ? meters.reduce((sum, m) => {
          const data = meterDataMap[m.meter_id];
          if (!data) return sum;
          return sum + (data.phase_A_voltage + data.phase_B_voltage + data.phase_C_voltage) / 3;
        }, 0) / meters.length
      : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading map data...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching meter information</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-gray-100">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
          <div className="text-center mb-4">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
            <p className="text-red-600 font-mono text-sm">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-all font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const metersWithLocation = meters.filter((m) => m.x != null && m.y != null);
  const meterId = selectedMeter?.meter_id;
  const meterData = meterId ? meterDataMap[meterId] : undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-md border-b border-gray-200 p-4 shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                icon={Zap}
                label="Total Power"
                value={`${totalPower.toFixed(1)} kW`}
                color={totalPower > 100 ? "red" : totalPower > 75 ? "yellow" : "green"}
              />
              <StatCard icon={Activity} label="Active Meters" value={`${activeMeters}/${meters.length}`} color="blue" />
              <StatCard
                icon={AlertTriangle}
                label="Critical Alerts"
                value={criticalAlerts}
                color={criticalAlerts > 0 ? "red" : "green"}
              />
              <StatCard
                icon={Thermometer}
                label="Avg Voltage"
                value={`${avgVoltage.toFixed(1)} V`}
                color={
                  getVoltageStatus(avgVoltage) === "critical"
                    ? "red"
                    : getVoltageStatus(avgVoltage) === "warning"
                    ? "yellow"
                    : "green"
                }
              />
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto h-full">
            <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col">
              {/* Layer Controls */}
              <div className="mb-6">
                <div className="flex gap-2 flex-wrap">
                  <LayerToggleButton
                    layer="markers"
                    label="Markers"
                    icon={MapPin}
                    active={activeLayers.markers}
                    onClick={toggleLayer}
                  />
                  <LayerToggleButton
                    layer="voltageAlerts"
                    label="Voltage"
                    icon={Zap}
                    active={activeLayers.voltageAlerts}
                    onClick={toggleLayer}
                  />
                  <LayerToggleButton
                    layer="outages"
                    label="Outages"
                    icon={AlertTriangle}
                    active={activeLayers.outages}
                    onClick={toggleLayer}
                  />
                </div>
              </div>

              {/* Warning for no locations */}
              {metersWithLocation.length === 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800 text-sm">
                    No meter locations configured. Please use the admin panel to set locations.
                  </p>
                </div>
              )}

              <div className="flex-1 flex gap-6 items-start min-h-0">
                {/* Map Container */}
                <div className="flex-1 flex items-center justify-center">
                  <MapImageAndOverlays
                    imageRef={imageRef}
                    metersWithLocation={metersWithLocation}
                    activeLayers={activeLayers}
                    selectedMeter={selectedMeter}
                    hoveredMeter={hoveredMeter}
                    setSelectedMeter={setSelectedMeter}
                    setHoveredMeter={setHoveredMeter}
                    getMarkerColor={getMarkerColor}
                    getPowerLevel={getPowerLevel}
                    getVoltageStatus={getVoltageStatusForMeter}
                    isOutage={isOutageFn}
                  />
                </div>

                <MapLegend activeLayers={activeLayers} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}

      <MeterDetailSidebar
        meter={selectedMeter}
        onClose={() => setSelectedMeter(null)}
        isOutage={isOutageFn}
        meterData={meterData}
        getPowerLevel={getPowerLevel}
        getVoltageStatus={getVoltageStatusForMeter}
      />
    </div>
  );
}
