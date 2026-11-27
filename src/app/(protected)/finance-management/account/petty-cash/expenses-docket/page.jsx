"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter }           from "next/navigation";
import { EdoxMark } from "@/components/common/EdoxLoader";
import { toast }               from "sonner";

import SearchSection    from "@/components/common/SearchSection";
import BulkWorkflowTable from "@/components/common/BulkWorkflowTable";
import { useDeletePendingIds } from "@/hooks/useDeletePendingIds";
import PageHeader       from "@/components/layout/PageHeader";
import HeaderWrapper    from "@/components/layout/HeaderWrapper";
import PageNotAvailable from "@/components/common/PageNotAvailable";
import { getPageActions }    from "@/components/common/PageActionButtons";
import { getPageAccess }     from "@/helper/getPageAccess";
import { apiRequest }        from "@/lib/apiClient";
import { API_ENDPOINTS }     from "@/config/api.config";
import { getLocalStorage }   from "@/lib/localStorage";
import { getfmtDisplaydate } from "@/helper/getfmtDisplayDate";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function DocketVoucherListPage() {
  const router = useRouter();
  const access = getPageAccess({ pageCode: "petty_cash", pageType: "LIST" });

  const [data,         setData]         = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading,      setLoading]      = useState(true);

  const [pickedHead,   setCcHead]       = useState("");   // "" = all CC heads

  const projectCode = getLocalStorage("projectInfo")?.projectCode || "";

  useEffect(() => {
    if (!projectCode || !access.allowed) return;
    apiRequest({
      url:    `${API_ENDPOINTS.FINANCE.PETTY_CASH.DOCKET_VOUCHER.LIST}?projectCode=${projectCode}`,
      method: "GET",
    })
      .then((res) => {
        const list = res.data?.list || res.data || [];
        const rows = list.map((r, i) => ({
          createdTs: r.createdTs,
          sl:             i + 1,
          _id:            r.id,
          voucherNo:      r.voucherNo                       || "",
          date:           getfmtDisplaydate(r.voucherDate)  || "",
          budgetNo:       r.budgetNo                        || "",
          expensesBy:     r.expensesBy                      || "",
          modeOfPayment:  r.modeOfPayment                   || "",
          bankCode:       r.bankCode                        || "—",
          paymentRefId:   r.paymentRefId                    || "",
          ccNames:        r.ccNames                         || "",
          _cc:            r.ccBreakdown                     || [],
          _total:         Number(r.totalAmount || 0),
          amount:         Number(r.totalAmount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2, maximumFractionDigits: 2,
          }),

          workflowStatus: r.workflowStatus || "",
          createdBy:      r.createdBy      || "",
          _raw:           r,
        }));
        setData(rows);
        setFilteredData(rows);
      })
      .catch(() => toast.error("Failed to fetch voucher docket list"))
      .finally(() => setLoading(false));
  }, [projectCode, access.allowed]);

  const handleSearch = ({ search, from, to }) => {
    let filtered = [...data];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((r) =>
        ["voucherNo", "budgetNo", "expensesBy", "modeOfPayment", "bankCode", "workflowStatus", "createdBy"].some(
          (k) => String(r[k] || "").toLowerCase().includes(q),
        ),
      );
    }
    if (from || to) {
      filtered = filtered.filter((r) => {
        const raw = data.find((d) => d._id === r._id)?._raw?.voucherDate;
        if (!raw) return false;
        const d = new Date(raw); d.setHours(0, 0, 0, 0);
        if (from) { const f = new Date(from); f.setHours(0, 0, 0, 0); if (d < f) return false; }
        if (to)   { const t = new Date(to);   t.setHours(0, 0, 0, 0); if (d > t) return false; }
        return true;
      });
    }
    setFilteredData(filtered);
  };

  // Totals per CC head over the rows that pass search / date (line amounts,
  // so a docket split across heads counts each head's own share).
  const ccTotals = useMemo(() => {
    const map = new Map();
    filteredData.forEach((r) => r._cc.forEach((c) => {
      const t = map.get(c.ccName) || { ccName: c.ccName, amount: 0, count: 0 };
      t.amount += Number(c.amount || 0);
      t.count  += 1;
      map.set(c.ccName, t);
    }));
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  }, [filteredData]);

  const grandTotal = useMemo(() => filteredData.reduce((s, r) => s + r._total, 0), [filteredData]);

  // Picked head no longer present (search / date changed) → treat as all
  const ccHead = ccTotals.some((t) => t.ccName === pickedHead) ? pickedHead : "";

  // With a head picked: only dockets that have it, plus that head's own amount
  const tableData = useMemo(() => {
    if (!ccHead) return filteredData;
    return filteredData
      .filter((r) => r._cc.some((c) => c.ccName === ccHead))
      .map((r) => ({ ...r, ccAmount: fmt(r._cc.filter((c) => c.ccName === ccHead).reduce((s, c) => s + Number(c.amount || 0), 0)) }));
  }, [filteredData, ccHead]);

  const columns = [
    { header: "Sl. no",       accessor: "sl",             width: "55px"  },
    { header: "Docket No",    accessor: "voucherNo",      width: "120px" },
    { header: "Date",         accessor: "date",           width: "100px" },
    { header: "Budget Ref",   accessor: "budgetNo",       width: "110px" },
    { header: "Expenses By",  accessor: "expensesBy",     width: "130px" },
    { header: "Payment Mode", accessor: "modeOfPayment",  width: "120px" },
    { header: "Account",      accessor: "bankCode",       width: "110px" },
    { header: "Trans. ID",    accessor: "paymentRefId",   width: "120px" },
    { header: "CC Head",      accessor: "ccNames",        width: "150px" },
    ...(ccHead ? [{ header: `${ccHead} Amt`, accessor: "ccAmount", width: "120px", align: "right" }] : []),
    { header: "Docket Amount", accessor: "amount",        width: "110px", align: "right" },
    { header: "Status",       accessor: "workflowStatus", width: "110px" },
    { header: "Created By",   accessor: "createdBy",      width: "120px" },
  ];

  const summaryRow = ccHead
    ? { ccAmount: { align: "right" }, amount: { align: "right" } }
    : { amount: { align: "right" } };

  const actions = getPageActions({ router });

  const pendingDeleteIds = useDeletePendingIds("PETTY_CASH_VOUCHER", access.allowed);

  if (!access.allowed) return <PageNotAvailable />;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <EdoxMark size={32} />
      </div>
    );
  }

  return (
    <HeaderWrapper header={<PageHeader actions={actions} />}>
      <div className="p-3 space-y-3">
        <SearchSection
          onSearch={handleSearch}
          showDateRange
          actions={
            access.canAdd
              ? [
                  { label: "+ Expenses Docket", onClick: () => router.push("/finance-management/account/petty-cash/expenses-docket/new") },
                  { label: "Bulk Upload",       onClick: () => router.push("/finance-management/account/petty-cash/expenses-docket/bulk-upload") },
                ]
              : []
          }
        />

        {/* CC head picker with the total spent on each head */}
        <div className="flex flex-wrap items-center gap-2 rounded-sm border border-gray-200 bg-white p-2 text-[12px]">
          <span className="font-semibold text-[#144664]">CC Head:</span>
          <button
            type="button"
            onClick={() => setCcHead("")}
            className={`rounded-sm border px-2 py-[2px] ${!ccHead ? "border-[#144664] bg-[#144664] text-white" : "border-[#6d9dc5] bg-[#e8f2ff] text-[#144664] hover:brightness-95"}`}
          >
            All · ₹ {fmt(grandTotal)} <span className="opacity-70">({filteredData.length})</span>
          </button>
          {ccTotals.map((t) => (
            <button
              key={t.ccName}
              type="button"
              onClick={() => setCcHead(ccHead === t.ccName ? "" : t.ccName)}
              className={`rounded-sm border px-2 py-[2px] ${ccHead === t.ccName ? "border-[#144664] bg-[#144664] text-white" : "border-gray-300 bg-gray-50 text-gray-800 hover:bg-gray-100"}`}
            >
              {t.ccName} · ₹ {fmt(t.amount)} <span className="opacity-70">({t.count})</span>
            </button>
          ))}
          <span className="ml-auto font-semibold text-[#144664]">
            {ccHead ? `${ccHead} spent: ₹ ${fmt(ccTotals.find((t) => t.ccName === ccHead)?.amount)}` : `Total spent: ₹ ${fmt(grandTotal)}`}
          </span>
        </div>

        <BulkWorkflowTable module="petty_cash_docket" canAct={access.canApprove} rowId="_id" statusKey="workflowStatus"
          columns={columns}
          data={tableData}
          summaryRow={summaryRow}
          onRowClick={(row) => {
            if (!access.canOpenDetails) return;
            router.push(`/finance-management/account/petty-cash/expenses-docket/${row._id}`);
          }}
          pendingDeleteIds={pendingDeleteIds}
        />
      </div>
    </HeaderWrapper>
  );
}
