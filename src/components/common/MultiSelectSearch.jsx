"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

/**
 * MultiSelectSearch — same look/feel as SearchableSelect but multi-select.
 *
 * Props:
 *   options        — array of objects
 *   value          — array of selected valueKey values
 *   onChange       — (newArray) => void
 *   labelKey       — string | string[]  key(s) to display
 *   valueKey       — string             key used as the id
 *   labelSeparator — string             joins multi labelKey (default " : ")
 *   searchKeys     — string[]           keys to search against
 *   placeholder    — string
 *   searchPlaceholder — string
 *   disabled       — bool
 *   emptyText      — string
 *   className      — string
 */
export default function MultiSelectSearch({
  options = [],
  value = [],
  onChange,
  labelKey = "label",
  valueKey = "value",
  labelSeparator = " : ",
  searchKeys = [],
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
  emptyText = "No Data Found",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openUp, setOpenUp] = useState(false);
  const wrapperRef = useRef(null);
  const searchRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  const getLabel = (item) =>
    Array.isArray(labelKey)
      ? labelKey.map((k) => item[k]).filter(Boolean).join(labelSeparator)
      : item[labelKey];

  const selectedOptions = useMemo(
    () => options.filter((o) => value.includes(o[valueKey])),
    [options, value, valueKey]
  );

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    const keys = searchKeys.length ? searchKeys : Array.isArray(labelKey) ? labelKey : [labelKey];
    return options.filter((o) => keys.some((k) => String(o[k] || "").toLowerCase().includes(q)));
  }, [search, options, searchKeys, labelKey]);

  const toggle = (item) => {
    const v = item[valueKey];
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  const removeOne = (v, e) => {
    e.stopPropagation();
    onChange(value.filter((x) => x !== v));
  };

  const openDropdown = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const DROPDOWN_HEIGHT = 280;
    setOpenUp(window.innerHeight - rect.bottom < DROPDOWN_HEIGHT + 8);
    setOpen((p) => !p);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={openDropdown}
        className={`w-full min-h-[30px] border rounded-sm bg-white px-2 text-left text-[13px] font-normal flex items-center justify-between gap-2
          disabled:border-[#7fa37f] disabled:bg-[#edf8ed] disabled:text-gray-500 disabled:cursor-not-allowed
          ${disabled ? "border-[#7fa37f]" : "border-[#8f8f8f]"}`}
      >
        <div className="flex flex-wrap gap-1 flex-1 min-w-0 py-0.5">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((o) => (
              <span
                key={o[valueKey]}
                className="inline-flex items-center gap-0.5 text-[11px] bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 max-w-[160px]"
              >
                <span className="truncate">{getLabel(o)}</span>
                {!disabled && (
                  <span
                    onMouseDown={(e) => removeOne(o[valueKey], e)}
                    className="cursor-pointer text-blue-400 hover:text-red-500 shrink-0"
                  >
                    <X size={10} />
                  </span>
                )}
              </span>
            ))
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={14} className={`shrink-0 text-gray-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && !disabled && (
        <div
          className={`absolute left-0 right-0 z-[9999] border border-[#8f8f8f] rounded-sm bg-white shadow-xl ${openUp ? "bottom-full mb-1" : "top-full mt-1"}`}
        >
          {/* Search */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-[30px] border border-[#8f8f8f] rounded-sm px-2 text-[13px] outline-none"
            />
          </div>

          {/* Options */}
          <div className="max-h-[220px] overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => {
                const checked = value.includes(item[valueKey]);
                return (
                  <div
                    key={item[valueKey]}
                    onMouseDown={(e) => { e.preventDefault(); toggle(item); }}
                    className={`flex items-center gap-2 px-3 py-2 text-[13px] cursor-pointer border-b border-gray-100 hover:bg-[#d6e6f2] ${checked ? "bg-[#d6e6f2]" : "bg-white"}`}
                  >
                    <input type="checkbox" readOnly checked={checked} className="accent-blue-500 w-3.5 h-3.5 shrink-0" />
                    <span className={checked ? "text-blue-700 font-medium" : "text-gray-700"}>{getLabel(item)}</span>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-[13px] text-gray-500">{emptyText}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
