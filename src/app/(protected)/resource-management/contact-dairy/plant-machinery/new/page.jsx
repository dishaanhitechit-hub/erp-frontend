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
  const access = getPageAccess({ pageCode: "contact_dairy_plant_machinery", pageType: "ADD" });
  if (!access.allowed) return <PageNotAvailable />;

  const actions = getPageActions({ router });
  return (
    <HeaderWrapper header={<PageHeader actions={actions} />}>
      <SupplierForm
        pageType="Plant_Machinery"
        mode="create"
        listPath="/resource-management/contact-dairy/plant-machinery"
      />
    </HeaderWrapper>
  );
}
