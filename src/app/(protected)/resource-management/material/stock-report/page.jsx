"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import { getLocalStorage } from "@/lib/localStorage";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import SearchSection from "@/components/common/SearchSection";
import PageHeader from "@/components/layout/PageHeader";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import { getPageActions } from "@/components/common/PageActionButtons";
import StockTable from "@/components/resource/stock/StockTable";
import StockItemDetailModal from "@/components/resource/stock/StockItemDetailModal";
import PageNotAvailable from "@/components/common/PageNotAvailable";
import { getPageAccess } from "@/helper/getPageAccess";

export default function StockReportPage() {
  const router = useRouter();
  const access = getPageAccess({ pageCode: "stock_report", pageType: "LIST" });

  const [projectCode, setProjectCode] = useState("");
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const [appliedSearch, setAppliedSearch] = useState({ search: "", from: "", to: "" });

  useEffect(() => {
    const projectInfo = getLocalStorage("projectInfo") || {};
    setProjectCode(projectInfo?.projectCode || "");
  }, []);

  useEffect(() => {
    if (!projectCode || !access.allowed) return;
    const fetchStock = async () => {
      setLoading(true);
      try {
        const res = await apiRequest({
          url: `${API_ENDPOINTS.RESOURCE.MATERIAL_MANAGEMENT.STOCK.LIST}?project_code=${projectCode}&item_category=MAT_001`,
          method: "GET",
        });
        setRawData(res.data || []);
      } catch {
        toast.error("Failed to fetch stock data");
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [projectCode]);

  const handleSearch = ({ search: s, from, to }) => {
    setAppliedSearch({ search: s, from, to });
  };

  // Filter: contain search filters item names/codes, date range filters items by...
  // Since stock items don't have dates, date search is handled by GRN/GIN dates in detail.
  // For the list view, date range and contain search filter on item_name and item_code within each group.
  const filteredData = useMemo(() => {
    const { search: s, from, to } = appliedSearch;
    if (!s && !from && !to) return rawData;

    return rawData
      .map((group) => {
        let items = group.items || [];

        // text search on item name or code
        if (s) {
          const lower = s.toLowerCase();
          items = items.filter(
            (item) =>
              item.item_name?.toLowerCase().includes(lower) ||
              item.item_code?.toLowerCase().includes(lower) ||
              group.cc_code?.toLowerCase().includes(lower) ||
              group.cc_name?.toLowerCase().includes(lower)
          );
        }

        // For date range: no date field on list items, so skip silently
        // (date filtering will apply to item-detail level)

        return { ...group, items };
      })
      .filter((group) => group.items.length > 0);
  }, [rawData, appliedSearch]);

  if (!access.allowed) return <PageNotAvailable />;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  const headerActions = getPageActions({ router });

  const pageActions = [
    {
      label: "Closing Stock List",
      onClick: () => toast.info("Closing Stock List — coming soon"),
    },
    {
      label: "+ Create Closing Stock",
      onClick: () => toast.info("Create Closing Stock — coming soon"),
    },
  ];

  return (
    <HeaderWrapper header={<PageHeader actions={headerActions} />}>
      <div className="px-3 py-3">
        <SearchSection
          onSearch={handleSearch}
          showDateRange
          actions={pageActions}
        />
        <StockTable
          data={filteredData}
          onItemClick={(item) => setSelectedItem(item)}
        />
        {selectedItem && (
          <StockItemDetailModal
            item={selectedItem}
            projectCode={projectCode}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </div>
    </HeaderWrapper>
  );
}
