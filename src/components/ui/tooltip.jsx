"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

// ── Colour variants ──────────────────────────────────────────────────────────
// "icon"  → dark navy, matches the navbar icon tooltips
// "text"  → dark slate, used for truncated text cells in tables / data areas
const VARIANTS = {
  icon: {
    bubble: "bg-[#1e2a3a] border border-[#2d3d52]",
    arrow:  "fill-[#1e2a3a]",
  },
  text: {
    bubble: "bg-[#3f4451] border border-[#525a6a]",
    arrow:  "fill-[#3f4451]",
  },
}

function TooltipProvider({ delayDuration = 300, ...props }) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
}

function Tooltip({ ...props }) {
  return <TooltipPrimitive.Root {...props} />
}

function TooltipTrigger({ ...props }) {
  return <TooltipPrimitive.Trigger {...props} />
}

// side    : "top" | "bottom" | "left" | "right" — caller decides per section
// variant : "icon" | "text" — caller decides the colour scheme
function TooltipContent({ className, sideOffset = 8, side = "top", variant = "icon", children, ...props }) {
  const v = VARIANTS[variant] ?? VARIANTS.icon
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        side={side}
        sideOffset={sideOffset}
        className={cn(
          "relative z-50 w-max max-w-[min(260px,90vw)] break-words leading-relaxed",
          "rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg",
          v.bubble,
          "animate-in fade-in-0 zoom-in-95 duration-150",
          "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
          "data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow width={10} height={5} className={v.arrow} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
