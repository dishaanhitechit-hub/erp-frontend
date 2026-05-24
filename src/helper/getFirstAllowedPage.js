import { ROLE } from "@/config/role.config";

import { getCookie } from "@/lib/cookies";
export const getFirstAllowedPage = (sidebarConfig, permissions) => {
  const role = getCookie("role");

  // SUPER ADMIN
  if (role === ROLE.SUPER_ADMIN) {
    return "/settings/company-details";
  }

  // ADMIN
  if (role === ROLE.ADMIN) {
    return "/master/ledger-code";
  }

  const findFirstPath = (items) => {
    for (const item of items) {
      if (item.permissionKey && item.path) {
        const canAccess =
          permissions[`${item.permissionKey}.VIEW`] ||
          permissions[`${item.permissionKey}.EDIT`] ||
          permissions[`${item.permissionKey}.APPROVER`]; //have to add if only approve there

        if (canAccess) {
          return item.path;
        }
      }

      if (item.children) {
        const nested = findFirstPath(item.children);

        if (nested) {
          return nested;
        }
      }
    }

    return null;
  };

  return findFirstPath(sidebarConfig);
};
