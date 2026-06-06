"use client";

import { Input } from "@/components/ui/input";
import ExpandableTextField from "@/components/common/ExpandableTextField";
import { getInputClass } from "@/lib/formStyles";

// ── HEADER CELL ───────────────────────────────────────────────────────────────
const TH = ({ children, w = "auto", center = false }) => (
  <th
    style={{ minWidth: w, width: w }}
    className={`
      sticky top-0 z-10
      border border-[#b7bcc5]
      bg-[#d2d2d2]
      px-1 py-1
      text-[12px] font-semibold
      whitespace-nowrap align-middle
      ${center ? "text-center" : "text-left"}
    `}
  >
    {children}
  </th>
);

// ── DATA CELL ─────────────────────────────────────────────────────────────────
const TD = ({ children, center = false, className = "" }) => (
  <td
    className={`
      border border-[#d5d5d5]
      px-[2px] py-[2px]
      text-[12px] align-top
      bg-[#faf7e6]
      ${center ? "text-center" : ""}
      ${className}
    `}
  >
    {children}
  </td>
);

// ── READ-ONLY CELL ────────────────────────────────────────────────────────────
const ReadCell = ({ value, disabled = true }) => (
  <div
    className={`
      ${getInputClass(false, disabled)}
      h-[28px] px-2
      flex items-center
      text-[12px] border-0 bg-transparent
      min-w-[60px]
    `}
  >
    {value ?? ""}
  </div>
);

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function GINItemsTable({ items, onItemChange, disabled }) {
  if (!items?.length) {
    return (
      <div className="border rounded-sm p-4 text-center text-[13px] text-gray-400 italic">
        Select an Order No from the left panel to load items
      </div>
    );
  }

  return (
    <div className="border border-[#b7bcc5] overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[840px] w-full">
        <table className="border-collapse text-[12px] min-w-[1100px] w-full">
          <thead>
            <tr>
              <TH w="50px"  center>SL no</TH>
              <TH w="120px">Item Code</TH>
              <TH w="240px">Item Name</TH>
              <TH w="70px"  center>Unit</TH>
              <TH w="100px" center>Stock Qty</TH>
              <TH w="130px" center>Issue Qty</TH>
              <TH w="200px">Stock Location</TH>
              <TH w="200px">Item Used Location</TH>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => {
              const stockQty  = Number(item.stockQty ?? 0);
              const issueQty  = item.issueQty;
              const issueNum  = issueQty === "" || issueQty == null ? 0 : Number(issueQty);
              const qtyError  = issueNum > stockQty && issueNum > 0;

              return (
                <tr key={item.orderItemId ?? index}>

                  <TD center>{index + 1}</TD>

                  <TD>
                    <ReadCell value={item.itemCode} />
                  </TD>

                  {/* ITEM NAME — expandable */}
                  <TD>
                    <ExpandableTextField
                      value={item.itemName || ""}
                      onChange={() => {}}
                      disabled
                      title="Item Name"
                      minHeight="min-h-[28px]"
                      modalHeight="min-h-[180px]"
                    />
                  </TD>

                  <TD center>
                    <ReadCell value={item.itemUnit} />
                  </TD>

                  {/* STOCK QTY — read-only */}
                  <TD center>
                    <ReadCell value={stockQty} />
                  </TD>

                  {/* ISSUE QTY — editable, red if > stockQty */}
                  <TD>
                    <div>
                      <Input
                        type="number"
                        value={issueQty ?? ""}
                        min="0"
                        step="any"
                        disabled={disabled}
                        onChange={(e) =>
                          onItemChange(index, "issueQty", e.target.value)
                        }
                        className={`${getInputClass(qtyError, disabled)} h-[28px]`}
                      />
                      {qtyError && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          Max {stockQty}
                        </p>
                      )}
                    </div>
                  </TD>

                  {/* STOCK LOCATION — editable expandable */}
                  <TD>
                    <ExpandableTextField
                      value={item.stockLocation || ""}
                      disabled={disabled}
                      title="Stock Location"
                      placeholder="Store 1"
                      minHeight="min-h-[28px]"
                      onChange={(v) => onItemChange(index, "stockLocation", v)}
                    />
                  </TD>

                  {/* ITEM USED LOCATION — editable expandable */}
                  <TD>
                    <ExpandableTextField
                      value={item.itemUsedLocation || ""}
                      disabled={disabled}
                      title="Item Used Location"
                      placeholder="Block A"
                      minHeight="min-h-[28px]"
                      onChange={(v) => onItemChange(index, "itemUsedLocation", v)}
                    />
                  </TD>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
