"use client";

import { useRouter } from "next/navigation";
import { getPageAccess } from "@/helper/getPageAccess";
import PageNotAvailable from "@/components/common/PageNotAvailable";
import PageHeader from "@/components/layout/PageHeader";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import { getPageActions } from "@/components/common/PageActionButtons";
import SupplierForm from "@/components/contact-dairy/SupplierForm";

export default function Page() {
  const router = useRouter();
  const access = getPageAccess({ pageCode: "contact_dairy_work_force", pageType: "ADD" });
  if (!access.allowed) return <PageNotAvailable />;

  const actions = getPageActions({ router });
  return (
    <HeaderWrapper header={<PageHeader actions={actions} />}>
      <SupplierForm
        pageType="Work_Force"
        mode="create"
        listPath="/resource-management/contact-dairy/work-force"
      />
    </HeaderWrapper>
  );
}
