import { routeMetaConfig } from "@/config/route-meta.config";

export function getBreadcrumbs(pathname) {
  const cleanPath = pathname.split("?")[0];

  const matchedRoute = routeMetaConfig
    .map((route) => {
      const isDynamic = route.basePath.includes("[");

      // Convert dynamic route to regex
      const regexPath = route.basePath.replace(/\[.*?\]/g, "[^/]+");
      const regex = new RegExp(`^${regexPath}$`);

      return regex.test(cleanPath)
        ? { ...route, isDynamic }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Static routes first
      if (a.isDynamic !== b.isDynamic) {
        return a.isDynamic ? 1 : -1;
      }

      // Then longer (more specific) paths
      return b.basePath.length - a.basePath.length;
    })[0];

  return matchedRoute?.breadcrumbs || [];
}