"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import { Loader2 } from "lucide-react";
import AssetForm from "@/components/master/asset/AssetForm";

export default function Page() {
  const { assetId } = useParams();

  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [assetRes, catRes] = await Promise.all([
        apiRequest({ url: `${API_ENDPOINTS.MASTER.GET_ASSET_BY_ID}/${assetId}` }),
        apiRequest({ url: API_ENDPOINTS.MASTER.GET_ALL_CATEGORY }),
      ]);

      setData(assetRes.data[0]);
      setCategories(catRes.data || []);
      setLoading(false);
    };

    load();
  }, [assetId]);

  if (loading) return <Loader2 className="animate-spin m-auto mt-10" />;

  return (
    <AssetForm
      mode="edit"
      assetId={assetId}
      initialData={data}
      categories={categories}
    />
  );
}