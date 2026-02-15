import { useEffect, useState, useRef } from "react";
import {
	Server, RefreshCw, Map
} from "lucide-react";
import { axiosInstance } from "@/lib/api_provider";
import { MapView } from "./MapView";
import { AddMeterForm } from "./AddMeterForm";
import { MeterCard } from "./MeterCards";
import { ConfirmDialog } from "./ConfirmDialog";
import type { Meter } from "@/lib/types";


interface MeterEditsTabProps {
	onMessage: (type: "success" | "error", text: string) => void;
}

type EditMode = "list" | "map";


interface ModeToggleHeaderProps {
	metersCount: number;
	editMode: EditMode;
	onModeChange: (mode: EditMode) => void;
}

function ModeToggleHeader({ metersCount, editMode, onModeChange }: ModeToggleHeaderProps) {
	return (
		<div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-bold text-slate-900">Meter Management</h3>
					<p className="text-sm text-slate-600 mt-1">
						{metersCount} meter{metersCount !== 1 ? 's' : ''} configured
					</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => onModeChange("list")}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${editMode === "list"
							? "bg-blue-600 text-white"
							: "bg-slate-100 text-slate-700 hover:bg-slate-200"
							}`}
					>
						<Server className="w-4 h-4" />
						List View
					</button>
					<button
						onClick={() => onModeChange("map")}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${editMode === "map"
							? "bg-blue-600 text-white"
							: "bg-slate-100 text-slate-700 hover:bg-slate-200"
							}`}
					>
						<Map className="w-4 h-4" />
						Map View
					</button>
				</div>
			</div>
		</div>
	);
}



function EmptyState() {
	return (
		<div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm text-center">
			<Server className="w-12 h-12 text-slate-300 mx-auto mb-3" />
			<p className="text-slate-600 font-medium">No meters configured</p>
			<p className="text-sm text-slate-500 mt-1">Add your first meter to get started</p>
		</div>
	);
}




