"use client";

import { useParams, useRouter } from "next/navigation";

import HeaderWrapper from "@/components/layout/HeaderWrapper";
import PageHeader from "@/components/layout/PageHeader";
import PageNotAvailable from "@/components/common/PageNotAvailable";
import { getPageActions } from "@/components/common/PageActionButtons";
import { getPageAccess } from "@/helper/getPageAccess";
import ConcreteForm from "@/components/project-management/register/concrete/ConcreteForm";

export default function Page() {
  const router = useRouter();
  const { id } = useParams();

  const access = getPageAccess({ pageCode: "concrete_register", pageType: "EDIT" });

  if (!access.allowed) {
    return <PageNotAvailable />;
  }

  const actions = getPageActions({ router });

  return (
    <HeaderWrapper header={<PageHeader actions={actions} />}>
      <ConcreteForm mode={access.mode} registryId={id} />
    </HeaderWrapper>
  );
}
