"use client";

import { isMasterEditable } from "@/helper/getMasterAccess";
import PageNotAvailable from "@/components/common/PageNotAvailable";
import SettingsSupplierListPage from "@/components/settings/contact-dairy/SettingsSupplierListPage";

export default function Page() {
  if (!isMasterEditable()) return <PageNotAvailable />;
  return <SettingsSupplierListPage pageType="Work_Force" pageLabel="Work Force" />;
}
