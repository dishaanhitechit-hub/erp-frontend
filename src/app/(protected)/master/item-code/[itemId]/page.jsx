"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import { Loader2 } from "lucide-react";
import ItemForm from "@/components/master/item/ItemForm";

export default function Page() {
  const { itemId } = useParams();

  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [ccList, setCcList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [itemRes, c, cc] = await Promise.all([
        apiRequest({ url: `${API_ENDPOINTS.MASTER.GET_ITEM_BY_ID}/${itemId}` }),
        apiRequest({ url: API_ENDPOINTS.MASTER.GET_ALL_CATEGORY }),
        apiRequest({ url: API_ENDPOINTS.MASTER.GET_ALL_CC_CODE }),
      ]);

      setData(itemRes.data[0]);
      setCategories(c.data || []);
      setCcList(cc.data || []);
      setLoading(false);
    };

    fetchAll();
  }, [itemId]);

  if (loading) return <Loader2 className="animate-spin m-auto mt-10" />;

  return (
    <ItemForm
      mode="edit"
      itemId={itemId}
      initialData={data}
      categories={categories}
      ccList={ccList}
    />
  );
}