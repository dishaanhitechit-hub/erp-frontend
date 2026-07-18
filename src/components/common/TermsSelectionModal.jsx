"use client";

/**
 * TermsSelectionModal — reusable across all order/service-order pages.
 *
 * Props:
 *   open          bool          — controlled open state
 *   onClose       fn            — close callback
 *   onConfirm     fn(terms[])   — called with selected+ordered terms array on confirm
 *   selectedTerms term[]        — currently selected terms (RHF "terms" value)
 *   module        string        — e.g. "Order"  — used as API filter
 *   subModule     string        — e.g. "Purchase_Order" — used as API filter
 *   disabled      bool          — view-only mode
 */

import { useEffect, useMemo, useState } from "react";
import {
  Search, Loader2, Check, ChevronUp, ChevronDown,
  Trash2, GripVertical, X, PanelLeftClose, PanelLeftOpen,
  ChevronsDownUp, ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import ExpandableTextArea from "@/components/common/ExpandableTextArea";
import { TERMS_TYPES } from "@/config/terms.config";

const DUMMY_TERMS_API = []; // REMOVE after backend ready

const fmt = (str) => (str || "").replace(/_/g, " ");

function pointPrefix(style, idx) {
  if (style === "bullet")   return "•";
  if (style === "numbered") return `${idx + 1}.`;
  if (style === "alpha")    return `${String.fromCharCode(97 + idx)}.`;
  if (style === "roman") {
    const nums = [1,4,5,9,10,40,50,90,100,400,500,900,1000];
    const syms = ["i","iv","v","ix","x","xl","l","xc","c","cd","d","cm","m"];
    let n = idx + 1, result = "";
    for (let i = nums.length - 1; i >= 0; i--) {
      while (n >= nums[i]) { result += syms[i]; n -= nums[i]; }
    }
    return `${result}.`;
  }
  return `${idx + 1}.`;
}

function TermGroupView({ group, idx }) {
  return (
    <div className="mb-2">
      <p className="text-[12px] font-semibold text-gray-700 mb-0.5">
        {idx + 1}. {group.title}
      </p>
      <p className="text-[12px] text-gray-500 mb-1 pl-3">{group.description}</p>
      {group.points?.length > 0 && (
        <div className="pl-6 flex flex-col gap-0.5">
          {group.points.map((pt, pi) => (
            <span key={pi} className="text-[12px] text-gray-600 flex gap-1.5">
              <span className={`shrink-0 font-mono ${group.pointStyle === "bullet" ? "text-[16px] leading-[18px]" : ""}`}>
                {pointPrefix(group.pointStyle, pi)}
              </span>
              {pt.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PointRow({ pt, pi, total, prefix, highlighted, onUpdate, onMove, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div
      style={{ transition: "box-shadow 0.4s ease" }}
      className={`flex items-start gap-1 rounded-sm ${highlighted ? "shadow-[0_0_0_2px_rgba(56,189,248,0.4)]" : ""}`}
    >
      {/* reorder */}
      <div className="flex flex-col shrink-0 mt-1">
        <button type="button" onClick={() => onMove(-1)} disabled={pi === 0}
          className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30">
          <ChevronUp size={10} />
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={pi === total - 1}
          className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30">
          <ChevronDown size={10} />
        </button>
      </div>
      <span className={`shrink-0 text-gray-400 font-mono text-[11px] mt-2 ${prefix === "•" ? "text-[15px] leading-[20px]" : ""}`}>
        {prefix}
      </span>
      <ExpandableTextArea
        value={pt.text}
        onChange={onUpdate}
        placeholder={`Point ${pi + 1}`}
        title={`Point ${pi + 1}`}
        rows={1}
        maxInlineRows={3}
        modalRows={6}
        className="flex-1"
      />
      {/* delete */}
      <div className="shrink-0 mt-1">
        {confirm ? (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-red-500">Del?</span>
            <button type="button" onClick={onDelete}
              className="text-[10px] px-1 py-0.5 bg-red-500 text-white rounded-sm hover:bg-red-600">Y</button>
            <button type="button" onClick={() => setConfirm(false)}
              className="text-[10px] px-1 py-0.5 border border-gray-300 rounded-sm hover:bg-gray-100">N</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirm(true)}
            className="p-0.5 text-red-300 hover:text-red-500 rounded">
            <X size={10} />
          </button>
        )}
      </div>
    </div>
  );
}

function TermGroupsEditor({ term, onUpdateGroupField, onMoveGroup, onDeleteGroup, onUpdatePoint, onMovePoint, onDeletePoint }) {
  const [groupConfirm,  setGroupConfirm]  = useState(null);
  const [movedGroupIdx, setMovedGroupIdx] = useState(null);
  const [movedPointKey, setMovedPointKey] = useState(null);
  const [collapsed,     setCollapsed]     = useState(new Set());
  const groups = term.termGroups || [];

  const toggleCollapse = (gi) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(gi) ? next.delete(gi) : next.add(gi);
      return next;
    });

  const handleMoveGroup = (gi, dir) => {
    const swap = gi + dir;
    onMoveGroup(term.termId, gi, dir);
    setTimeout(() => {
      setMovedGroupIdx(swap);
      setTimeout(() => setMovedGroupIdx(null), 600);
    }, 0);
  };

  const handleMovePoint = (gi, pi, dir) => {
    const swap = pi + dir;
    onMovePoint(term.termId, gi, pi, dir);
    setTimeout(() => {
      setMovedPointKey(`${gi}-${swap}`);
      setTimeout(() => setMovedPointKey(null), 600);
    }, 0);
  };

  return (
    <>
      {groups.map((group, gi) => (
        <div
          key={gi}
          style={{ transition: "box-shadow 0.4s ease, border-color 0.4s ease" }}
          className={`rounded-sm border p-2 ${gi > 0 ? "mt-1" : ""} ${
            movedGroupIdx === gi
              ? "border-sky-400 shadow-[0_0_0_3px_rgba(56,189,248,0.3)] bg-sky-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          {/* Group header: reorder + collapse + title + delete */}
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5 shrink-0">
              <button type="button" onClick={() => handleMoveGroup(gi, -1)} disabled={gi === 0}
                className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30">
                <ChevronUp size={11} />
              </button>
              <button type="button" onClick={() => handleMoveGroup(gi, 1)} disabled={gi === groups.length - 1}
                className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30">
                <ChevronDown size={11} />
              </button>
            </div>
            <button type="button" onClick={() => toggleCollapse(gi)}
              title={collapsed.has(gi) ? "Expand group" : "Collapse group"}
              className="p-0.5 rounded shrink-0 transition-colors">
              {collapsed.has(gi)
                ? <ChevronsUpDown size={12} className="text-sky-500 hover:text-sky-700" />
                : <ChevronsDownUp size={12} className="text-indigo-400 hover:text-indigo-600" />}
            </button>
            <span className="text-[11px] text-gray-400 shrink-0">{gi + 1}.</span>
            <input
              value={group.title}
              onChange={(e) => onUpdateGroupField(term.termId, gi, "title", e.target.value)}
              placeholder="Group title"
              className="flex-1 text-[12px] font-semibold border border-gray-200 rounded-sm px-1.5 py-0.5 outline-none focus:border-sky-400 bg-white"
            />
            {groupConfirm === gi ? (
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] text-red-500 font-medium">Remove?</span>
                <button type="button" onClick={() => { onDeleteGroup(term.termId, gi); setGroupConfirm(null); }}
                  className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded-sm hover:bg-red-600">Yes</button>
                <button type="button" onClick={() => setGroupConfirm(null)}
                  className="text-[10px] px-1.5 py-0.5 border border-gray-300 rounded-sm hover:bg-gray-100">No</button>
              </div>
            ) : (
              <button type="button" onClick={() => setGroupConfirm(gi)}
                className="p-0.5 text-red-300 hover:text-red-500 rounded shrink-0">
                <Trash2 size={11} />
              </button>
            )}
          </div>

          {/* Body — hidden when collapsed */}
          {!collapsed.has(gi) && (
            <div className="mt-1.5">
              {/* Description */}
              <div className="mb-1.5">
                <ExpandableTextArea
                  value={group.description || ""}
                  onChange={(v) => onUpdateGroupField(term.termId, gi, "description", v)}
                  placeholder="Description…"
                  title={group.title || "Description"}
                  rows={2}
                  maxInlineRows={3}
                  modalRows={8}
                  className="w-full"
                />
              </div>

              {/* Points */}
              {(group.points || []).length > 0 && (
                <div className="flex flex-col gap-1 pl-1">
                  {group.points.map((pt, pi) => (
                    <PointRow
                      key={pi}
                      pt={pt}
                      pi={pi}
                      total={group.points.length}
                      prefix={pointPrefix(group.pointStyle, pi)}
                      highlighted={movedPointKey === `${gi}-${pi}`}
                      onUpdate={(v) => onUpdatePoint(term.termId, gi, pi, v)}
                      onMove={(dir) => handleMovePoint(gi, pi, dir)}
                      onDelete={() => onDeletePoint(term.termId, gi, pi)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export default function TermsSelectionModal({
  open,
  onClose,
  onConfirm,
  selectedTerms = [],
  module = "Order",
  subModule = "",
  disabled = false,
}) {
  const [loading,        setLoading]        = useState(false);
  const [search,         setSearch]         = useState("");
  const [activeTab,      setActiveTab]      = useState("General_Terms");
  const [allTerms,       setAllTerms]       = useState([]);
  const [leftCollapsed,  setLeftCollapsed]  = useState(false);

  // local working copy — array of { ...term, selected, sortOrder, movedId }
  const [tempSelected, setTempSelected] = useState([]);

  // ── fetch when modal opens
  useEffect(() => {
    if (!open) return;
    const fetch = async () => {
      setLoading(true);
      try {
        let data;
        try {
          const params = new URLSearchParams({ module });
          if (subModule) params.append("subModule", subModule);
          const res = await apiRequest({
            url: `${API_ENDPOINTS.MASTER.TERM.LIST}?${params}`,
            method: "GET",
          });
          data = res.data || [];
        } catch {
          data = DUMMY_TERMS_API; // REMOVE after backend ready
        }
        setAllTerms(data);
      } catch {
        toast.error("Failed to load terms");
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // init tempSelected from currently selected terms
    setTempSelected(
      selectedTerms.map((t, i) => ({ ...t, _selected: true, _sortOrder: i }))
    );
    setSearch("");
    setActiveTab("General_Terms");
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── split by termType
  const generalTerms = useMemo(() => allTerms.filter((t) => t.termType === "General_Terms"), [allTerms]);
  const specialTerms = useMemo(() => allTerms.filter((t) => t.termType === "Special_Terms"), [allTerms]);
  const activeList   = activeTab === "General_Terms" ? generalTerms : specialTerms;

  const filteredList = useMemo(() => {
    if (!search) return activeList;
    const q = search.toLowerCase();
    return activeList.filter((t) =>
      [t.module, t.subModule, ...(t.termGroups || []).map((g) => g.title + " " + g.description)]
        .join(" ").toLowerCase().includes(q)
    );
  }, [activeList, search]);

  const isSelected = (termId) => tempSelected.some((t) => String(t.termId) === String(termId));

  const toggleSelect = (term, checked) => {
    if (checked) {
      setTempSelected((prev) => [...prev, { ...term, _selected: true, _sortOrder: prev.length }]);
    } else {
      setTempSelected((prev) => prev.filter((t) => String(t.termId) !== String(term.termId)));
    }
  };

  const allChecked = filteredList.length > 0 && filteredList.every((t) => isSelected(t.termId));
  const toggleAll  = (checked) => {
    if (checked) {
      const toAdd = filteredList.filter((t) => !isSelected(t.termId));
      setTempSelected((prev) => [...prev, ...toAdd.map((t, i) => ({ ...t, _selected: true, _sortOrder: prev.length + i }))]);
    } else {
      const ids = new Set(filteredList.map((t) => String(t.termId)));
      setTempSelected((prev) => prev.filter((t) => !ids.has(String(t.termId))));
    }
  };

  // ── reorder selected list
  const moveSelected = (idx, dir) => {
    setTempSelected((prev) => {
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const removeSelected = (termId) =>
    setTempSelected((prev) => prev.filter((t) => String(t.termId) !== String(termId)));

  const updateTerm = (termId, updater) =>
    setTempSelected((prev) =>
      prev.map((t) => String(t.termId) === String(termId) ? updater(t) : t)
    );

  const updateGroupField = (termId, gi, field, value) =>
    updateTerm(termId, (t) => ({
      ...t,
      termGroups: t.termGroups.map((g, i) => i === gi ? { ...g, [field]: value } : g),
    }));

  const moveGroup = (termId, gi, dir) =>
    updateTerm(termId, (t) => {
      const gs = [...t.termGroups];
      const swap = gi + dir;
      if (swap < 0 || swap >= gs.length) return t;
      [gs[gi], gs[swap]] = [gs[swap], gs[gi]];
      return { ...t, termGroups: gs };
    });

  const deleteGroup = (termId, gi) =>
    updateTerm(termId, (t) => ({
      ...t,
      termGroups: t.termGroups.filter((_, i) => i !== gi),
    }));

  const updatePoint = (termId, gi, pi, text) =>
    updateTerm(termId, (t) => ({
      ...t,
      termGroups: t.termGroups.map((g, gIdx) =>
        gIdx !== gi ? g : {
          ...g,
          points: g.points.map((p, pIdx) => pIdx === pi ? { ...p, text } : p),
        }
      ),
    }));

  const movePoint = (termId, gi, pi, dir) =>
    updateTerm(termId, (t) => ({
      ...t,
      termGroups: t.termGroups.map((g, gIdx) => {
        if (gIdx !== gi) return g;
        const pts = [...g.points];
        const swap = pi + dir;
        if (swap < 0 || swap >= pts.length) return g;
        [pts[pi], pts[swap]] = [pts[swap], pts[pi]];
        return { ...g, points: pts };
      }),
    }));

  const deletePoint = (termId, gi, pi) =>
    updateTerm(termId, (t) => ({
      ...t,
      termGroups: t.termGroups.map((g, gIdx) =>
        gIdx !== gi ? g : { ...g, points: g.points.filter((_, i) => i !== pi) }
      ),
    }));

  const handleConfirm = () => {
    onConfirm?.(tempSelected.map((t, i) => ({ ...t, sortOrder: i })));
    onClose?.();
  };

  const tabs = [
    { key: "General_Terms",  label: "General Terms",  count: generalTerms.length },
    { key: "Special_Terms",  label: "Special Terms",  count: specialTerms.length },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose?.(); }}>
      <DialogContent className="min-w-[95vw] lg:min-w-[1100px] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">

        {/* Header */}
        <DialogHeader className="px-5 py-3 border-b bg-slate-50 shrink-0">
          <DialogTitle className="text-[15px] font-semibold">
            Select Terms & Conditions
            {subModule && <span className="ml-2 text-[12px] font-normal text-gray-400">— {fmt(module)} / {fmt(subModule)}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">

          {/* ── LEFT: selection list ── */}
          <div className={`flex flex-col border-r overflow-hidden transition-all duration-200 ${leftCollapsed ? "w-0 min-w-0" : "flex-1"}`}>

            {/* Search + tabs */}
            <div className="px-4 pt-3 pb-0 shrink-0">
              <div className="relative max-w-[280px] mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search terms…"
                  className="pl-9 h-8 w-full border border-gray-300 rounded-sm text-[13px] outline-none px-2"
                />
              </div>
              <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => { setActiveTab(tab.key); setSearch(""); }}
                    className={`px-4 py-1.5 text-[13px] font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? "border-sky-500 text-sky-600 bg-sky-50"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                      activeTab === tab.key ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-auto flex-1">
              <table className="w-full border-collapse text-[13px]">
                <thead className="sticky top-0 z-10 bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1 w-[44px]">
                      <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
                    </th>
                    <th className="border px-2 py-1 text-left min-w-[160px]">Title(s)</th>
                    <th className="border px-2 py-1 text-left">Description / Points</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={3} className="h-[120px] text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
                  )}
                  {!loading && !filteredList.length && (
                    <tr><td colSpan={3} className="h-[100px] text-center text-gray-400 text-[13px]">No terms found</td></tr>
                  )}
                  {!loading && filteredList.map((term) => (
                    <tr key={term.termId} className={`align-top ${isSelected(term.termId) ? "bg-sky-50" : "hover:bg-gray-50"}`}>
                      <td className="border px-2 py-2 text-center">
                        <Checkbox
                          checked={isSelected(term.termId)}
                          onCheckedChange={(v) => toggleSelect(term, v)}
                        />
                      </td>
                      <td className="border px-2 py-2">
                        {(term.termGroups || []).map((g, i) => (
                          <p key={i} className="text-[12px] font-medium text-gray-700">{i + 1}. {g.title}</p>
                        ))}
                      </td>
                      <td className="border px-2 py-2">
                        {(term.termGroups || []).map((g, gi) => (
                          <TermGroupView key={gi} group={g} idx={gi} />
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── RIGHT: selected & editable list ── */}
          <div className={`shrink-0 flex flex-col overflow-hidden transition-all duration-200 ${leftCollapsed ? "flex-1" : "w-[480px]"}`}>
            <div className="px-3 py-2 border-b bg-gray-50 shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLeftCollapsed((v) => !v)}
                title={leftCollapsed ? "Show selection panel" : "Hide selection panel"}
                className="p-1 rounded hover:bg-gray-200 text-gray-500 transition shrink-0"
              >
                {leftCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
              </button>
              <span className="text-[12px] font-semibold text-gray-600">
                Selected ({tempSelected.length}) — reorder &amp; edit
              </span>
            </div>
            <div className="overflow-auto flex-1 p-2 flex flex-col gap-2">
              {tempSelected.length === 0 && (
                <p className="text-[12px] text-gray-400 text-center mt-6">No terms selected yet</p>
              )}
              {tempSelected.map((term, idx) => (
                <div key={term.termId} className="border border-gray-200 rounded-sm bg-white">
                  {/* Term header: index + type badge + reorder + remove */}
                  <div className="flex items-center gap-1.5 px-2 py-1 border-b border-gray-100 bg-gray-50">
                    <GripVertical size={12} className="text-gray-300 shrink-0" />
                    <span className="text-[11px] font-semibold text-gray-600 shrink-0">#{idx + 1}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium shrink-0 ${
                      term.termType === "Special_Terms"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-sky-100 text-sky-700"
                    }`}>
                      {term.termType === "Special_Terms" ? "Special" : "General"}
                    </span>
                    <div className="flex-1" />
                    <button type="button" onClick={() => moveSelected(idx, -1)} disabled={idx === 0}
                      className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30">
                      <ChevronUp size={11} />
                    </button>
                    <button type="button" onClick={() => moveSelected(idx, 1)} disabled={idx === tempSelected.length - 1}
                      className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30">
                      <ChevronDown size={11} />
                    </button>
                    <button type="button" onClick={() => removeSelected(term.termId)}
                      className="p-0.5 hover:bg-red-50 text-red-400 rounded">
                      <X size={11} />
                    </button>
                  </div>

                  {/* Term groups — editable */}
                  <div className="p-2 flex flex-col gap-2">
                    <TermGroupsEditor
                      term={term}
                      onUpdateGroupField={updateGroupField}
                      onMoveGroup={moveGroup}
                      onDeleteGroup={deleteGroup}
                      onUpdatePoint={updatePoint}
                      onMovePoint={movePoint}
                      onDeletePoint={deletePoint}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-5 py-3 shrink-0 bg-gray-50">
          <button type="button" onClick={onClose}
            className="h-8 px-4 rounded-sm border border-gray-300 text-[13px] text-gray-700 hover:bg-gray-100 transition">
            Cancel
          </button>
          {!disabled && (
            <button type="button" onClick={handleConfirm}
              className="h-8 px-4 rounded-sm border border-[#d97a2b] bg-[#f4b183] text-black text-[13px] font-medium hover:bg-[#eea36e] transition flex items-center gap-1.5">
              <Check size={13} /> Add Selected ({tempSelected.length})
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
