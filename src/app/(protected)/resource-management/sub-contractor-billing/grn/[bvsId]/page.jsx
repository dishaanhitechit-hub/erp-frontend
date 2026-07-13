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
import BVSForm from "@/components/resource/bvs/BVSForm";

export default function Page() {
  const router = useRouter();
  const { bvsId } = useParams();
  const [openApproval, setOpenApproval] = useState(false);
  const [openTimeline, setOpenTimeline] = useState(false);

  const access = getPageAccess({ pageCode: "billing_by_grn", pageType: "EDIT" });

  if (!access.allowed) return <PageNotAvailable />;

  const actions = getPageActions({
    router,
    onTimeLine: () => setOpenTimeline(true),
    onApprove: access.canApprove ? () => setOpenApproval(true) : undefined,
  });

  return (
    <HeaderWrapper header={<PageHeader actions={actions} />}>
      <BVSForm mode={access.mode} canApprove={access.canApprove} bvsId={bvsId} />

      <ApprovalActionModal
        open={openApproval}
        onClose={() => setOpenApproval(false)}
        payload={{ id: bvsId }}
        actions={[
          { type: "approve", api: API_ENDPOINTS.RESOURCE.VENDOR_BILLING.BVS.APPROVE },
          { type: "reback", api: API_ENDPOINTS.RESOURCE.VENDOR_BILLING.BVS.REBACK },
          { type: "reject", api: API_ENDPOINTS.RESOURCE.VENDOR_BILLING.BVS.REJECT },
        ]}
        onSuccess={() => { setOpenApproval(false); router.refresh(); }}
      />

      <HistoryTimelineSheet
        open={openTimeline}
        onClose={() => setOpenTimeline(false)}
        title="BVS History"
        api={API_ENDPOINTS.RESOURCE.VENDOR_BILLING.BVS.HISTORY}
        entityId={bvsId}
      />
    </HeaderWrapper>
  );
}
