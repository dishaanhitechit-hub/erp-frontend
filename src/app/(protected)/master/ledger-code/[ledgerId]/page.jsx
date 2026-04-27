"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import LedgerForm from "@/components/master/ledger/LedgerForm";

export default function Page() {
  const { ledgerId } = useParams();
  const [data, setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!ledgerId) return;

    const fetchAll = async () => {
      try {
        const [ledgerRes, categoryRes] = await Promise.all([
          apiRequest({
            url: `${API_ENDPOINTS.MASTER.GET_LEDGER_BY_ID}/${ledgerId}`,
          }),
          apiRequest({
            url: API_ENDPOINTS.MASTER.GET_ALL_CATEGORY,
          }),
        ]);

        setData(ledgerRes.data[0]);
        setCategories(categoryRes.data || []);
      } catch (err) {
        toast.error(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [ledgerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  return <LedgerForm mode="edit" ledgerId={ledgerId} initialData={data} categories={categories}/>;
}