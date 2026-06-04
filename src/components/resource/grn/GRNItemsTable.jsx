"use client";

import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import ExpandableTextField from "@/components/common/ExpandableTextField";
import { getInputClass } from "@/lib/formStyles";

// ── TABLE HEADER CELL ────────────────────────────────────────────────────────
const TH = ({ children, w = "auto", center = false }) => (
  <th
    style={{ minWidth: w }}
    className={`border border-[#b0c4d8] bg-[#d6e6f2] px-2 py-1 text-[12px] font-semibold whitespace-nowrap ${center ? "text-center" : "text-left"}`}
  >
    {children}
  </th>
);

// ── TABLE DATA CELL ──────────────────────────────────────────────────────────
const TD = ({ children, center = false, className = "" }) => (
  <td
    className={`border border-[#d0dce8] px-1 py-0.5 text-[12px] align-middle ${center ? "text-center" : ""} ${className}`}
  >
    {children}
  </td>
);

// ── TEXT CELL (read-only) ────────────────────────────────────────────────────
const ReadCell = ({ value, disabled = true }) => (
  <div className={`${getInputClass(false, disabled)} h-[26px] px-2 flex items-center text-[12px] min-w-[60px]`}>
    {value ?? ""}
  </div>
);

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function GRNItemsTable({ items, onItemChange, disabled }) {
  if (!items?.length) {
    return (
      <div className="border border-[#d0dce8] bg-[#fafafa] rounded-sm p-4 text-[13px] text-gray-400 text-center min-h-[120px] flex items-center justify-center">
        Select an Order No from the left panel to load items
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#b0c4d8] rounded-sm">
      <table className="border-collapse w-full text-[12px]">
        <thead>
          <tr>
            <TH w="40px"  center>SL<br/>no</TH>
            <TH w="90px">Indent No</TH>
            <TH w="70px">GRNL</TH>
            <TH w="90px">Item Code</TH>
            <TH w="160px">Item Name</TH>
            <TH w="100px">Note</TH>
            <TH w="50px"  center>Unit</TH>
            <TH w="70px"  center>Order<br/>Qty</TH>
            <TH w="70px"  center>Pre.<br/>Received<br/>Qty</TH>
            <TH w="70px"  center>Balance<br/>Qty</TH>
            <TH w="90px"  center>Current<br/>Received<br/>Qty</TH>
            <TH w="110px">Use Location</TH>
            <TH w="110px">Store Location</TH>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => {
            const balQty   = Number(item.balanceQty   ?? 0);
            const currQty  = item.currentReceivedQty;
            const currNum  = currQty === "" || currQty == null ? 0 : Number(currQty);
            const qtyError = currNum > balQty && currNum > 0;

            return (
              <tr key={item.orderItemId ?? index} className={index % 2 === 0 ? "bg-white" : "bg-[#f7f9fb]"}>
                {/* SL */}
                <TD center>{index + 1}</TD>

                {/* Indent No */}
                <TD><ReadCell value={item.indentNo} /></TD>

                {/* GRNL — only exists after GRN is saved */}
                <TD><ReadCell value={item.grnl || ""} /></TD>

                {/* Item Code */}
                <TD><ReadCell value={item.itemCode} /></TD>

                {/* Item Name — expandable (can be long) */}
                <TD>
                  <ExpandableTextField
                    value={item.itemName || ""}
                    onChange={() => {}}
                    disabled
                    title="Item Name"
                    placeholder="—"
                    minHeight="min-h-[26px]"
                    modalHeight="min-h-[140px]"
                    className="text-[12px] min-w-[150px]"
                  />
                </TD>

                {/* Note — expandable */}
                <TD>
                  <ExpandableTextField
                    value={item.note || ""}
                    onChange={() => {}}
                    disabled
                    title="Note"
                    placeholder="—"
                    minHeight="min-h-[26px]"
                    modalHeight="min-h-[140px]"
                    className="text-[12px] min-w-[90px]"
                  />
                </TD>

                {/* Unit */}
                <TD center><ReadCell value={item.itemUnit} /></TD>

                {/* Order Qty */}
                <TD center><ReadCell value={item.orderQty} /></TD>

                {/* Pre Received Qty */}
                <TD center><ReadCell value={item.preReceivedQty} /></TD>

                {/* Balance Qty */}
                <TD center><ReadCell value={balQty} /></TD>

                {/* Current Received Qty — EDITABLE */}
                <TD>
                  <div className="flex flex-col">
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={currQty ?? 0}
                      disabled={disabled}
                      onChange={(e) =>
                        onItemChange(index, "currentReceivedQty", e.target.value)
                      }
                      className={`${getInputClass(qtyError, disabled)} h-[26px] w-[80px] text-[12px]`}
                    />
                    {qtyError && (
                      <span className="text-red-500 text-[10px] leading-tight mt-0.5 whitespace-nowrap">
                        Max: {balQty}
                      </span>
                    )}
                  </div>
                </TD>

                {/* Use Location — EDITABLE */}
                <TD>
                  <Input
                    type="text"
                    value={item.useLocation || ""}
                    disabled={disabled}
                    placeholder={disabled ? "—" : "Block A"}
                    onChange={(e) =>
                      onItemChange(index, "useLocation", e.target.value)
                    }
                    className={`${getInputClass(false, disabled)} h-[26px] w-[100px] text-[12px]`}
                  />
                </TD>

                {/* Store Location — EDITABLE */}
                <TD>
                  <Input
                    type="text"
                    value={item.storeLocation || ""}
                    disabled={disabled}
                    placeholder={disabled ? "—" : "Store 1"}
                    onChange={(e) =>
                      onItemChange(index, "storeLocation", e.target.value)
                    }
                    className={`${getInputClass(false, disabled)} h-[26px] w-[100px] text-[12px]`}
                  />
                </TD>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
