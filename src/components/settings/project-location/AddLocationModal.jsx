"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import ExpandableTextField from "@/components/common/ExpandableTextField";

const LOCATION_TYPES = [
    { value: "Store", label: "Store" },
    { value: "Use", label: "Use To" },
];

const SECTIONS = [
    { type: "Store", label: "Store Locations", color: "#d6e6f2" },
    { type: "Use",   label: "Use To Locations", color: "#d6f2e0" },
];

function LocationSection({
    section,
    items,
    onAdd,
    onEdit,
    onDeleteClick,
    adding,
    editingId,
    editValues,
    setEditValues,
    onEditSave,
    onEditCancel,
    addValues,
    setAddValues,
    onAddSave,
    onAddCancel,
    saving,
}) {
    return (
        <div className="flex flex-col border border-[#cfcfcf] rounded-sm overflow-hidden">
            {/* Section header */}
            <div
                className="px-3 py-2 font-semibold text-[13px] border-b border-[#cfcfcf] flex items-center justify-between"
                style={{ background: section.color }}
            >
                <span>{section.label}</span>
                <span className="text-[11px] font-normal text-gray-500">
                    {items.length} {items.length === 1 ? "entry" : "entries"}
                </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto bg-white min-h-[120px]">
                {items.length === 0 && !adding ? (
                    <div className="flex items-center justify-center h-[120px] text-[12px] text-gray-400">
                        No {section.label.toLowerCase()} added yet
                    </div>
                ) : (
                    items.map((item, idx) => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-2 px-3 py-2 border-b border-[#f0f0f0] text-[13px] ${idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}
                        >
                            {editingId === item.id ? (
                                // Inline edit row
                                <>
                                    <span className="text-[11px] text-gray-400 w-4 shrink-0">{idx + 1}.</span>
                                    <input
                                        autoFocus
                                        value={editValues.locationName}
                                        onChange={(e) => setEditValues((p) => ({ ...p, locationName: e.target.value }))}
                                        placeholder="Location name"
                                        className="flex-1 min-w-[80px] h-[28px] border border-[#8f8f8f] rounded-sm px-2 text-[12px] outline-none focus:border-blue-400"
                                    />
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={onEditSave}
                                        className="h-[28px] px-2 bg-blue-500 hover:bg-blue-600 text-white rounded-sm text-[11px] disabled:opacity-50 flex items-center gap-1"
                                    >
                                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onEditCancel}
                                        className="h-[28px] px-2 border border-gray-300 hover:bg-gray-100 rounded-sm text-[11px] flex items-center gap-1"
                                    >
                                        <X size={12} /> Cancel
                                    </button>
                                </>
                            ) : (
                                // Normal row
                                <>
                                    <span className="text-[11px] text-gray-400 w-4 shrink-0">{idx + 1}.</span>
                                    <span className="flex-1 truncate">{item.locationName}</span>
                                    <button
                                        type="button"
                                        onClick={() => onEdit(item)}
                                        className="p-1 rounded-sm hover:bg-blue-50 border border-transparent hover:border-blue-200 transition text-blue-600"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDeleteClick(item)}
                                        className="p-1 rounded-sm hover:bg-red-50 border border-transparent hover:border-red-200 transition text-red-500"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </>
                            )}
                        </div>
                    ))
                )}

                {/* Inline add row */}
                {adding && (
                    <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-t border-[#e0e0e0] bg-[#f7fbff]">
                        <input
                            autoFocus
                            value={addValues.locationName}
                            onChange={(e) => setAddValues((p) => ({ ...p, locationName: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") onAddSave(); if (e.key === "Escape") onAddCancel(); }}
                            placeholder={`${section.label.replace(" Locations", "")} name *`}
                            className="flex-1 min-w-[100px] h-[28px] border border-[#8f8f8f] rounded-sm px-2 text-[12px] outline-none focus:border-blue-400"
                        />
                        <button
                            type="button"
                            disabled={saving}
                            onClick={onAddSave}
                            className="h-[28px] px-2 bg-blue-500 hover:bg-blue-600 text-white rounded-sm text-[11px] disabled:opacity-50 flex items-center gap-1 shrink-0"
                        >
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={onAddCancel}
                            className="h-[28px] px-2 border border-gray-300 hover:bg-gray-100 rounded-sm text-[11px] flex items-center gap-1 shrink-0"
                        >
                            <X size={12} /> Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* Add button */}
            {!adding && (
                <button
                    type="button"
                    onClick={onAdd}
                    className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-blue-600 hover:bg-blue-50 border-t border-[#cfcfcf] transition"
                >
                    <Plus size={13} /> Add {section.label.replace(" Locations", "")}
                </button>
            )}
        </div>
    );
}

export default function AddLocationModal({ open, onOpenChange, projectCode, projectData }) {
    const [locations, setLocations] = useState([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Per-section add state
    const [addingType, setAddingType] = useState(null); // "Store" | "Use" | null
    const [addValues, setAddValues] = useState({ locationName: "" });

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({ locationName: "", locationType: "" });

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchLocations = async () => {
        if (!projectCode) return;
        try {
            setLocationLoading(true);
            const res = await apiRequest({
                url: `${API_ENDPOINTS.SETTINGS.PROJECT_LOCATION.LIST}/${projectCode}`,
                method: "GET",
            });
            setLocations(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            if (err?.response?.status === 404) { setLocations([]); return; }
            toast.error(err?.response?.data?.message || err.message || "Failed to fetch locations");
            setLocations([]);
        } finally {
            setLocationLoading(false);
        }
    };

    useEffect(() => {
        if (open && projectCode) fetchLocations();
    }, [open, projectCode]);

    // Add
    const handleStartAdd = (type) => {
        setEditingId(null);
        setAddingType(type);
        setAddValues({ locationName: "" });
    };

    const handleAddSave = async () => {
        if (!addValues.locationName.trim()) {
            toast.warning("Location name is required");
            return;
        }
        try {
            setSaving(true);
            await apiRequest({
                url: API_ENDPOINTS.SETTINGS.PROJECT_LOCATION.CREATE,
                method: "POST",
                data: {
                    projectCode,
                    locationName: addValues.locationName.trim(),
                    locationType: addingType,
                },
            });
            toast.success("Location added");
            setAddingType(null);
            setAddValues({ locationName: "" });
            fetchLocations();
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message || "Failed to add location");
        } finally {
            setSaving(false);
        }
    };

    const handleAddCancel = () => {
        setAddingType(null);
        setAddValues({ locationName: "" });
    };

    // Edit
    const handleEditClick = (item) => {
        setAddingType(null);
        setEditingId(item.id);
        setEditValues({ locationName: item.locationName, locationType: item.locationType });
    };

    const handleEditSave = async () => {
        if (!editValues.locationName.trim()) {
            toast.warning("Location name is required");
            return;
        }
        try {
            setSaving(true);
            await apiRequest({
                url: `${API_ENDPOINTS.SETTINGS.PROJECT_LOCATION.UPDATE}/${editingId}`,
                method: "PUT",
                data: {
                    locationName: editValues.locationName.trim(),
                    locationType: editValues.locationType,
                },
            });
            toast.success("Location updated");
            setEditingId(null);
            fetchLocations();
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message || "Failed to update location");
        } finally {
            setSaving(false);
        }
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditValues({ locationName: "", locationType: "" });
    };

    // Delete
    const handleDeleteClick = (item) => setDeleteTarget(item);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget?.id) return;
        try {
            setDeleteLoading(true);
            await apiRequest({
                url: `${API_ENDPOINTS.SETTINGS.PROJECT_LOCATION.DELETE}/${deleteTarget.id}`,
                method: "DELETE",
            });
            toast.success("Location deleted");
            setLocations((prev) => prev.filter((l) => l.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message || "Failed to delete location");
        } finally {
            setDeleteLoading(false);
        }
    };

    const storeItems = locations.filter((l) => l.locationType === "Store");
    const useItems   = locations.filter((l) => l.locationType === "Use");

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="!max-w-none !w-auto !p-0 border-0 bg-transparent shadow-none">
                    <div className="w-[95vw] max-w-[860px] bg-white rounded-sm shadow-xl flex flex-col overflow-hidden">

                        {/* Header */}
                        <DialogHeader className="px-4 py-3 border-b border-[#cfcfcf] bg-[#f7f7f7]">
                            <DialogTitle className="text-[14px] font-bold text-black">
                                Project Locations
                            </DialogTitle>
                        </DialogHeader>

                        {/* Project info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1.5 px-4 py-3 border-b border-[#cfcfcf] bg-white">
                            {[
                                ["Project Code", projectCode],
                                ["Project Name", projectData?.projectName || ""],
                                ["Client Name",  projectData?.clientName  || ""],
                            ].map(([label, value]) => (
                                <div key={label} className="flex items-center gap-2 min-w-0">
                                    <div className="px-3 py-1 bg-[#d6e6f2] border border-[#8f8f8f] rounded-sm text-[12px] font-medium whitespace-nowrap shrink-0 h-[30px] flex items-center">
                                        {label}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <ExpandableTextField
                                            value={value}
                                            disabled
                                            title={label}
                                            placeholder="—"
                                            minHeight="min-h-[30px]"
                                            modalHeight="min-h-[80px]"
                                            subHeader=""
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sections */}
                        {locationLoading ? (
                            <div className="flex items-center justify-center h-[200px] text-[13px] text-gray-400 gap-2">
                                <Loader2 size={16} className="animate-spin" /> Loading locations...
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                                {SECTIONS.map((section) => (
                                    <LocationSection
                                        key={section.type}
                                        section={section}
                                        items={section.type === "Store" ? storeItems : useItems}
                                        adding={addingType === section.type}
                                        editingId={editingId}
                                        editValues={editValues}
                                        setEditValues={setEditValues}
                                        onEditSave={handleEditSave}
                                        onEditCancel={handleEditCancel}
                                        addValues={addValues}
                                        setAddValues={setAddValues}
                                        onAdd={() => handleStartAdd(section.type)}
                                        onEdit={handleEditClick}
                                        onDeleteClick={handleDeleteClick}
                                        onAddSave={handleAddSave}
                                        onAddCancel={handleAddCancel}
                                        saving={saving}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="px-4 py-2.5 border-t border-[#cfcfcf] bg-[#f7f7f7] flex justify-end">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="px-4 py-1.5 text-[12px] border border-[#8f8f8f] rounded-sm hover:bg-gray-100"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v && !deleteLoading) setDeleteTarget(null); }}>
                <AlertDialogContent className="max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[14px]">Delete Location</AlertDialogTitle>
                        <AlertDialogDescription className="text-[12px]">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-black">"{deleteTarget?.locationName}"</span>?
                            This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={deleteLoading}
                            className="text-[12px] h-8"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={deleteLoading}
                            onClick={(e) => { e.preventDefault(); handleDeleteConfirm(); }}
                            className="bg-red-600 hover:bg-red-700 text-[12px] h-8"
                        >
                            {deleteLoading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
