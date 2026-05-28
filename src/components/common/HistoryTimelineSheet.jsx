"use client";

import { useEffect, useMemo, useState } from "react";

import Image from "next/image";

// CHANGED: Replaced Sheet with Dialog for centered modal positioning
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Input } from "@/components/ui/input";

import { Separator } from "@/components/ui/separator";

import {
  Loader2,
  Search,
  Clock3,
  User2,
} from "lucide-react";

// CHANGED: Removed ChevronLeft — no longer needed (Dialog handles close via backdrop/X)

import { toast } from "sonner";

import { apiRequest } from "@/lib/apiClient";

import { WORKFLOW_ACTIONS } from "@/config/workflowAction.config";

export default function HistoryTimelineSheet({
  open,
  onClose,
  title = "History",
  api,
  entityId,
}) {

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [history, setHistory] = useState([]);

  // — unchanged logic —
  useEffect(() => {

    if (!open || !entityId) return;

    const fetchHistory = async () => {

      try {

        setLoading(true);

        const res = await apiRequest({
          url: `${api}/${entityId}`,
          method: "GET",
        });

        setHistory(res?.data || []);

      } catch (err) {

        toast.error(err?.message || "Failed to fetch history");

      } finally {

        setLoading(false);
      }
    };

    fetchHistory();

  }, [open, api, entityId]);

  // — unchanged logic —
  const filteredHistory = useMemo(() => {

    if (!search) return history;

    return history.filter((item) => {

      const value = `
        ${item.action}
        ${item.comments}
        ${item.actionBy}
      `.toLowerCase();

      return value.includes(search.toLowerCase());
    });

  }, [history, search]);

  // — unchanged logic —
  const formatDate = (date) => {

    if (!date) return "";

    const parsed = new Date(date);

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (

    // CHANGED: Dialog replaces Sheet — renders centered on page, not as a side drawer
    <Dialog open={open} onOpenChange={onClose}>

      {/*
        CHANGED: DialogContent sized to match old Sheet width.
        - w-[95vw] on mobile (no full bleed)
        - sm:max-w-[520px] on bigger screens
        - max-h-[90vh] so it never overflows the viewport
        - flex flex-col so header/footer stay fixed and only timeline scrolls
      */}
      <DialogContent
        className="
          w-[95vw]
          sm:max-w-[520px]

          max-h-[90vh]

          p-0

          flex
          flex-col

          overflow-hidden

          gap-0
        "
      >

        {/* HEADER — unchanged styles, removed ChevronLeft button */}
        <div
          className="
            h-[64px]

            px-4

            flex
            items-center
            gap-3

            border-b

            bg-[#e8f2ff]

            shrink-0
          "
        >

          <h2
            className="
              text-[20px]
              font-semibold
            "
          >
            {title}
          </h2>

        </div>

        {/* SEARCH — unchanged */}
        <div
          className="
            px-4
            py-3

            border-b

            shrink-0

            bg-white
          "
        >

          <div className="relative">

            <Search
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2

                w-4
                h-4

                text-gray-400
              "
            />

            <Input
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                pl-9
                h-[40px]
              "
            />

          </div>

        </div>

        {/* TIMELINE */}
        <ScrollArea
          className="
            flex-1
            min-h-0
            overflow-x-hidden
          "
        >

          <div className="px-5 py-5">

            {loading ? (

              <div
                className="
                  h-[300px]

                  flex
                  items-center
                  justify-center
                "
              >
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>

            ) : filteredHistory.length === 0 ? (

              <div
                className="
                  h-[300px]

                  flex
                  flex-col
                  items-center
                  justify-center

                  text-gray-500
                "
              >
                <Clock3 className="w-10 h-10 mb-3" />
                <p className="text-sm">No history found</p>
              </div>

            ) : (

              <div className="relative space-y-7">

                {filteredHistory.map((item, index) => {

                  const config =
                    WORKFLOW_ACTIONS[item.action] ||
                    WORKFLOW_ACTIONS[item.action?.toUpperCase()] ||
                    WORKFLOW_ACTIONS.DRAFT;

                  const Icon = config.icon;

                  const isLast = index === filteredHistory.length - 1;

                  const isFinalApprove =
                    item.action?.toUpperCase() === "FINAL_APPROVE";

                  const showLevel =
                    item.action?.toUpperCase() !== "SUBMIT" && item.level;

                  return (

                    <div
                      key={item.id}
                      className="
                        relative
                        pl-10
                        min-w-0
                      "
                    >

                      {/* CONNECTOR LINE — unchanged */}
                      {!isLast && (
                        <div
                          className={`
                            absolute
                            left-[15px]
                            top-8

                            w-[2px]
                            h-[calc(100%+28px)]

                            ${
                              item.action === "REJECT"
                                ? "bg-red-200"
                                : "bg-gray-200"
                            }
                          `}
                        />
                      )}

                      {/* TIMELINE ICON — unchanged */}
                      <div
                        className={`
                          absolute
                          left-0
                          top-1

                          w-8
                          h-8

                          rounded-full

                          flex
                          items-center
                          justify-center

                          shadow-sm

                          shrink-0

                          overflow-hidden

                          ${
                            isFinalApprove
                              ? "bg-white border border-emerald-200"
                              : `${config.color} text-white`
                          }
                        `}
                      >

                        {isFinalApprove ? (
                          <Image
                            src={config.image}
                            alt="Final Approved"
                            width={40}
                            height={40}
                            unoptimized
                            className="
                              w-full
                              h-full
                              object-contain
                              scale-[1.2]
                            "
                          />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}

                      </div>

                      {/* CARD */}
                      {/* CHANGED: overflow-hidden prevents card from expanding past its container */}
                      <div
                        className="
                          rounded-xl
                          border
                          bg-white

                          shadow-sm

                          px-4
                          py-3

                          overflow-hidden
                        "
                      >

                        {/*
                          CHANGED: Responsive card body layout
                          ─────────────────────────────────────────────
                          SMALL screens (default):
                            Row 1 → [Status badge]  [time] (space-between)
                            Row 2 → [Level badge]   (if present)
                            Row 3 → [User icon] by username

                          BIGGER screens (sm+):
                            Row 1 → [Status] [Level] [by user]  [time]  — all one line
                          ─────────────────────────────────────────────
                        */}

                        {/* ── SMALL SCREEN LAYOUT (hidden on sm+) ── */}
                        <div className="flex flex-col gap-1.5 sm:hidden">

                          {/* Row 1 small: status + time */}
                          <div className="flex items-center justify-between gap-2">

                            <span
                              className={`
                                px-2.5
                                py-1

                                rounded-md

                                text-[12px]
                                font-semibold

                                whitespace-nowrap

                                ${
                                  isFinalApprove
                                    ? "bg-emerald-100 text-emerald-700"
                                    : config.badge
                                }
                              `}
                            >
                              {config.label}
                            </span>

                            <span
                              className="
                                text-xs
                                text-gray-400
                                whitespace-nowrap
                                shrink-0
                              "
                            >
                              {formatDate(item.createdAt)}
                            </span>

                          </div>

                          {/* Row 2 small: level badge (if present) */}
                          {showLevel && (
                            <span
                              className="
                                self-start

                                text-xs
                                font-medium

                                text-gray-500

                                bg-gray-100

                                px-2
                                py-1

                                rounded-md

                                whitespace-nowrap
                              "
                            >
                              {`Level ${item.level}`}
                            </span>
                          )}

                          {/* Row 3 small: by username */}
                          <div
                            className="
                              flex
                              items-center
                              gap-1.5

                              text-sm
                              text-gray-500
                            "
                          >
                            <User2 className="w-4 h-4 shrink-0" />
                            <span>
                              by{" "}
                              <span className="font-medium text-gray-700">
                                {item.actionBy || "System"}
                              </span>
                            </span>
                          </div>

                        </div>

                        {/* ── BIGGER SCREEN LAYOUT (hidden below sm) ── */}
                        <div className="hidden sm:flex items-center justify-between gap-3">

                          {/* Left cluster: status + level + by user — all in one line */}
                          <div
                            className="
                              flex
                              items-center
                              gap-2

                              flex-wrap

                              min-w-0
                            "
                          >

                            {/* Status badge */}
                            <span
                              className={`
                                px-2.5
                                py-1

                                rounded-md

                                text-[12px]
                                font-semibold

                                whitespace-nowrap

                                ${
                                  isFinalApprove
                                    ? "bg-emerald-100 text-emerald-700"
                                    : config.badge
                                }
                              `}
                            >
                              {config.label}
                            </span>

                            {/* Level badge */}
                            {showLevel && (
                              <span
                                className="
                                  text-xs
                                  font-medium

                                  text-gray-500

                                  bg-gray-100

                                  px-2
                                  py-1

                                  rounded-md

                                  whitespace-nowrap
                                  shrink-0
                                "
                              >
                                {`Level ${item.level}`}
                              </span>
                            )}

                            {/* By username */}
                            <div
                              className="
                                flex
                                items-center
                                gap-1.5

                                text-sm
                                text-gray-500
                              "
                            >
                              <User2 className="w-4 h-4 shrink-0" />
                              <span>
                                by{" "}
                                <span className="font-medium text-gray-700">
                                  {item.actionBy || "System"}
                                </span>
                              </span>
                            </div>

                          </div>

                          {/* Right: time */}
                          <span
                            className="
                              text-xs
                              text-gray-400

                              whitespace-nowrap

                              shrink-0
                            "
                          >
                            {formatDate(item.createdAt)}
                          </span>

                        </div>

                        {/* COMMENTS — unchanged, shared across both layouts */}
                        {item.comments && (
                          <div className="mt-3">

                            <p
                              className="
                                text-[12px]
                                font-medium

                                text-gray-500

                                mb-1.5
                              "
                            >
                              Comments
                            </p>

                            <div
                              className="
                                rounded-lg
                                border

                                bg-slate-50

                                px-3
                                py-2.5

                                overflow-hidden
                              "
                            >
                              {/* CHANGED: break-all forces wrap on any character — handles no-space strings like "aaaa..." */}
                              <p
                                className="
                                  text-sm
                                  text-gray-700
                                  leading-6

                                  break-all
                                "
                              >
                                {item.comments}
                              </p>
                            </div>

                          </div>
                        )}

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </ScrollArea>

        <Separator />

        {/* FOOTER — unchanged */}
        <div
          className="
            p-4
            shrink-0
            bg-white
          "
        >

          <div className="flex justify-end">

            <button
              onClick={onClose}
              className="
                h-[40px]
                px-5

                rounded-md
                border

                text-sm
                font-medium

                hover:bg-gray-50

                cursor-pointer
              "
            >
              Close
            </button>

          </div>

        </div>

      </DialogContent>

    </Dialog>
  );
}
