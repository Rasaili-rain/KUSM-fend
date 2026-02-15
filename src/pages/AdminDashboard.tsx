import { useEffect, useState } from "react";
import { Play, Pause, Zap, RefreshCw, Clock, Calendar, Activity, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { axiosInstance } from "@/lib/api_provider";

interface Schedule {
  start_time: string;
  end_time: string;
  interval_minutes: number;
}

interface Status {
  is_running: boolean;
  schedule: Schedule | null;
  last_run: string | null;
  next_run: string | null;
  is_within_schedule: boolean | null;
}

export default function AdminDashboard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    startTime: "08:00",
    endTime: "18:00",
    interval: 5,
  });

  const fetchStatus = async () => {
    try {
      const res = await axiosInstance.get("/data-collection/status");
      setStatus(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleStart = async () => {
    try {
      setActionLoading("start");
      await axiosInstance.post("/data-collection/start", {
        start_time: formData.startTime,
        end_time: formData.endTime,
        interval_minutes: formData.interval,
      });
      showMessage("success", "Data collection started successfully");
      setShowForm(false);
      await fetchStatus();
    } catch (err: any) {
      showMessage("error", err.response?.data?.detail || "Failed to start collection");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStop = async () => {
    try {
      setActionLoading("stop");
      await axiosInstance.post("/data-collection/stop");
      showMessage("success", "Data collection stopped");
      await fetchStatus();
    } catch (err: any) {
      showMessage("error", err.response?.data?.detail || "Failed to stop collection");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunNow = async () => {
    try {
      setActionLoading("run");
      await axiosInstance.post("/data-collection/run-now");
      showMessage("success", "Collection executed successfully");
      await fetchStatus();
    } catch (err: any) {
      showMessage("error", err.response?.data?.detail || "Failed to execute collection");
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return "Not available";
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeUntilNext = () => {
    if (!status?.next_run || !status?.is_running) return null;
    const now = new Date().getTime();
    const next = new Date(status.next_run).getTime();
    const diff = Math.max(0, next - now);

    if (diff === 0) return "Running now...";

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const getTimeSinceLast = () => {
    if (!status?.last_run) return null;
    const now = new Date().getTime();
    const last = new Date(status.last_run).getTime();
    const diff = Math.max(0, now - last);

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    if (minutes === 0) {
      return "Just now";
    }
    return `${minutes}m ago`;
  };

  const [countdown, setCountdown] = useState(getTimeUntilNext());
  const [timeSince, setTimeSince] = useState(getTimeSinceLast());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilNext());
      setTimeSince(getTimeSinceLast());
    }, 1000);
    return () => clearInterval(timer);
  }, [status?.next_run, status?.last_run, status?.is_running]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-slate-600" />
          <span className="text-slate-600 font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Data Collection
              </h1>
            </div>
            <button
              onClick={fetchStatus}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-6">
        {/* Message Toast */}
        {message && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
              } animate-in slide-in-from-top duration-300`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Collection Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-3 rounded-xl ${status?.is_running
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-slate-100 text-slate-600"
                  }`}
              >
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-600">Status</div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`w-2 h-2 rounded-full ${status?.is_running ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                      }`}
                  />
                  <span className="text-lg font-bold text-slate-900">
                    {status?.is_running ? "Running" : "Stopped"}
                  </span>
                </div>
              </div>
            </div>
            {status?.is_running && status.is_within_schedule === false && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-xs font-medium text-amber-900">Outside schedule window</span>
              </div>
            )}
          </div>

          {/* Schedule Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-600">Schedule</div>
                <div className="text-lg font-bold text-slate-900 mt-1">
                  {status?.schedule
                    ? `${status.schedule.start_time} – ${status.schedule.end_time}`
                    : "No schedule"}
                </div>
              </div>
            </div>
          </div>

          {/* Interval */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-600">Interval</div>
                <div className="text-lg font-bold text-slate-900 mt-1">
                  {status?.schedule ? `Every ${status.schedule.interval_minutes} min` : "Not set"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Collection Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Last Run */}
            <div className="relative pl-6 border-l-2 border-slate-200">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white" />
              <div className="text-sm font-semibold text-slate-600 mb-1">Last Collection</div>
              {status?.last_run ? (
                <>
                  <div className="text-base font-bold text-slate-900">
                    {formatTime(status.last_run)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {timeSince}
                  </div>
                </>
              ) : (
                <div className="text-base font-medium text-slate-500">
                  No collections yet
                </div>
              )}
            </div>

            {/* Next Run */}
            <div className="relative pl-6 border-l-2 border-slate-200">
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white ${status?.is_running ? "bg-blue-500 animate-pulse" : "bg-slate-300"
                }`} />
              <div className="text-sm font-semibold text-slate-600 mb-1">Next Collection</div>
              {status?.is_running && status?.next_run ? (
                <>
                  <div className="text-base font-bold text-slate-900">
                    {formatTime(status.next_run)}
                  </div>
                  {countdown && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        in {countdown}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-base font-medium text-slate-500">
                  {status?.is_running ? "Calculating..." : "Collection stopped"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Controls</h3>

          <div className="flex flex-wrap gap-3 mb-6">
            {!status?.is_running ? (
              <button
                onClick={() => setShowForm(!showForm)}
                disabled={actionLoading === "start"}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === "start" ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Start Collection
              </button>
            ) : (
              <button
                onClick={handleStop}
                disabled={actionLoading === "stop"}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === "stop" ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
                Stop Collection
              </button>
            )}

            <button
              onClick={handleRunNow}
              disabled={actionLoading === "run"}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === "run" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Run Now
            </button>
          </div>

          {/* Schedule Form */}
          {showForm && (
            <div className="border-t border-slate-200 pt-6 space-y-4 animate-in slide-in-from-top duration-300">
              <h4 className="font-semibold text-slate-900">Configure Schedule</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Interval (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={formData.interval}
                    onChange={(e) =>
                      setFormData({ ...formData, interval: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleStart}
                  disabled={actionLoading === "start"}
                  className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === "start" ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Starting...
                    </span>
                  ) : (
                    "Start with Schedule"
                  )}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 text-sm text-blue-900">
              <p className="font-semibold mb-1">Collection Info</p>
              <p className="text-blue-700">
                Data is automatically collected from all configured meters during the scheduled time window.
                Use "Run Now" to trigger an immediate collection outside the schedule.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}