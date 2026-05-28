import { sidebarConfig } from "@/config/sidebar.config";
import { getLocalStorage } from "@/lib/localStorage";
import { getFirstAllowedPage } from "@/helper/getFirstAllowedPage";

/**
 * Recursively collects all leaf paths (actual page routes) from sidebarConfig.
 * A leaf = item has a `path` and no `children`.
 */
const collectLeafPaths = (items) => {
  const paths = [];
  for (const item of items) {
    if (item.path && (!item.children || item.children.length === 0)) {
      paths.push(item.path);
    }
    if (item.children && item.children.length > 0) {
      paths.push(...collectLeafPaths(item.children));
    }
  }
  return paths;
};

/**
 * Given the current pathname, returns the matching module list page path.
 *
 * Finds the longest leaf path from sidebarConfig that is a proper prefix
 * of the current pathname — meaning the user is deeper (create/edit/detail).
 *
 * Example:
 *   "/resource-management/procurement/indent/new"  → "/resource-management/procurement/indent"
 *   "/resource-management/procurement/indent"      → null (already on list, fallback)
 */
const getModuleListPath = (pathname) => {
  const leafPaths = collectLeafPaths(sidebarConfig);

  const match = leafPaths
    .filter(
      (p) =>
        pathname.startsWith(p) &&
        pathname.length > p.length // must be deeper than the list page itself
    )
    .sort((a, b) => b.length - a.length)[0]; // longest match wins

  return match || null;
};

/**
 * Home button handler — called from PageActionButtons → getPageActions.
 *
 * Behaviour:
 * 1. If on a create/edit/detail page → navigate to that module's list page
 * 2. If already on a list page or unmatched route → original fallback behaviour
 */
export const goToHomePage = (router) => {
  if (!router) return;

  // window.location.pathname is safe here — PageActionButtons is always client-side
  const pathname = window.location.pathname;

  // Resolve to current module's list page if user is deeper than it
  const listPath = getModuleListPath(pathname);

  if (listPath) {
    router.push(listPath);
    return;
  }

  // Fallback: original behaviour — first page the user has permission to access
  const permissions = getLocalStorage("permissions") || {};
  const firstPage = getFirstAllowedPage(sidebarConfig, permissions);
  const route =
    typeof firstPage === "string" && firstPage.trim()
      ? firstPage
      : "/dashboard";

  router.push(route);
};
