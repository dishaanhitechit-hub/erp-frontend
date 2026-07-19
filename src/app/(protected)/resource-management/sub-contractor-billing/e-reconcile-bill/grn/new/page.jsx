"use client";

import { useRouter } from "next/navigation";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import PageHeader from "@/components/layout/PageHeader";
import { getPageActions } from "@/components/common/PageActionButtons";
import { getPageAccess } from "@/helper/getPageAccess";
import PageNotAvailable from "@/components/common/PageNotAvailable";
import BVSForm from "@/components/resource/bvs/BVSForm";

export default function Page() {
  const router = useRouter();
  const access = getPageAccess({ pageCode: "billing_by_grn", pageType: "ADD" });

  if (!access.allowed) return <PageNotAvailable />;

  const actions = getPageActions({ router });

  return (
    <HeaderWrapper header={<PageHeader actions={actions} />}>
      <BVSForm mode={access.mode} />
    </HeaderWrapper>
  );
}
