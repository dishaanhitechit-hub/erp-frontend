"use client";

import { getPageAccess } from "@/helper/getPageAccess";
import PageNotAvailable from "@/components/common/PageNotAvailable";
import SupplierListPage from "@/components/contact-dairy/SupplierListPage";

export default function Page() {
  // const access = getPageAccess({ pageCode: "contact_dairy_work_force", pageType: "LIST" });
  const access = getPageAccess({ pageCode: "order", pageType: "LIST" });
  if (!access.allowed) return <PageNotAvailable />;

  return (
    <SupplierListPage
      pageType="Work_Force"
      basePath="/resource-management/contact-dairy/work-force"
      pageLabel="Work Force"
      canAdd={access.canAdd}
    />
  );
}
