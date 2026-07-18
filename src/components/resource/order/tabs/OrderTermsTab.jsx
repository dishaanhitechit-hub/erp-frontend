"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import ExpandableTextArea from "@/components/common/ExpandableTextArea";
import TermsSelectionModal from "@/components/common/TermsSelectionModal";

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

function TermRow({ term, idx, total, disabled, onMove, onDelete, onUpdateGroup }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <tr className="align-top">
      {/* Sl No + reorder */}
      <td className="border px-1 py-1 text-center align-middle w-[70px]">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[12px] font-medium text-gray-600">{idx + 1}</span>
          {!disabled && (
            <div className="flex gap-0.5">
              <button type="button" onClick={() => onMove(idx, -1)} disabled={idx === 0}
                className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30">
                <ChevronUp size={12} />
              </button>
              <button type="button" onClick={() => onMove(idx, 1)} disabled={idx === total - 1}
                className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30">
                <ChevronDown size={12} />
              </button>
            </div>
          )}
        </div>
      </td>

      {/* Type badge */}
      <td className="border px-2 py-1 w-[100px] align-middle">
        <span className={`text-[11px] px-1.5 py-0.5 rounded-sm font-medium ${
          term.termType === "Special_Terms"
            ? "bg-amber-100 text-amber-700"
            : "bg-sky-100 text-sky-700"
        }`}>
          {term.termType === "Special_Terms" ? "Special" : "General"}
        </span>
      </td>

      {/* Term groups */}
      <td className="border px-2 py-2">
        {(term.termGroups || []).map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-3 pt-2 border-t border-gray-100" : ""}>
            {/* Group title */}
            <p className="text-[12px] font-semibold text-gray-800 mb-1">
              {gi + 1}. {group.title}
            </p>

            {/* Description — editable via ExpandableTextArea */}
            <div className="mb-1.5">
              <ExpandableTextArea
                value={group.description}
                onChange={(v) => onUpdateGroup(term.sourceTermId ?? term.termId, gi, "description", v)}
                disabled={disabled}
                placeholder="Description…"
                title={group.title || "Term Description"}
                rows={2}
                maxInlineRows={3}
                modalRows={10}
                className="w-full"
              />
            </div>

            {/* Points */}
            {group.points?.length > 0 && (
              <div className="pl-3 flex flex-col gap-0.5">
                {group.points.map((pt, pi) => (
                  <span key={pi} className="flex gap-2 text-[12px] text-gray-600">
                    <span className={`shrink-0 font-mono text-gray-400 ${group.pointStyle === "bullet" ? "text-[16px] leading-[18px]" : ""}`}>
                      {pointPrefix(group.pointStyle, pi)}
                    </span>
                    {pt.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </td>

      {/* Delete */}
      {!disabled && (
        <td className="border px-2 py-1 text-center align-middle w-[80px]">
          {confirmDelete ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-red-500 font-medium">Remove?</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => onDelete(term.sourceTermId ?? term.termId)}
                  className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded-sm hover:bg-red-600">
                  Yes
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)}
                  className="text-[10px] px-1.5 py-0.5 border border-gray-300 rounded-sm hover:bg-gray-100">
                  No
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)}
              className="text-red-400 hover:text-red-600 transition">
              <Trash2 size={14} />
            </button>
          )}
        </td>
      )}
    </tr>
  );
}

export default function OrderTermsTab({
  form,
  disabled,
  openTermsModal,
  setOpenTermsModal,
  module = "Order",
  subModule = "Purchase_Order",
}) {
  const [activeTab, setActiveTab] = useState("Special_Terms");

  const terms = form.watch("terms") || [];
  const generalTerms = terms.filter((t) => t.termType !== "Special_Terms");
  const specialTerms = terms.filter((t) => t.termType === "Special_Terms");
  const activeTerms  = activeTab === "General_Terms" ? generalTerms : specialTerms;

  const updateTerms = (updated) => form.setValue("terms", updated);

  const handleMove = (idx, dir) => {
    const list = [...activeTerms];
    const swap = idx + dir;
    if (swap < 0 || swap >= list.length) return;
    [list[idx], list[swap]] = [list[swap], list[idx]];
    const other = terms.filter((t) =>
      activeTab === "General_Terms" ? t.termType === "Special_Terms" : t.termType !== "Special_Terms"
    );
    updateTerms(activeTab === "General_Terms" ? [...list, ...other] : [...other, ...list]);
  };

  const handleDelete = (sourceTermId) => {
    updateTerms(terms.filter((t) => String(t.sourceTermId ?? t.termId) !== String(sourceTermId)));
  };

  const handleUpdateGroup = (sourceTermId, groupIdx, field, value) => {
    updateTerms(
      terms.map((t) =>
        String(t.sourceTermId ?? t.termId) === String(sourceTermId)
          ? { ...t, termGroups: (t.termGroups || []).map((g, gi) => gi === groupIdx ? { ...g, [field]: value } : g) }
          : t
      )
    );
  };

  const handleConfirm = (selected) => {
    const existing = Object.fromEntries(terms.map((t) => [String(t.sourceTermId ?? t.termId), t]));
    const merged   = selected.map((t) => {
      const key = String(t.sourceTermId ?? t.termId);
      return existing[key] ? { ...existing[key], termGroups: t.termGroups } : t;
    });
    updateTerms(merged);
  };

  const tabs = [
    { key: "Special_Terms", label: "Special Terms", count: specialTerms.length },
    { key: "General_Terms", label: "General Terms", count: generalTerms.length },
  ];

  return (
    <div className="bg-white w-full">
      <div className="border border-gray-300">
        {/* Title */}
        <div className="w-full bg-[#F5EFCF] border-b border-gray-300 px-4 py-1.5">
          <h2 className="text-[15px] font-semibold text-black">Terms & Condition</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-300">
          {tabs.map((tab) => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-sky-500 text-sky-600 bg-sky-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}>
              {tab.label}
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                activeTab === tab.key ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-500"
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[620px]">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#D3D3D3]">
                <th className="border px-2 py-1 text-sm w-[70px]">Sl No.</th>
                <th className="border px-2 py-1 text-sm w-[100px]">Type</th>
                <th className="border px-2 py-1 text-sm">Term Groups</th>
                {!disabled && <th className="border px-2 py-1 text-sm w-[80px]">Action</th>}
              </tr>
            </thead>
            <tbody>
              {!activeTerms.length && (
                <tr>
                  <td colSpan={disabled ? 3 : 4} className="h-[120px] text-center text-sm text-gray-400">
                    No {activeTab === "General_Terms" ? "General" : "Special"} Terms Added
                  </td>
                </tr>
              )}
              {activeTerms.map((term, idx) => (
                <TermRow
                  key={term.sourceTermId ?? term.termId}
                  term={term}
                  idx={idx}
                  total={activeTerms.length}
                  disabled={disabled}
                  onMove={handleMove}
                  onDelete={handleDelete}
                  onUpdateGroup={handleUpdateGroup}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <TermsSelectionModal
        open={openTermsModal}
        onClose={() => setOpenTermsModal(false)}
        onConfirm={handleConfirm}
        selectedTerms={terms}
        module={module}
        subModule={subModule}
        disabled={disabled}
      />
    </div>
  );
}
