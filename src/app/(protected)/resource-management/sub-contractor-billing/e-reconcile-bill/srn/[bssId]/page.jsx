"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import PageHeader from "@/components/layout/PageHeader";
import { getPageActions } from "@/components/common/PageActionButtons";
import { getPageAccess } from "@/helper/getPageAccess";
import PageNotAvailable from "@/components/common/PageNotAvailable";
import ApprovalActionModal from "@/components/common/ApprovalActionModal";
import HistoryTimelineSheet from "@/components/common/HistoryTimelineSheet";
import { API_ENDPOINTS } from "@/config/api.config";
import BSSForm from "@/components/resource/bss/BSSForm";

export default function Page() {
  const router = useRouter();
  const { bssId } = useParams();
  const [openApproval, setOpenApproval] = useState(false);
  const [openTimeline, setOpenTimeline] = useState(false);

  const access = getPageAccess({ pageCode: "billing_by_srn", pageType: "EDIT" });

  if (!access.allowed) return <PageNotAvailable />;

  const actions = getPageActions({
    router,
    onTimeLine: () => setOpenTimeline(true),
    onApprove: access.canApprove ? () => setOpenApproval(true) : undefined,
  });

  return (
    <HeaderWrapper header={<PageHeader actions={actions} />}>
      <BSSForm mode={access.mode} canApprove={access.canApprove} bssId={bssId} />

      <ApprovalActionModal
        open={openApproval}
        onClose={() => setOpenApproval(false)}
        payload={{ id: bssId }}
        actions={[
          { type: "approve", api: API_ENDPOINTS.RESOURCE.VENDOR_BILLING.BSS.APPROVE },
          { type: "reback", api: API_ENDPOINTS.RESOURCE.VENDOR_BILLING.BSS.REBACK },
          { type: "reject", api: API_ENDPOINTS.RESOURCE.VENDOR_BILLING.BSS.REJECT },
        ]}
        onSuccess={() => { setOpenApproval(false); router.refresh(); }}
      />

      <HistoryTimelineSheet
        open={openTimeline}
        onClose={() => setOpenTimeline(false)}
        title="BSS History"
        api={API_ENDPOINTS.RESOURCE.VENDOR_BILLING.BSS.HISTORY}
        entityId={bssId}
      />
    </HeaderWrapper>
  );
}
