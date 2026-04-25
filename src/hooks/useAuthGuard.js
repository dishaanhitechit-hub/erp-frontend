"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { getCookie } from "@/lib/cookies";

const roleAccess = {
  super_admin: ["/settings"],
  admin: ["/master"],
  user: ["/"],
};

export const useAuthGuard = () => {
  const router = useRouter();
  const pathname = usePathname();

  const token = getCookie("token");
  const role = getCookie("role");

  // Redirect logic (side effect only)
  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    if (pathname === "/login") {
      if (role === "super_admin") {
        router.replace("/settings/company-details");
      } else if (role === "admin") {
        router.replace("/master/vendor-code");
      } else {
        router.replace("/");
      }
    }
  }, [token, role, pathname]);

  // PURE calculation (no state)
  if (!token) return { authorized: false, loading: true };

  const allowedPaths = roleAccess[role] || [];
  const isAllowed = allowedPaths.some((path) =>
    pathname.startsWith(path)
  );

  return {
    authorized: isAllowed,
    loading: false,
  };
};