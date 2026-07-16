"use client";

import { getPageAccess } from "@/helper/getPageAccess";
import PageNotAvailable from "@/components/common/PageNotAvailable";
import SupplierListPage from "@/components/contact-dairy/SupplierListPage";

export default function Page() {
  const access = getPageAccess({ pageCode: "contact_dairy_materials", pageType: "LIST" });
  if (!access.allowed) return <PageNotAvailable />;

  return (
    <SupplierListPage
      pageType="Materials"
      basePath="/resource-management/contact-dairy/materials"
      pageLabel="Materials"
      canAdd={access.canAdd}
    />
  );
}
