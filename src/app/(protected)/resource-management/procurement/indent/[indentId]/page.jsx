"use client";

import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

import HeaderWrapper from "@/components/layout/HeaderWrapper";
import PageHeader from "@/components/layout/PageHeader";

import { getPageActions } from "@/components/common/PageActionButtons";

import IndentForm from "@/components/resource/indent/IndentForm";

export default function Page() {
  const router = useRouter();

  const { indentId } = useParams();

  // CHANGE THIS LATER IF NEEDED
  const mode = "edit";

  const actions = getPageActions({
    onHome: () =>
      router.push("/dashboard"),

    onBack: () =>
      router.back(),

    onApprove: () =>
      toast.info(
        "Working on this feature"
      ),
  });

  return (
    <HeaderWrapper
      header={
        <PageHeader actions={actions} />
      }
    >
      <IndentForm
        mode={mode}
        indentId={indentId}
      />
    </HeaderWrapper>
  );
}