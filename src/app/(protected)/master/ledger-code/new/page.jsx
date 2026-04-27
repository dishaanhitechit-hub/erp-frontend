"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import LedgerForm from "@/components/master/ledger/LedgerForm";

export default function Page() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiRequest({
          url: API_ENDPOINTS.MASTER.GET_ALL_CATEGORY,
        });

        setCategories(res.data || []);
      } catch (err) {
        toast.error(err.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  return <LedgerForm mode="create" categories={categories} />;
}