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

const DUMMY_STOCK_DATA = [
  {
    sl_no: 1,
    cc_code: "DRMC",
    cc_name: "Consumable Materials",
    total_stock_amount: 161000.00,
    items: [
      { sl_no: "1.1", item_code: "DRMC001", item_name: "Cement 53 Grade", unit: "BAG", received_qty: 1000, issued_qty: 250, stock_qty: 750, stock_amount: 22500 },
      { sl_no: "1.2", item_code: "DRMC002", item_name: "TMT -550Fe", unit: "MT", received_qty: 1.50, issued_qty: 1.20, stock_qty: 0.30, stock_amount: 24000 },
      { sl_no: "1.3", item_code: "DRMC003", item_name: "Sand-Fine", unit: "Cft", received_qty: 2600, issued_qty: 2100, stock_qty: 500, stock_amount: 40000 },
      { sl_no: "1.4", item_code: "DRMC004", item_name: "Stone-20mm", unit: "Cft", received_qty: 1250, issued_qty: 1000, stock_qty: 250, stock_amount: 25000 },
      { sl_no: "1.5", item_code: "DRMC005", item_name: "Bricks 250x125x75", unit: "PCs", received_qty: 15000, issued_qty: 10000, stock_qty: 5000, stock_amount: 50000 },
    ],
  },
  {
    sl_no: 2,
    cc_code: "DREL",
    cc_name: "Electrical Materials",
    total_stock_amount: 87500.00,
    items: [
      { sl_no: "2.1", item_code: "DREL001", item_name: "Copper Wire 2.5mm", unit: "MTR", received_qty: 5000, issued_qty: 3200, stock_qty: 1800, stock_amount: 36000 },
      { sl_no: "2.2", item_code: "DREL002", item_name: "MCB 32A", unit: "NOS", received_qty: 200, issued_qty: 150, stock_qty: 50, stock_amount: 12500 },
      { sl_no: "2.3", item_code: "DREL003", item_name: "PVC Conduit 25mm", unit: "MTR", received_qty: 1000, issued_qty: 600, stock_qty: 400, stock_amount: 8000 },
      { sl_no: "2.4", item_code: "DREL004", item_name: "Distribution Board", unit: "NOS", received_qty: 10, issued_qty: 7, stock_qty: 3, stock_amount: 31000 },
    ],
  },
];

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
        const apiData = res.data || [];
        setRawData(apiData.length > 0 ? apiData : DUMMY_STOCK_DATA);
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
