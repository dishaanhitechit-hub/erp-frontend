"use client";

import { useRouter } from "next/navigation";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import PageHeader from "@/components/layout/PageHeader";
import { getPageActions } from "@/components/common/PageActionButtons";
import { getPageAccess } from "@/helper/getPageAccess";
import PageNotAvailable from "@/components/common/PageNotAvailable";
import BRRForm from "@/components/resource/brr/BRRForm";

export default function Page() {
  const router = useRouter();
  const access = getPageAccess({ pageCode: "bill_receive_register", pageType: "ADD" });

  if (!access.allowed) return <PageNotAvailable />;

  const actions = getPageActions({ router });

  return (
    <HeaderWrapper header={<PageHeader actions={actions} />}>
      <BRRForm mode={access.mode} />
    </HeaderWrapper>
  );
}
