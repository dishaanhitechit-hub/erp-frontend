"use client";

import { useRouter } from "next/navigation";

export default function PageNotAvailable() {
  const router = useRouter();

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <h1 className="text-2xl font-semibold">Page Not Available</h1>
      <p className="text-sm text-gray-500">
        You don’t have access to this page.
      </p>
      <button
        onClick={() => router.push("/")}
        className="px-4 py-2 bg-black text-white rounded-md"
      >
        Go Home
      </button>
    </div>
  );
}