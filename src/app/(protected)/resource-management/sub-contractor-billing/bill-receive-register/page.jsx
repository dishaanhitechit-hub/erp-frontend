"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SearchSection from "@/components/common/SearchSection";
import PageHeader from "@/components/layout/PageHeader";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import PageNotAvailable from "@/components/common/PageNotAvailable";
import { getPageActions } from "@/components/common/PageActionButtons";
import { getPageAccess } from "@/helper/getPageAccess";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import { getLocalStorage } from "@/lib/localStorage";
import { getfmtDisplaydate } from "@/helper/getfmtDisplayDate";
import BRRExpandableTable from "@/components/resource/brr/BRRExpandableTable";

const fmt = (v) =>
  Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Categories linked to GRN (BRG) billing
const GRN_CATEGORIES = ["Purchases_Order", "Site_Transfer_Order", "Customer_Supply_Order"];

export default function Page() {
  const router = useRouter();
  const access = getPageAccess({ pageCode: "bill_receive_register", pageType: "LIST" });

  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate]     = useState("");
  const [projectCode, setProjectCode] = useState("");

  useEffect(() => {
    const info = getLocalStorage("projectInfo") || {};
    setProjectCode(info?.projectCode || "");
  }, []);

  useEffect(() => {
    if (!projectCode || !access.allowed) return;
    const fetchList = async () => {
      try {
        const res = await apiRequest({
          url: `${API_ENDPOINTS.RESOURCE.BILL_RECEIVE_REGISTER.LIST}?projectCode=${projectCode}`,
          method: "GET",
        });
        const list = (res.data || []).map((item, idx) => {
          const billingType = GRN_CATEGORIES.includes(item.orderCategory) ? "grn" : "srn";

          // Normalize nested billing rows
          const grnBillings = (item.grnBillings || []).map((b) => ({
            billingNo:      b.brgNo || "",
            billingDate:    getfmtDisplaydate(b.brgDate),
            _rawDate:       b.brgDate || "",
            workflowStatus: b.workflowStatus || "",
            basicAmount:    fmt(b.basicAmount),
            gstAmount:      fmt(b.gstAmount),
            totalAmount:    fmt(b.totalAmount),
            itemCount:      b.itemCount ?? "-",
            _type:          "brg",
            _id:            b.brgId,
            _brrId:         item.id ?? item.brrId,
          }));

          const srnBillings = (item.srnBillings || []).map((b) => ({
            billingNo:      b.brsNo || "",
            billingDate:    getfmtDisplaydate(b.brsDate),
            _rawDate:       b.brsDate || "",
            workflowStatus: b.workflowStatus || "",
            basicAmount:    fmt(b.basicAmount),
            gstAmount:      fmt(b.gstAmount),
            totalAmount:    fmt(b.totalAmount),
            itemCount:      b.itemCount ?? "-",
            _type:          "brs",
            _id:            b.brsId,
            _brrId:         item.id ?? item.brrId,
          }));

          return {
            id:            item.id ?? item.brrId,
            _origIdx:      idx,
            brrNo:         item.brrNo || "",
            brrDate:       getfmtDisplaydate(item.brrDate),
            _rawDate:      item.brrDate || "",
            partyName:     item.partyName || "",
            orderCategory: item.orderCategory || "",
            orderNo:       item.orderNo || "",
            partyBillNo:   item.partyBillNo || "",
            partyDate:     getfmtDisplaydate(item.partyDate),
            basicAmount:   fmt(item.basicAmount),
            bookedAmount:  item.bookedAmount != null ? fmt(item.bookedAmount) : null,
            totalAmount:   fmt(item.totalAmount),
            status:        item.workflowStatus || "",
            billingType,
            grnBillings,
            srnBillings,
          };
        });
        setData(list);
      } catch (err) {
        toast.error(err.message || "Failed to fetch BRR list");
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [projectCode, access.allowed]);

  const handleSearch = ({ search: s, from, to }) => {
    setSearch(s || "");
    setFromDate(from || "");
    setToDate(to || "");
  };

  const displayData = data.filter((row) => {
    if (fromDate && row._rawDate && row._rawDate < fromDate) return false;
    if (toDate   && row._rawDate && row._rawDate > toDate)   return false;
    return true;
  });

  const handleParentRowClick = (row) => {
    router.push(`/resource-management/sub-contractor-billing/bill-receive-register/${row.id}`);
  };

  const handleCreateBilling = (row) => {
    router.push(
      `/resource-management/sub-contractor-billing/e-reconcile-bill/new?brrId=${row.id}&billingType=${row.billingType}`
    );
  };

  const handleChildRowClick = (childRow) => {
    const type = childRow._type; // "brg" or "brs"
    const id = childRow._id;
    const billingType = type === "brg" ? "brg" : "brs";
    router.push(
      `/resource-management/sub-contractor-billing/e-reconcile-bill/${id}?billingType=${billingType}`
    );
  };

  const actions = getPageActions({ router });

  if (!access.allowed) return <PageNotAvailable />;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  return (
    <HeaderWrapper header={<PageHeader actions={actions} />}>
      <div className="p-3">
        <SearchSection
          onSearch={handleSearch}
          showDateRange
          actions={
            access.canAdd
              ? [{ label: "+ Create BRR", onClick: () => router.push("/resource-management/sub-contractor-billing/bill-receive-register/new") }]
              : []
          }
        />
        <div className="mt-1 text-xs text-gray-500 mb-2">
          Click a BRR row to expand billing records · Click <span className="font-semibold text-blue-600">BRR No</span> to open details · Click a billing row to open e-reconcile bill
        </div>
        <BRRExpandableTable
          data={displayData}
          onParentRowClick={handleParentRowClick}
          onChildRowClick={handleChildRowClick}
          onCreateBilling={handleCreateBilling}
          search={search}
        />
      </div>
    </HeaderWrapper>
  );
}
