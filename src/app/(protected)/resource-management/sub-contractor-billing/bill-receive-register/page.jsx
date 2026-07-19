"use client";

import PageNotAvailable from "@/components/common/PageNotAvailable";
import { getPageAccess } from "@/helper/getPageAccess";

export default function Page() {
  const access = getPageAccess({ pageCode: "bill_receive_register", pageType: "LIST" });

  if (!access.allowed) return <PageNotAvailable />;

  // TODO: implement Bill Receive Register page
  return (
    <div className="p-4 text-sm text-gray-500">Bill Receive Register — coming soon</div>
  );
}
