"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import { Loader2 } from "lucide-react";
import AssetForm from "@/components/master/asset/AssetForm";

export default function Page() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await apiRequest({
        url: API_ENDPOINTS.MASTER.GET_ALL_CATEGORY,
      });

      setCategories(res.data || []);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) return <Loader2 className="animate-spin m-auto mt-10" />;

  return <AssetForm mode="create" categories={categories} />;
}