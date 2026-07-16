"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import DataTable from "@/components/common/DataTable";
import SearchSection from "@/components/common/SearchSection";
import PageHeader from "@/components/layout/PageHeader";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import { getPageActions } from "@/components/common/PageActionButtons";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import MigrationModal from "./MigrationModal";
import { useRouter } from "next/navigation";

const columns = [
  { header: "Sl. No",                  accessor: "sl" },
  { header: "Supplier ID",             accessor: "supplierCode" },
  { header: "Supplier / Concern Name", accessor: "supplierName" },
  { header: "Address",                 accessor: "address" },
  { header: "Mobile Number",           accessor: "mobileNumber" },
  { header: "Nature of Product",       accessor: "natureOfService" },
  { header: "Product Details / List",  accessor: "serviceDescriptionShort" },
];

export default function SettingsSupplierListPage({ pageType, pageLabel }) {
  const router = useRouter();
  const [data, setData]         = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [migration, setMigration] = useState(false);

  const actions = getPageActions({ router });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiRequest({
          url: API_ENDPOINTS.SUPPLIER.LIST,
          method: "GET",
          params: { supplierType: pageType },
        });
        const list = Array.isArray(res?.data) ? res.data : [];
        const formatted = list.map((s, i) => ({
          ...s,
          sl: i + 1,
          address: s.registeredAddress || s.corporateAddress || "—",
          serviceDescriptionShort: s.serviceDescription
            ? s.serviceDescription.length > 40
              ? s.serviceDescription.slice(0, 40) + "…"
              : s.serviceDescription
            : "—",
          natureOfService: s.natureOfService || "—",
        }));
        setData(formatted);
        setFiltered(formatted);
      } catch (err) {
        toast.error(err?.message || "Failed to load suppliers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pageType]);

  const handleSearch = ({ search }) => {
    if (!search) { setFiltered(data); return; }
    const q = search.toLowerCase();
    setFiltered(
      data.filter((r) =>
        [r.supplierName, r.supplierCode, r.address, r.mobileNumber, r.natureOfService]
          .some((v) => String(v || "").toLowerCase().includes(q))
      )
    );
  };

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
          actions={[{ label: "Migration", onClick: () => setMigration(true) }]}
        />

        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(row) => router.push(`/master/contact-dairy/${pageType === "Work_Force" ? "work-force" : pageType === "Plant_Machinery" ? "plant-machinery" : "materials"}/${row.supplierId}`)}
        />

        <MigrationModal
          open={migration}
          onOpenChange={setMigration}
          supplierType={pageType}
        />
      </div>
    </HeaderWrapper>
  );
}
