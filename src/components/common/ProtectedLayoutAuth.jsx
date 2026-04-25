"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import PageNotAvailable from "./PageNotAvailable";

export default function ProtectedLayoutAuth({ children }) {
  const { loading, authorized } = useAuthGuard();

  if (loading) return null;

  if (!authorized) return <PageNotAvailable />;

  return <>{children}</>;
}