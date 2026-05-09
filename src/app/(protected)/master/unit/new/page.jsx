"use client";

import { getPageActions } from "@/components/common/PageActionButtons";
import PageHeader from "@/components/layout/PageHeader";
import UnitForm from "@/components/master/unit/UnitForm";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const actions = getPageActions({
    onHome: () => router.push("/dashboard"),
    onBack: () => router.back(),
  });
  return (
    <>
      <PageHeader actions={actions} />
      <UnitForm mode="create" />
    </>
  );
}
