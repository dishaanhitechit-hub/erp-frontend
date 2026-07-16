"use client";

import { getPageAccess } from "@/helper/getPageAccess";
import PageNotAvailable from "@/components/common/PageNotAvailable";
import SupplierListPage from "@/components/contact-dairy/SupplierListPage";

export default function Page() {
  // const access = getPageAccess({ pageCode: "contact_dairy_plant_machinery", pageType: "LIST" });
  const access = getPageAccess({ pageCode: "order", pageType: "LIST" });
  if (!access.allowed) return <PageNotAvailable />;

  return (
    <SupplierListPage
      pageType="Plant_Machinery"
      basePath="/resource-management/contact-dairy/plant-machinery"
      pageLabel="Plant & Machinery"
      canAdd={access.canAdd}
    />
  );
}
