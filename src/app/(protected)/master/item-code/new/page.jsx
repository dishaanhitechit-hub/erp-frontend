"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import { Loader2 } from "lucide-react";
import ItemForm from "@/components/master/item/ItemForm";

export default function Page() {
  const [categories, setCategories] = useState([]);
  const [ccList, setCcList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [c, cc] = await Promise.all([
        apiRequest({ url: API_ENDPOINTS.MASTER.GET_ALL_CATEGORY }),
        apiRequest({ url: API_ENDPOINTS.MASTER.GET_ALL_CC_CODE }),
      ]);

      setCategories(c.data || []);
      setCcList(cc.data || []);
      setLoading(false);
    };

    fetchAll();
  }, []);

  if (loading) return <Loader2 className="animate-spin m-auto mt-10" />;

  return <ItemForm mode="create" categories={categories} ccList={ccList} />;
}