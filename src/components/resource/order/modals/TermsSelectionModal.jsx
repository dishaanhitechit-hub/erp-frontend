"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Loader2,
  Pencil,
  Search,
} from "lucide-react";

import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import ExpandableTextField from "@/components/common/ExpandableTextField";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";

const isSpecialHeader = (h) =>
  typeof h === "string" && h.startsWith("SP_") && h.endsWith("_SP");

const cleanHeader = (h) => (isSpecialHeader(h) ? h.slice(3, -3) : h);

export default function TermsSelectionModal({ open, onClose, form }) {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tempTerms, setTempTerms] = useState([]);
  const [editableRows, setEditableRows] = useState({});
  const [activeTab, setActiveTab] = useState("general");

  const existingTerms = form.watch("terms") || [];

  useEffect(() => {
    if (!open) return;

    const fetchTerms = async () => {
      try {
        setLoading(true);

        const res = await apiRequest({
          url: `${API_ENDPOINTS.MASTER.TERM.LIST}?module=Order`,
          method: "GET",
        });

        const apiTerms = res.data || [];

        const merged = apiTerms.map((item) => {
          const existing = existingTerms.find(
            (term) => String(term.termId) === String(item.termId),
          );

          return {
            termId: item.termId,
            header: item.header,
            subHeader: item.sub_header,
            description: existing?.description || item.term_description || "",
            selected: !!existing,
          };
        });

        setTempTerms(merged);
      } catch {
        toast.error("Failed to load terms");
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, [open, existingTerms]);

  const generalTerms = useMemo(
    () => tempTerms.filter((t) => !isSpecialHeader(t.header)),
    [tempTerms],
  );

  const specialTerms = useMemo(
    () => tempTerms.filter((t) => isSpecialHeader(t.header)),
    [tempTerms],
  );

  const activeList = activeTab === "general" ? generalTerms : specialTerms;

  const filteredTerms = useMemo(() => {
    if (!search) return activeList;
    return activeList.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search, activeList]);

  const allSelected =
    filteredTerms.length > 0 && filteredTerms.every((item) => item.selected);

  const handleSelectAll = (checked) => {
    const ids = new Set(filteredTerms.map((t) => String(t.termId)));
    setTempTerms((prev) =>
      prev.map((item) =>
        ids.has(String(item.termId)) ? { ...item, selected: checked } : item,
      ),
    );
  };

  const handleSelect = (termId, checked) => {
    setTempTerms((prev) =>
      prev.map((item) =>
        String(item.termId) === String(termId)
          ? { ...item, selected: checked }
          : item,
      ),
    );
  };

  const handleDescriptionChange = (termId, value) => {
    setTempTerms((prev) =>
      prev.map((item) =>
        String(item.termId) === String(termId)
          ? { ...item, description: value }
          : item,
      ),
    );
  };

  const toggleEdit = (termId) => {
    setEditableRows((prev) => ({ ...prev, [termId]: !prev[termId] }));
  };

  const handleSubmit = () => {
    const selected = tempTerms.filter((item) => item.selected);

    const formatted = selected.map((item) => ({
      termId: item.termId,
      header: item.header,
      subHeader: item.subHeader,
      description: item.description,
    }));

    form.setValue("terms", formatted);
    onClose?.();
  };

  const tabs = [
    { key: "general", label: "General Terms", count: generalTerms.length },
    { key: "special", label: "Special Terms", count: specialTerms.length },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose?.();
      }}
    >
      <DialogContent
        className="
          min-w-[95vw] max-w-[95vw]
          lg:min-w-[1200px] lg:max-w-[1200px]
          p-0 gap-0
        "
      >
        {/* HEADER */}
        <DialogHeader className="px-5 py-3 border-b bg-slate-50">
          <DialogTitle className="text-lg font-semibold">
            Select Terms & Conditions
          </DialogTitle>
        </DialogHeader>

        {/* SEARCH */}
        <div className="px-4 py-3 border-b">
          <div className="relative w-full max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Terms"
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setSearch("");
              }}
              className={`
                px-5 py-2 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === tab.key
                    ? "border-sky-500 text-sky-600 bg-sky-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              {tab.label}
              <span
                className={`
                  ml-2 rounded-full px-1.5 py-0.5 text-xs font-semibold
                  ${
                    activeTab === tab.key
                      ? "bg-sky-100 text-sky-700"
                      : "bg-gray-100 text-gray-500"
                  }
                `}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="overflow-auto max-h-[420px]">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-100">
              <tr>
                <th className="border px-2 py-1 min-w-[60px]">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th className="border px-2 py-1 text-sm min-w-[180px]">Header</th>
                <th className="border px-2 py-1 text-sm min-w-[180px]">Sub Header</th>
                <th className="border px-2 py-1 text-sm min-w-[380px]">Description</th>
                <th className="border px-2 py-1 text-sm min-w-[100px]">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="h-[180px] text-center">
                    <div className="flex justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !filteredTerms.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="h-[120px] text-center text-gray-500"
                  >
                    No Terms Found
                  </td>
                </tr>
              )}

              {!loading &&
                filteredTerms.map((item) => (
                  <tr key={item.termId}>
                    <td className="border px-2 py-1">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={(checked) =>
                            handleSelect(item.termId, checked)
                          }
                        />
                      </div>
                    </td>

                    <td className="border px-2 py-1 text-sm">
                      {cleanHeader(item.header)}
                    </td>

                    <td className="border px-2 py-1 text-sm">
                      {item.subHeader}
                    </td>

                    <td className="border px-2 py-1">
                      <ExpandableTextField
                        value={item.description}
                        onChange={(value) =>
                          handleDescriptionChange(item.termId, value)
                        }
                        disabled={!editableRows[item.termId]}
                        title="Term Description"
                        placeholder="Enter Description"
                        minHeight="min-h-[34px]"
                        modalHeight="min-h-[220px]"
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => toggleEdit(item.termId)}
                          className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-blue-50 transition"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 border-t px-5 py-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button type="button" onClick={handleSubmit}>
            <Check className="w-4 h-4 mr-1" />
            Add Selected Terms
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
