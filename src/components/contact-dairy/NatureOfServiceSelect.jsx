"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";

const TYPE_LABEL = {
  materials: "Materials",
  work_force: "Work Force",
  plant_machinery: "Plant & Machinery",
  others: "Others",
};

const TYPE_BADGE_COLOR = {
  materials: "bg-green-100 text-green-800 border-green-200",
  work_force: "bg-blue-100 text-blue-800 border-blue-200",
  plant_machinery: "bg-orange-100 text-orange-800 border-orange-200",
  others: "bg-gray-100 text-gray-700 border-gray-200",
};

// Fetches and caches nature-of-service lists per type.
// Shows grouped options with type headings. Single-select (string value).
export default function NatureOfServiceSelect({
  selectedTypes = [],
  value = "",
  onChange,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  // { [type]: string[] }
  const [optionsByType, setOptionsByType] = useState({});
  const wrapperRef = useRef(null);

  // Fetch options for each newly added type
  useEffect(() => {
    selectedTypes.forEach(async (type) => {
      if (optionsByType[type] !== undefined) return; // already cached
      try {
        const res = await apiRequest({
          url: `${API_ENDPOINTS.SUPPLIER.NATURE_OF_SERVICE}/${type}`,
          method: "GET",
        });
        const list = Array.isArray(res?.data) ? res.data : [];
        setOptionsByType((prev) => ({ ...prev, [type]: list }));
      } catch {
        setOptionsByType((prev) => ({ ...prev, [type]: [] }));
      }
    });
  }, [selectedTypes.join(",")]); // eslint-disable-line

  // When a type is removed and current value was from that type — clear it
  useEffect(() => {
    if (!value) return;
    const allValid = selectedTypes.flatMap((t) => optionsByType[t] || []);
    if (allValid.length > 0 && !allValid.includes(value)) {
      onChange?.("");
    }
  }, [selectedTypes.join(","), Object.keys(optionsByType).join(",")]); // eslint-disable-line

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasOptions = selectedTypes.some((t) => (optionsByType[t] || []).length > 0);

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-1.5 border rounded-sm text-sm text-left min-h-[30px] transition-colors
          ${disabled
            ? "border-[#7fa37f] bg-[#edf8ed] text-gray-500 cursor-default"
            : "border-[#8f8f8f] bg-white hover:border-blue-400 cursor-pointer"
          }`}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || "Select nature of service"}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              onClick={(e) => { e.stopPropagation(); onChange?.(""); }}
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={14}
            className={`text-gray-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[9999] mt-1 w-full min-w-[260px] bg-white border border-gray-200 rounded-sm shadow-xl max-h-[300px] overflow-y-auto">
          {!hasOptions ? (
            <p className="px-4 py-3 text-[12px] text-gray-400 text-center">
              {selectedTypes.length === 0
                ? "Select at least one supplier type first"
                : "Loading options..."}
            </p>
          ) : (
            selectedTypes.map((type) => {
              const options = optionsByType[type] || [];
              if (options.length === 0) return null;
              return (
                <div key={type}>
                  {/* Group heading */}
                  <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b ${TYPE_BADGE_COLOR[type] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
                    {TYPE_LABEL[type] || type}
                  </div>
                  {options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { onChange?.(opt); setOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[12px] hover:bg-blue-50 transition-colors
                        ${value === opt ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export { TYPE_LABEL, TYPE_BADGE_COLOR };
