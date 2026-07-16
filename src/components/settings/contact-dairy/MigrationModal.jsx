"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowLeftRight } from "lucide-react";
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
import MultiSelectSearch from "@/components/common/MultiSelectSearch";

export default function MigrationModal({ open, onOpenChange, supplierType }) {
  const [suppliers, setSuppliers]                 = useState([]);
  const [projects, setProjects]                   = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedProjects, setSelectedProjects]   = useState([]);
  const [loading, setLoading]                     = useState(false);
  const [saving, setSaving]                       = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedSuppliers([]);
    setSelectedProjects([]);

    const load = async () => {
      setLoading(true);
      try {
        const suppRes = await apiRequest({
          url: API_ENDPOINTS.SUPPLIER.LIST,
          method: "GET",
          params: { supplierType },
        });
        setSuppliers(Array.isArray(suppRes?.data) ? suppRes.data : []);
      } catch (err) {
        toast.error(err?.message || "Failed to load suppliers");
      }
      try {
        const projRes = await apiRequest({
          url: API_ENDPOINTS.SETTINGS.GET_ALL_PROJECTS,
          method: "GET",
        });
        setProjects(Array.isArray(projRes?.data) ? projRes.data : []);
      } catch (err) {
        toast.error(err?.message || "Failed to load projects");
      }
      setLoading(false);
    };
    load();
  }, [open, supplierType]);

  // Project selected → auto-select suppliers linked to that project
  const handleProjectsChange = (ids) => {
    setSelectedProjects(ids);
    const autoSuppliers = new Set(selectedSuppliers);
    suppliers
      .filter((s) =>
        (s.linkedProjects || []).some((lp) => ids.includes(lp.projectId))
      )
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
    supplierId: s.supplierId,
    label: s.supplierName,
    code: s.supplierCode || "",
  }));

  const projectOptions = projects.map((p) => ({
    projectId: p.projectId,
    label: `${p.projectCode}${p.projectName ? ` — ${p.projectName}` : ""}`,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] !max-w-4xl sm:!max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight size={16} className="text-blue-600" />
            Migrate Suppliers to Projects
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
          </div>
        ) : (
          <div className="pt-2 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1 min-w-0">
                <label className="block text-[12px] font-medium text-gray-600 mb-1">Projects</label>
                <MultiSelectSearch
                  options={projectOptions}
                  value={selectedProjects}
                  onChange={handleProjectsChange}
                  valueKey="projectId"
                  labelKey="label"
                  searchKeys={["label"]}
                  placeholder="Select projects..."
                />
                {selectedProjects.length > 0 && (
                  <p className="text-[11px] text-gray-400 mt-1">{selectedProjects.length} selected</p>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <label className="block text-[12px] font-medium text-gray-600 mb-1">Suppliers</label>
                <MultiSelectSearch
                  options={supplierOptions}
                  value={selectedSuppliers}
                  onChange={setSelectedSuppliers}
                  valueKey="supplierId"
                  labelKey={["label", "code"]}
                  labelSeparator=" · "
                  searchKeys={["label", "code"]}
                  placeholder="Select suppliers..."
                />
                {selectedSuppliers.length > 0 && (
                  <p className="text-[11px] text-gray-400 mt-1">{selectedSuppliers.length} selected</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <SaveButton onClick={handleSave} loading={saving} disabled={saving} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