export default function MeterEditsTab({ onMessage }: MeterEditsTabProps) {
	const [meters, setMeters] = useState<Meter[]>([]);
	const [localMeters, setLocalMeters] = useState<Meter[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAddMeter, setShowAddMeter] = useState(false);
	const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [editMode, setEditMode] = useState<EditMode>("list");
	const [hasMapChanges, setHasMapChanges] = useState(false);
	const [confirmDialog, setConfirmDialog] = useState<{
		type: "add" | "delete" | "update";
		meter?: Meter;
		confirmText: string;
		action: () => Promise<void>;
	} | null>(null);
	const [confirmInput, setConfirmInput] = useState("");
	const imageRef = useRef<HTMLDivElement>(null);

	const [newMeter, setNewMeter] = useState({
		Name: "",
		sn: "",
	});

	const fetchMeters = async () => {
		try {
			setLoading(true);
			const res = await axiosInstance.get("/meter");
			const fetchedMeters = res.data.data;
			setMeters(fetchedMeters);
			setLocalMeters(fetchedMeters.map((m: Meter) => ({
				...m,
				x: m.x ?? 50,
				y: m.y ?? 50
			})));
		} catch (err) {
			console.error(err);
			onMessage("error", "Failed to load meters");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchMeters();
	}, []);

	const handleImageClick = (e: { clientX: number; clientY: number; }) => {
		if (!selectedMeter || !imageRef.current) return;

		const rect = imageRef.current.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;

		setLocalMeters(
			localMeters.map((m) =>
				m.meter_id === selectedMeter.meter_id
					? { ...m, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
					: m
			)
		);
		setHasMapChanges(true);
	};

	const handleSaveMapLocations = async () => {
		try {
			setActionLoading("save-map");
			const locations = localMeters.map(m => ({
				meter_id: m.meter_id,
				x: m.x ?? 50,
				y: m.y ?? 50
			}));

			await axiosInstance.put("/meter/edit/locations", { locations });

			onMessage("success", "Map locations saved successfully!");
			setHasMapChanges(false);
			await fetchMeters();
		} catch (err: any) {
			onMessage("error", err.response?.data?.detail || "Failed to save locations");
		} finally {
			setActionLoading(null);
		}
	};

	const handleResetMap = () => {
		setLocalMeters(meters.map(m => ({
			...m,
			x: m.x ?? 50,
			y: m.y ?? 50
		})));
		setHasMapChanges(false);
		setSelectedMeter(null);
	};

	const handleAddMeter = async () => {
		const confirmText = `add ${newMeter.Name}`;
		setConfirmDialog({
			type: "add",
			confirmText,
			action: async () => {
				try {
					setActionLoading("add-meter");
					await axiosInstance.post("/meter/edit/addmeter", newMeter);
					onMessage("success", `Meter "${newMeter.Name}" added successfully`);
					setShowAddMeter(false);
					setNewMeter({ Name: "", sn: "" });
					setConfirmDialog(null);
					setConfirmInput("");
					await fetchMeters();
				} catch (err: any) {
					onMessage("error", err.response?.data?.detail || "Failed to add meter");
				} finally {
					setActionLoading(null);
				}
			}
		});
	};

	const handleDeleteMeter = (meter: Meter) => {
		const confirmText = `delete ${meter.name}`;
		setConfirmDialog({
			type: "delete",
			meter,
			confirmText,
			action: async () => {
				try {
					setActionLoading(`delete-${meter.sn}`);

					// Call the delete API
					const response = await axiosInstance.delete(`/meter/edit/${meter.sn}`);

					// Check if deletion was successful
					if (response.data.success) {
						onMessage("success", `Meter "${meter.name}" deleted successfully`);

						// Close dialog and reset input
						setConfirmDialog(null);
						setConfirmInput("");

						// Refresh the meters list
						await fetchMeters();
					} else {
						throw new Error(response.data.message || "Deletion failed");
					}
				} catch (err: any) {
					console.error("Delete error:", err);
					const errorMessage = err.response?.data?.detail || err.message || "Failed to delete meter";
					onMessage("error", errorMessage);

					// Keep dialog open on error so user can retry
				} finally {
					setActionLoading(null);
				}
			}
		});
	};


	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<RefreshCw className="w-5 h-5 animate-spin text-slate-600 mr-3" />
				<span className="text-slate-600">Loading meters...</span>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Confirmation Dialog */}
			{confirmDialog && (
				<ConfirmDialog
					type={confirmDialog.type}
					confirmText={confirmDialog.confirmText}
					confirmInput={confirmInput}
					actionLoading={actionLoading}
					onConfirmInputChange={setConfirmInput}
					onConfirm={() => {
						if (confirmInput === confirmDialog.confirmText) {
							confirmDialog.action();
						}
					}}
					onCancel={() => {
						setConfirmDialog(null);
						setConfirmInput("");
					}}
				/>
			)}

			{/* Mode Toggle */}
			<ModeToggleHeader
				metersCount={meters.length}
				editMode={editMode}
				onModeChange={setEditMode}
			/>

			{/* List View */}
			{editMode === "list" && (
				<>
					{/* Add Meter Section */}
					<AddMeterForm
						showAddMeter={showAddMeter}
						newMeter={newMeter}
						onToggle={() => setShowAddMeter(!showAddMeter)}
						onMeterChange={setNewMeter}
						onSubmit={handleAddMeter}
					/>

					{/* Meters List */}
					{meters.length === 0 ? (
						<EmptyState />
					) : (
						<div className="space-y-3">
							{meters.map((meter) => (
								<MeterCard
									key={meter.meter_id}
									meter={meter}
									onDelete={() => handleDeleteMeter(meter)}
								/>
							))}
						</div>
					)}
				</>
			)}

			{/* Map View */}
			{editMode === "map" && (
				<MapView
					localMeters={localMeters}
					selectedMeter={selectedMeter}
					hasMapChanges={hasMapChanges}
					actionLoading={actionLoading}
					imageRef={imageRef}
					onImageClick={handleImageClick}
					onSelectMeter={setSelectedMeter}
					onSaveMap={handleSaveMapLocations}
					onResetMap={handleResetMap}
				/>
			)}
		</div>
	);
}