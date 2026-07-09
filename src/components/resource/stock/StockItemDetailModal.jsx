"use client";

import { useEffect, useState } from "react";
import { X, Package, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// TODO: remove this dummy function once API returns real GRN/GIN entries
const DUMMY_DETAIL = (item_code, item_name, unit) => ({
  summary: {
    item_code,
    item_name: item_name || item_code,
    unit: unit || "NOS",
    total_received_qty: 1000,
    total_received_amount: 30000,
    total_issued_qty: 250,
    total_issued_amount: 7500,
    stock_qty: 750,
    stock_amount: 22500,
  },
  grn_entries: [
    { grn_no: "GRN/2026/001", grn_date: "2026-01-10", received_qty: 600, rate: 30, amount: 18000 },
    { grn_no: "GRN/2026/002", grn_date: "2026-02-05", received_qty: 400, rate: 30, amount: 12000 },
  ],
  gin_entries: [
    { gin_no: "GIN/2026/001", gin_date: "2026-03-01", issued_qty: 150, rate: 30, amount: 4500 },
    { gin_no: "GIN/2026/002", gin_date: "2026-04-15", issued_qty: 100, rate: 30, amount: 3000 },
  ],
});

export default function StockItemDetailModal({ item, projectCode, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!item || !projectCode) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await apiRequest({
          url: `${API_ENDPOINTS.RESOURCE.MATERIAL_MANAGEMENT.STOCK.ITEM_DETAIL}?project_code=${projectCode}&item_code=${item.item_code}`,
          method: "GET",
        });
        const d = res.data;
        const isEmpty = !d?.grn_entries?.length && !d?.gin_entries?.length;

        // TODO: remove this dummy fallback once API returns real data
        setDetail(isEmpty ? DUMMY_DETAIL(item.item_code, item.item_name, item.unit) : d);
      } catch {
        toast.error("Failed to fetch item detail");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [item, projectCode]);

  // ─── LEDGER FILTERS
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo]     = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL"); // "ALL" | "GRN" | "GIN"

  const fmtDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const fmtNum = (n) =>
    n === null || n === undefined
      ? "-"
      : Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-b from-[#f4f4f4] to-[#e3e3e3] border-b border-[#c4d1df]">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Item Detail</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {item?.item_code} — {item?.item_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#4d8ea3]" size={28} />
          </div>
        ) : !detail ? (
          <div className="flex-1 flex items-center justify-center py-12 text-sm text-gray-400">
            No detail available
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard label="Unit" value={detail.summary.unit || "-"} icon={<Package size={14} />} />
              <SummaryCard label="Total Received" value={`${fmtNum(detail.summary.total_received_qty)} ${detail.summary.unit || ""}`} sub={`₹ ${fmtNum(detail.summary.total_received_amount)}`} color="text-green-700" />
              <SummaryCard label="Total Issued" value={`${fmtNum(detail.summary.total_issued_qty)} ${detail.summary.unit || ""}`} sub={`₹ ${fmtNum(detail.summary.total_issued_amount)}`} color="text-red-600" />
              <SummaryCard label="Stock" value={`${fmtNum(detail.summary.stock_qty)} ${detail.summary.unit || ""}`} sub={`₹ ${fmtNum(detail.summary.stock_amount)}`} color="text-blue-700" highlight />
            </div>

            {/* DATE-WISE LEDGER */}
            {(() => {
              // Merge GRN and GIN into a single chronological ledger
              const grns = (detail.grn_entries || []).map((g) => ({
                date: g.grn_date, no: g.grn_no, type: "GRN",
                qty_in: g.received_qty, qty_out: 0, rate: g.rate, amount: g.amount,
              }));
              const gins = (detail.gin_entries || []).map((g) => ({
                date: g.gin_date, no: g.gin_no, type: "GIN",
                qty_in: 0, qty_out: g.issued_qty, rate: g.rate, amount: g.amount,
              }));
              const ledger = [...grns, ...gins].sort((a, b) => new Date(a.date) - new Date(b.date));

              // Compute running balance on the FULL ledger first (unfiltered)
              let runQty = 0, runAmt = 0;
              const allRows = ledger.map((e) => {
                runQty += e.qty_in - e.qty_out;
                runAmt += e.type === "GRN" ? e.amount : -e.amount;
                return { ...e, balQty: runQty, balAmt: runAmt };
              });

              // Apply filters on top of the computed rows
              const rows = allRows.filter((r) => {
                if (typeFilter !== "ALL" && r.type !== typeFilter) return false;
                if (filterFrom && r.date < filterFrom) return false;
                if (filterTo   && r.date > filterTo)   return false;
                return true;
              });

              if (allRows.length === 0) return (
                <p className="text-xs text-gray-400 text-center py-4">No movement entries found</p>
              );

              const hasActiveFilter = typeFilter !== "ALL" || filterFrom || filterTo;

              return (
                <div className="space-y-2">
                {/* LEDGER FILTERS */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Date range */}
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 bg-[#b4b4d9] border border-[#6a6aa8] text-xs rounded-sm whitespace-nowrap">From</span>
                    <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)}
                      className="h-6.5 w-34 border border-[#8f8f8f] px-2 text-xs rounded-sm outline-none" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-3 py-0.5 bg-[#b4b4d9] border border-[#6a6aa8] text-xs rounded-sm whitespace-nowrap">To</span>
                    <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)}
                      className="h-6.5 w-34 border border-[#8f8f8f] px-2 text-xs rounded-sm outline-none" />
                  </div>

                  {/* Type toggle */}
                  <div className="flex items-center rounded-sm border border-[#8f8f8f] overflow-hidden text-xs">
                    {["ALL", "GRN", "GIN"].map((t) => (
                      <button key={t} onClick={() => setTypeFilter(t)}
                        className={`px-3 py-0.5 transition ${
                          typeFilter === t
                            ? t === "GRN" ? "bg-green-600 text-white" : t === "GIN" ? "bg-red-500 text-white" : "bg-[#7fc3d4] text-black font-semibold"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Clear */}
                  {hasActiveFilter && (
                    <button onClick={() => { setFilterFrom(""); setFilterTo(""); setTypeFilter("ALL"); }}
                      className="text-xs text-blue-500 hover:text-blue-700 underline">
                      Clear filters
                    </button>
                  )}

                  <span className="ml-auto text-xs text-gray-400">
                    {rows.length} of {allRows.length} entries
                  </span>
                </div>

                <div className="border border-[#9e9e9e] overflow-x-auto">
                  <table className="w-full min-w-max border-collapse text-xs">
                    <thead className="bg-[#b7cfa5] sticky top-0 z-10">
                      <tr>
                        <th className="border border-[#9e9e9e] px-2 py-1.5 text-left font-semibold w-[40px]">#</th>
                        <th className="border border-[#9e9e9e] px-2 py-1.5 text-left font-semibold">Date</th>
                        <th className="border border-[#9e9e9e] px-2 py-1.5 text-center font-semibold w-[50px]">Type</th>
                        <th className="border border-[#9e9e9e] px-2 py-1.5 text-left font-semibold">Voucher No</th>
                        <th className="border border-[#9e9e9e] px-2 py-1.5 text-right font-semibold">Rate (₹)</th>
                        <th className="border border-[#9e9e9e] px-2 py-1.5 text-right font-semibold text-green-700">In Qty</th>
                        <th className="border border-[#9e9e9e] px-2 py-1.5 text-right font-semibold text-red-600">Out Qty</th>
                        <th className="border border-[#9e9e9e] px-2 py-1.5 text-right font-semibold">Amount (₹)</th>
                        <th className="border border-[#9e9e9e] px-2 py-1.5 text-right font-semibold text-blue-700">Bal Qty</th>
                        <th className="border border-[#9e9e9e] px-2 py-1.5 text-right font-semibold text-blue-700">Bal Amt (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => {
                        const isGRN = r.type === "GRN";
                        return (
                          <tr key={i} className={i % 2 === 0 ? "bg-[#f2f2f2]" : "bg-white"}>
                            <td className="border border-[#e6e4e4] px-2 py-1.5 text-center text-gray-500">{i + 1}</td>
                            <td className="border border-[#e6e4e4] px-2 py-1.5 whitespace-nowrap">{fmtDate(r.date)}</td>
                            <td className="border border-[#e6e4e4] px-2 py-1.5 text-center">
                              <span className={`inline-flex items-center gap-0.5 font-semibold ${isGRN ? "text-green-700" : "text-red-600"}`}>
                                {isGRN
                                  ? <ArrowDownCircle size={11} className="shrink-0" />
                                  : <ArrowUpCircle size={11} className="shrink-0" />}
                                {r.type}
                              </span>
                            </td>
                            <td className={`border border-[#e6e4e4] px-2 py-1.5 font-medium ${isGRN ? "text-green-800" : "text-red-700"}`}>{r.no}</td>
                            <td className="border border-[#e6e4e4] px-2 py-1.5 text-right">{fmtNum(r.rate)}</td>
                            <td className="border border-[#e6e4e4] px-2 py-1.5 text-right font-medium text-green-700">
                              {r.qty_in > 0 ? fmtNum(r.qty_in) : "-"}
                            </td>
                            <td className="border border-[#e6e4e4] px-2 py-1.5 text-right font-medium text-red-600">
                              {r.qty_out > 0 ? fmtNum(r.qty_out) : "-"}
                            </td>
                            <td className={`border border-[#e6e4e4] px-2 py-1.5 text-right font-medium ${isGRN ? "text-green-700" : "text-red-600"}`}>
                              {isGRN ? "" : "−"}{fmtNum(r.amount)}
                            </td>
                            <td className="border border-[#e6e4e4] px-2 py-1.5 text-right font-semibold text-blue-700">{fmtNum(r.balQty)}</td>
                            <td className="border border-[#e6e4e4] px-2 py-1.5 text-right font-semibold text-blue-700">{fmtNum(r.balAmt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                </div>
              );
            })()}

          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, color = "text-gray-800", icon, highlight }) {
  return (
    <div className={`rounded-md border px-3 py-2.5 text-xs ${highlight ? "border-[#4d8ea3] bg-[#eef6fa]" : "border-gray-200 bg-gray-50"}`}>
      <div className="flex items-center gap-1 text-gray-500 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`font-semibold text-sm ${color}`}>{value}</div>
      {sub && <div className="text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}
