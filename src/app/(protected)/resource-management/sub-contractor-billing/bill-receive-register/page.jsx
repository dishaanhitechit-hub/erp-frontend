"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SearchSection from "@/components/common/SearchSection";
import DataTable from "@/components/common/DataTable";
import PageHeader from "@/components/layout/PageHeader";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import PageNotAvailable from "@/components/common/PageNotAvailable";
import { getPageActions } from "@/components/common/PageActionButtons";
import { getPageAccess } from "@/helper/getPageAccess";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import { getLocalStorage } from "@/lib/localStorage";
import { getfmtDisplaydate } from "@/helper/getfmtDisplayDate";

const fmt = (v) =>
  Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });


export default function Page() {
  const router = useRouter();
  const access = getPageAccess({ pageCode: "bill_receive_register", pageType: "LIST" });

  const [data, setData]             = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [projectCode, setProjectCode] = useState("");

  useEffect(() => {
    const info = getLocalStorage("projectInfo") || {};
    setProjectCode(info?.projectCode || "");
  }, []);

  useEffect(() => {
    if (!projectCode || !access.allowed) return;
    const fetch = async () => {
      try {
        const res = await apiRequest({
          url: `${API_ENDPOINTS.RESOURCE.BILL_RECEIVE_REGISTER.LIST}?projectCode=${projectCode}`,
          method: "GET",
        });
        const list = (res.data || []).map((item, idx) => ({
          id:           item.brrId ?? item.id,
          sl:           idx + 1,
          brrNo:        item.brrNo || "",
          brrDate:      getfmtDisplaydate(item.brrDate),
          partyName:    item.partyName || "",
          partyBillNo:  item.partyBillNo || "",
          partyDate:    getfmtDisplaydate(item.partyDate),
          basicAmount:  fmt(item.basicAmount),
          gstAmount:    fmt(item.gstAmount),
          totalAmount:   fmt(item.totalAmount),
          bookedAmount:  fmt(item.bookedAmount),
          status:        item.workflowStatus || "",
        }));
        setData(list);
        setFilteredData(list);
      } catch (err) {
        toast.error(err.message || "Failed to fetch BRR list");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [projectCode, access.allowed]);

  const handleSearch = ({ search, from, to }) => {
    let filtered = [...data];
    if (search) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
    if (from || to) {
      filtered = filtered.filter((item) => {
        if (!item.brrDate) return false;
        const d = new Date(item.brrDate);
        d.setHours(0, 0, 0, 0);
        if (from) { const f = new Date(from); f.setHours(0,0,0,0); if (d < f) return false; }
        if (to)   { const t = new Date(to);   t.setHours(0,0,0,0); if (d > t) return false; }
        return true;
      });
    }
    setFilteredData(filtered);
  };

  const columns = [
    { header: "Sl. No",       accessor: "sl" },
    { header: "BRR No",       accessor: "brrNo" },
    { header: "Date",         accessor: "brrDate" },
    { header: "Party Name",   accessor: "partyName" },
    { header: "Party Bill No",accessor: "partyBillNo" },
    { header: "Party Date",   accessor: "partyDate" },
    { header: "Basic",        accessor: "basicAmount" },
    { header: "GST",          accessor: "gstAmount" },
    { header: "Total",         accessor: "totalAmount" },
    { header: "Booked Amount", accessor: "bookedAmount" },
    { header: "Status",        accessor: "status" },
  ];

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
          showDateRange={true}
          actions={
            access.canAdd
              ? [{ label: "+ Create BRR", onClick: () => router.push("/resource-management/sub-contractor-billing/bill-receive-register/new") }]
              : []
          }
        />
        <DataTable
          columns={columns}
          data={filteredData}
          onRowClick={(row) =>
            router.push(`/resource-management/sub-contractor-billing/bill-receive-register/${row.id}`)
          }
        />
      </div>
    </HeaderWrapper>
  );
}
