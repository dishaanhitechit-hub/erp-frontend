import { sidebarConfig } from "@/config/sidebar.config";

import { getLocalStorage } from "@/lib/localStorage";

import { getFirstAllowedPage } from "@/helper/getFirstAllowedPage";

export const goToHomePage = (
  router,
) => {

  if (!router) return;

  const permissions =
    getLocalStorage(
      "permissions",
    ) || {};

  const firstPage =
    getFirstAllowedPage(
      sidebarConfig,
      permissions,
    );

  const route =
    typeof firstPage ===
      "string" &&
    firstPage.trim()
      ? firstPage
      : "/dashboard";

  router.push(route);
};