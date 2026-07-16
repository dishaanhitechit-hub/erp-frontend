"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";

export const TYPE_LABEL = {
  Materials:       "Materials",
  Work_Force:      "Work Force",
  Plant_Machinery: "Plant & Machinery",
  Others:          "Others",
};

export const TYPE_BADGE_COLOR = {
  Materials:       "bg-green-100 text-green-800 border-green-200",
  Work_Force:      "bg-blue-100 text-blue-800 border-blue-200",
  Plant_Machinery: "bg-orange-100 text-orange-800 border-orange-200",
  Others:          "bg-gray-100 text-gray-700 border-gray-200",
};

const TYPE_HEADING_COLOR = {
  Materials:       "bg-green-50 text-green-700 border-green-100",
  Work_Force:      "bg-blue-50 text-blue-700 border-blue-100",
  Plant_Machinery: "bg-orange-50 text-orange-700 border-orange-100",
  Others:          "bg-gray-50 text-gray-600 border-gray-100",
};

/**
 * Multi-select nature-of-service dropdown.
 * selectedTypes: string[]  — active type badges (drives which groups to show)
 * value: string[]          — selected nature-of-service values
 * onChange: (newArray) => void
 */
export default function NatureOfServiceSelect({
  selectedTypes = [],
  value = [],
  onChange,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [optionsByType, setOptionsByType] = useState({});
  const wrapperRef = useRef(null);

  // Fetch options per type (cached)
  useEffect(() => {
    selectedTypes.forEach(async (type) => {
      if (optionsByType[type] !== undefined) return;
      try {
        const res = await apiRequest({
          url: API_ENDPOINTS.SUPPLIER.NATURE_OF_SERVICE,
          method: "GET",
          params: { types: type },
        });
        const list = Array.isArray(res?.data) ? res.data : [];
        setOptionsByType((prev) => ({ ...prev, [type]: list }));
      } catch {
        setOptionsByType((prev) => ({ ...prev, [type]: [] }));
      }
    });
  }, [selectedTypes.join(",")]); // eslint-disable-line

  // When a type is deselected, remove its options from value — but only touch
  // values that belong to THIS instance's option pool (leave other instances' values alone)
  useEffect(() => {
    if (!value.length) return;
    const allValid = new Set(selectedTypes.flatMap((t) => optionsByType[t] || []));
    const myPool   = new Set(Object.values(optionsByType).flat());
    if (!myPool.size) return;
    const filtered = value.filter((v) => !myPool.has(v) || allValid.has(v));
    if (filtered.length !== value.length) onChange?.(filtered);
  }, [selectedTypes.join(","), Object.keys(optionsByType).join(",")]); // eslint-disable-line

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (opt) => {
    const next = value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt];
    onChange?.(next);
  };

  const removeOne = (opt, e) => {
    e.stopPropagation();
    onChange?.(value.filter((v) => v !== opt));
  };

  const hasOptions = selectedTypes.some((t) => (optionsByType[t] || []).length > 0);
  const displayLabel = value.length ? value.join(", ") : "Select nature of service";

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-1 border rounded-sm text-[13px] text-left min-h-[30px] transition-colors
          ${disabled
            ? "border-[#7fa37f] bg-[#edf8ed] text-gray-500 cursor-default"
            : "border-[#8f8f8f] bg-white hover:border-blue-400 cursor-pointer"
          }`}
      >
        {/* Selected tags or placeholder */}
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {value.length > 0 ? (
            value.map((v) => (
              <span key={v} className="inline-flex items-center gap-0.5 text-[11px] bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 max-w-[180px] truncate">
                <span className="truncate">{v}</span>
                {!disabled && (
                  <span onMouseDown={(e) => removeOne(v, e)} className="cursor-pointer text-blue-400 hover:text-red-500 shrink-0">
                    <X size={10} />
                  </span>
                )}
              </span>
            ))
          ) : (
            <span className="text-gray-400">{displayLabel}</span>
          )}
        </div>
        <ChevronDown size={14} className={`text-gray-500 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[9999] mt-1 w-full min-w-[260px] bg-white border border-gray-200 rounded-sm shadow-xl max-h-[300px] overflow-y-auto">
          {!hasOptions ? (
            <p className="px-4 py-3 text-[12px] text-gray-400 text-center">
              {selectedTypes.length === 0 ? "Select at least one supplier type first" : "Loading options..."}
            </p>
          ) : (
            selectedTypes.map((type) => {
              const options = optionsByType[type] || [];
              if (options.length === 0) return null;
              return (
                <div key={type}>
                  <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b ${TYPE_HEADING_COLOR[type] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
                    {TYPE_LABEL[type] || type}
                  </div>
                  {options.map((opt) => {
                    const checked = value.includes(opt);
                    return (
                      <div
                        key={opt}
                        onMouseDown={(e) => { e.preventDefault(); toggle(opt); }}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      >
                        <input type="checkbox" readOnly checked={checked} className="accent-blue-500 cursor-pointer w-3.5 h-3.5" />
                        <span className={`text-[12px] ${checked ? "text-blue-700 font-medium" : "text-gray-700"}`}>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
