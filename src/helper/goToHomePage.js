import { sidebarConfig } from "@/config/sidebar.config";
import { getLocalStorage } from "@/lib/localStorage";
import { getFirstAllowedPage } from "@/helper/getFirstAllowedPage";

/**
 * Recursively collects all leaf items (actual page routes) from sidebarConfig.
 * A leaf = item has a `path` and no `children`.
 * Returns objects so callers can also access `activePaths`.
 */
const collectLeafItems = (items) => {
  const result = [];
  for (const item of items) {
    if (item.path && (!item.children || item.children.length === 0)) {
      result.push({ path: item.path, activePaths: item.activePaths || [] });
    }
    if (item.children && item.children.length > 0) {
      result.push(...collectLeafItems(item.children));
    }
  }
  return result;
};

/**
 * Given the current pathname, returns the matching module list page path.
 *
 * Checks two things per leaf item:
 *   1. Direct prefix match — pathname is deeper than item.path
 *      e.g. "/indent/new" starts with "/indent"
 *   2. activePaths match — pathname starts with any of item.activePaths
 *      e.g. "/e-reconcile-bill/5" starts with "/e-reconcile-bill",
 *      so the Bill Receive Register list page is returned
 *
 * Longest matching prefix wins (most specific match).
 */
const getModuleListPath = (pathname) => {
  const leafItems = collectLeafItems(sidebarConfig);

  let bestPath = null;
  let bestMatchLen = 0;

  for (const item of leafItems) {
    // Direct prefix: user navigated deeper into this module
    if (pathname.startsWith(item.path) && pathname.length > item.path.length) {
      if (item.path.length > bestMatchLen) {
        bestMatchLen = item.path.length;
        bestPath = item.path;
      }
    }

    // activePaths: page belongs to this module but lives at a different URL segment
    for (const ap of item.activePaths) {
      if (pathname.startsWith(ap) && ap.length > bestMatchLen) {
        bestMatchLen = ap.length;
        bestPath = item.path; // navigate back to the module's own list page
      }
    }
  }

  return bestPath;
};

/**
 * Home button handler — called from PageActionButtons → getPageActions.
 *
 * Behaviour:
 * 1. If on a create/edit/detail page → navigate to that module's list page
 * 2. If activePaths match → navigate to the owning module's list page
 * 3. If already on a list page or unmatched route → original fallback behaviour
 */
export const goToHomePage = (router) => {
  if (!router) return;

  // window.location.pathname is safe here — PageActionButtons is always client-side
  const pathname = window.location.pathname;

  const listPath = getModuleListPath(pathname);

  if (listPath) {
    router.push(listPath);
    return;
  }

  // Fallback: first page the user has permission to access
  const permissions = getLocalStorage("permissions") || {};
  const firstPage = getFirstAllowedPage(sidebarConfig, permissions);
  const route =
    typeof firstPage === "string" && firstPage.trim()
      ? firstPage
      : "/dashboard";

  router.push(route);
};
