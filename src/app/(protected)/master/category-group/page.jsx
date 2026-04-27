"use client";

import GroupCategorySection from "@/components/master/group-category/GroupCategorySection";
import { API_ENDPOINTS } from "@/config/api.config";

export default function Page() {
  return (
    <div className="p-4 grid md:grid-cols-2 gap-10">

      {/* GROUP */}
      <GroupCategorySection
        title="Group"
        addLabel="+ Add Group"
        listApi={API_ENDPOINTS.MASTER.GET_ALL_GROUP}
        createApi={API_ENDPOINTS.MASTER.CREATE_GROUP}
        updateApi={API_ENDPOINTS.MASTER.UPDATE_GROUP_BY_ID}
        nameKey="groupName"
        idKey="groupId"
        headOptions={["Profit & Loss", "Balance Sheet"]}
      />

      {/* CATEGORY */}
      <GroupCategorySection
        title="Category"
        addLabel="+ Add Category"
        listApi={API_ENDPOINTS.MASTER.GET_ALL_CATEGORY}
        createApi={API_ENDPOINTS.MASTER.CREATE_CATEGORY}
        updateApi={API_ENDPOINTS.MASTER.UPDATE_CATEGORY_BY_ID}
        nameKey="categoryName"
        idKey="categoryId"
        headOptions={["Items", "Ledger", "Unit", "Tax"]}
      />

    </div>
  );
}