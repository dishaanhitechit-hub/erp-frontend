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
import BRRForm from "@/components/resource/brr/BRRForm";

export default function Page() {
  const router = useRouter();
  const { brrId } = useParams();
  const [openApproval, setOpenApproval] = useState(false);
  const [openTimeline, setOpenTimeline] = useState(false);

  const access = getPageAccess({ pageCode: "bill_receive_register", pageType: "EDIT" });

  if (!access.allowed) return <PageNotAvailable />;

  const actions = getPageActions({
    router,
    onTimeLine: () => setOpenTimeline(true),
    onApprove: access.canApprove ? () => setOpenApproval(true) : undefined,
  });

  return (
    <HeaderWrapper header={<PageHeader actions={actions} />}>
      <BRRForm mode={access.mode} brrId={brrId} />

      <ApprovalActionModal
        open={openApproval}
        onClose={() => setOpenApproval(false)}
        payload={{ id: brrId }}
        actions={[
          { type: "approve", api: API_ENDPOINTS.RESOURCE.BILL_RECEIVE_REGISTER.APPROVE },
          { type: "reback", api: API_ENDPOINTS.RESOURCE.BILL_RECEIVE_REGISTER.REBACK },
          { type: "reject", api: API_ENDPOINTS.RESOURCE.BILL_RECEIVE_REGISTER.REJECT },
        ]}
        onSuccess={() => { setOpenApproval(false); router.refresh(); }}
      />

      <HistoryTimelineSheet
        open={openTimeline}
        onClose={() => setOpenTimeline(false)}
        title="BRR History"
        api={API_ENDPOINTS.RESOURCE.BILL_RECEIVE_REGISTER.HISTORY}
        entityId={brrId}
      />
    </HeaderWrapper>
  );
}
