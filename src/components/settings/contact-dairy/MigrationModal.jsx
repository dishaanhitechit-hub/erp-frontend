"use client";

import { useEffect, useState } from "react";
import { X, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SaveButton from "@/components/common/SaveButton";

// ── Generic multi-select dropdown ─────────────────────────────────────────────
function MultiSelect({ options, value, onChange, labelKey, valueKey, placeholder, disabled }) {
  const [open, setOpen] = useState(false);

  const toggle = (v) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  const label = value.length
    ? options.filter((o) => value.includes(o[valueKey])).map((o) => o[labelKey]).join(", ")
    : placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 rounded text-[13px] bg-white min-h-[36px] text-left"
      >
        <span className={`truncate ${!value.length ? "text-gray-400" : ""}`}>{label}</span>
        <ChevronDown size={14} className={`shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-[9999] mt-1 w-full bg-white border border-gray-200 rounded shadow-xl max-h-[220px] overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-4 py-3 text-[12px] text-gray-400 text-center">No options</p>
          ) : (
            options.map((opt) => {
              const checked = value.includes(opt[valueKey]);
              return (
                <div
                  key={opt[valueKey]}
                  onMouseDown={(e) => { e.preventDefault(); toggle(opt[valueKey]); }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer"
                >
                  <input type="checkbox" readOnly checked={checked} className="accent-blue-500 w-3.5 h-3.5" />
                  <span className={`text-[12px] ${checked ? "text-blue-700 font-medium" : "text-gray-700"}`}>
                    {opt[labelKey]}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function MigrationModal({ open, onOpenChange, supplierType }) {
  const [suppliers, setSuppliers]         = useState([]);
  const [projects, setProjects]           = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedProjects, setSelectedProjects]   = useState([]);
  const [loading, setLoading]             = useState(false);
  const [saving, setSaving]               = useState(false);

  // Load suppliers + projects when modal opens
  useEffect(() => {
    if (!open) return;
    setSelectedSuppliers([]);
    setSelectedProjects([]);

    const load = async () => {
      setLoading(true);
      try {
        const suppRes = await apiRequest({ url: API_ENDPOINTS.SUPPLIER.LIST, method: "GET", params: { supplierType } });
        setSuppliers(Array.isArray(suppRes?.data) ? suppRes.data : []);
      } catch (err) {
        toast.error(err?.message || "Failed to load suppliers");
      }
      try {
        const projRes = await apiRequest({ url: API_ENDPOINTS.SETTINGS.GET_ALL_PROJECTS, method: "GET" });
        setProjects(Array.isArray(projRes?.data) ? projRes.data : []);
      } catch (err) {
        toast.error(err?.message || "Failed to load projects");
      }
      setLoading(false);
    };
    load();
  }, [open, supplierType]);

  // linkedProjects is [{projectId, ...}] — extract ids
  const getSupplierProjectIds = (s) =>
    (s.linkedProjects || []).map((p) => p.projectId).filter(Boolean);

  // When suppliers change → auto-select their linked projects
  const handleSuppliersChange = (ids) => {
    setSelectedSuppliers(ids);
    const autoProjects = new Set(selectedProjects);
    suppliers
      .filter((s) => ids.includes(s.supplierId))
      .forEach((s) => getSupplierProjectIds(s).forEach((pid) => autoProjects.add(pid)));
    setSelectedProjects([...autoProjects]);
  };

  // When projects change → auto-select suppliers linked to those projects
  const handleProjectsChange = (ids) => {
    setSelectedProjects(ids);
    const autoSuppliers = new Set(selectedSuppliers);
    suppliers
      .filter((s) => getSupplierProjectIds(s).some((pid) => ids.includes(pid)))
      .forEach((s) => autoSuppliers.add(s.supplierId));
    setSelectedSuppliers([...autoSuppliers]);
  };

  const handleSave = async () => {
    if (!selectedSuppliers.length || !selectedProjects.length) {
      toast.error("Select at least one supplier and one project");
      return;
    }
    setSaving(true);
    try {
      await apiRequest({
        url: API_ENDPOINTS.SUPPLIER.BULK_ASSIGN_PROJECTS,
        method: "POST",
        data: { supplierIds: selectedSuppliers, projectIds: selectedProjects },
      });
      toast.success("Migration successful");
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.message || "Migration failed");
    } finally {
      setSaving(false);
    }
  };

  const supplierOptions = suppliers.map((s) => ({
    value: s.supplierId,
    label: `${s.supplierName}${s.supplierCode ? ` (${s.supplierCode})` : ""}`,
  }));

  const projectOptions = projects.map((p) => ({
    value: p.projectId,
    label: `${p.projectCode}${p.projectName ? ` — ${p.projectName}` : ""}`,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Migrate Suppliers to Projects</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1">Suppliers</label>
              <MultiSelect
                options={supplierOptions}
                value={selectedSuppliers}
                onChange={handleSuppliersChange}
                labelKey="label"
                valueKey="value"
                placeholder="Select suppliers..."
              />
              {selectedSuppliers.length > 0 && (
                <p className="text-[11px] text-gray-400 mt-1">{selectedSuppliers.length} selected</p>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1">Projects</label>
              <MultiSelect
                options={projectOptions}
                value={selectedProjects}
                onChange={handleProjectsChange}
                labelKey="label"
                valueKey="value"
                placeholder="Select projects..."
              />
              {selectedProjects.length > 0 && (
                <p className="text-[11px] text-gray-400 mt-1">{selectedProjects.length} selected</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <SaveButton onClick={handleSave} loading={saving} disabled={saving} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
