"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLE } from "@/config/role.config";
import { getCookie } from "@/lib/cookies";
import { setCookie } from "@/lib/cookies";
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getCookie("token");
    const role = getCookie("role");

    if (!token) {
      router.replace("/login");
      return;
    }

    // ROLE BASED REDIRECT
    if (role === ROLE.SUPER_ADMIN) {
      router.replace("/settings/company-details");
      return;
    }

    if (role === ROLE.ADMIN) {
      router.replace("/master/ledger-code");
      return;
    }

    // USER → stay here (show project list)
  }, []);

  return (
    <div className="p-6">

    </div>
  );

  function handleProjectSelect(index) {
    // simulate allowed modules
    const modules = ["finance", "inventory"];

    setCookie("modules", JSON.stringify(modules));

    // redirect to first module page
    router.push("/finance/sales");
  }
}