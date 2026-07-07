"use client";

import { useState } from "react";

import {
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";

import ExpandableTextField from "@/components/common/ExpandableTextField";

import TermsSelectionModal from "../modals/TermsSelectionModal";

const isSpecialHeader = (h) =>
  typeof h === "string" && h.startsWith("SP_") && h.endsWith("_SP");

const cleanHeader = (h) =>
  isSpecialHeader(h) ? h.slice(3, -3) : h;

function TermsTable({ terms, allTerms, disabled, setOpenTermsModal, form, isSpecial }) {
  const handleDelete = (termId) => {
    const updated = allTerms.filter((t) => t.termId !== termId);
    form.setValue("terms", updated);
  };

  const colSpan = disabled ? 4 : 5;

  return (
    <div className="overflow-auto max-h-[680px]">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-[#D3D3D3]">
            <th className="border px-2 py-1 text-sm min-w-[70px]">Sl No.</th>
            <th className="border px-2 py-1 text-sm min-w-[180px]">Header</th>
            <th className="border px-2 py-1 text-sm min-w-[180px]">Sub Header</th>
            <th className="border px-2 py-1 text-sm min-w-[450px]">Description</th>
            {!disabled && (
              <th className="border px-2 py-1 text-sm min-w-[120px]">Action</th>
            )}
          </tr>
        </thead>

        <tbody>
          {!terms.length && (
            <tr>
              <td
                colSpan={colSpan}
                className="h-[120px] text-center text-sm text-gray-500"
              >
                No Terms Added
              </td>
            </tr>
          )}

          {terms.map((term, index) => (
            <tr key={term.termId}>
              <td className="border px-2 py-[2px] text-sm text-center">
                {index + 1}
              </td>

              <td className="border px-2 py-[2px] text-sm">
                {isSpecial ? cleanHeader(term.header) : term.header}
              </td>

              <td className="border px-2 py-[2px] text-sm">
                {term.subHeader}
              </td>

              <td className="border px-2 py-[2px] align-top">
                <ExpandableTextField
                  value={term.description}
                  disabled
                  title="Term Description"
                  placeholder="No Description"
                  minHeight="min-h-[32px]"
                  modalHeight="min-h-[220px]"
                />
              </td>

              {!disabled && (
                <td className="border px-2 py-[2px]">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOpenTermsModal(true)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(term.termId)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function OrderTermsTab({
  form,
  disabled,
  openTermsModal,
  setOpenTermsModal,
}) {
  const [activeTab, setActiveTab] = useState("general");

  const terms = form.watch("terms") || [];

  const generalTerms = terms.filter((t) => !isSpecialHeader(t.header));
  const specialTerms = terms.filter((t) => isSpecialHeader(t.header));

  const tabs = [
    { key: "general", label: "General Terms", count: generalTerms.length },
    { key: "special", label: "Special Terms", count: specialTerms.length },
  ];

  return (
    <div className="bg-white w-full">
      <div className="border border-gray-300">
        {/* TITLE */}
        <div className="w-full bg-[#F5EFCF] border-b border-gray-300 px-4 py-1.5">
          <h2 className="text-[15px] font-semibold text-black">
            Terms & Condition
          </h2>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
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
        {activeTab === "general" && (
          <TermsTable
            terms={generalTerms}
            allTerms={terms}
            disabled={disabled}
            setOpenTermsModal={setOpenTermsModal}
            form={form}
            isSpecial={false}
          />
        )}

        {activeTab === "special" && (
          <TermsTable
            terms={specialTerms}
            allTerms={terms}
            disabled={disabled}
            setOpenTermsModal={setOpenTermsModal}
            form={form}
            isSpecial={true}
          />
        )}
      </div>

      {/* MODAL */}
      <TermsSelectionModal
        open={openTermsModal}
        onClose={() => setOpenTermsModal(false)}
        form={form}
        disabled={disabled}
      />
    </div>
  );
}
