"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-300">

      <div className="text-center flex flex-col  items-center space-y-6 px-6">

        {/* 404 TEXT */}
        <h1 className="text-6xl font-bold text-gray-800 tracking-wide">
          404
        </h1>

        {/* TITLE */}
        <h2 className="text-xl font-semibold text-gray-700">
          Page Not Found
        </h2>

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          The page you are looking for might have been removed, renamed,
          or is temporarily unavailable.
        </p>

        {/* BUTTONS */}
        <div className="pt-4 flex items-center gap-3">
          
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-2 text-sm cursor-pointer"
          >
            <ArrowLeft size={16} />
            Go Back
          </Button>

          <Button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 px-6 py-2 text-sm cursor-pointer"
          >
            <Home size={16} />
            Go to Dashboard
          </Button>
        </div>

      </div>

    </div>
  );
}