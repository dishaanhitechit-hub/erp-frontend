"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import PageHeader from "@/components/layout/PageHeader";
import { getPageActions } from "@/components/common/PageActionButtons";
import { getPageAccess } from "@/helper/getPageAccess";
import PageNotAvailable from "@/components/common/PageNotAvailable";
import ApprovalActionModal from "@/components/common/ApprovalActionModal";
import HistoryTimelineSheet from "@/components/common/HistoryTimelineSheet";
import { API_ENDPOINTS } from "@/config/api.config";
import BRRBillingForm from "@/components/resource/brr-billing/BRRBillingForm";

export default function Page() {
  const router  = useRouter();
  const { id }  = useParams();
  const params  = useSearchParams();

  const billingType = params.get("billingType") || "grn"; // grn | srn
  const brrId       = params.get("brrId");

  const isNew = id === "new";
  const isGRN = billingType === "grn";

  const pageCode = isGRN ? "billing_by_grn" : "billing_by_srn";
  const pageType = isNew ? "ADD" : "EDIT";

  const [openApproval, setOpenApproval] = useState(false);
  const [openTimeline, setOpenTimeline] = useState(false);

  const access = getPageAccess({ pageCode, pageType });

  if (!access.allowed) return <PageNotAvailable />;

  const ENDPOINT = API_ENDPOINTS.RESOURCE.BRB;
  const billingLabel = "BRB";

  const actions = getPageActions({
    router,
    ...(isNew
      ? {}
      : {
          onTimeLine: () => setOpenTimeline(true),
          onApprove: access.canApprove ? () => setOpenApproval(true) : undefined,
        }),
  });

  return (
    <HeaderWrapper header={<PageHeader actions={actions} />}>
      <BRRBillingForm
        mode={isNew ? "create" : access.mode}
        billingType={billingType}
        brrId={isNew ? brrId : undefined}
        billingId={isNew ? undefined : id}
      />

      {!isNew && (
        <>
          <ApprovalActionModal
            open={openApproval}
            onClose={() => setOpenApproval(false)}
            payload={{ id }}
            actions={[
              { type: "approve", api: ENDPOINT.APPROVE },
              { type: "reback", api: ENDPOINT.REBACK },
              { type: "reject",  api: ENDPOINT.REJECT  },
            ]}
            onSuccess={() => { setOpenApproval(false); router.refresh(); }}
          />

          <HistoryTimelineSheet
            open={openTimeline}
            onClose={() => setOpenTimeline(false)}
            title={`${billingLabel} History`}
            api={ENDPOINT.HISTORY}
            entityId={id}
          />
        </>
      )}
    </HeaderWrapper>
  );
}
