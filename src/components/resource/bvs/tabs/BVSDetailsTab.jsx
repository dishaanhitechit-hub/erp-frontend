"use client";

import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import ExpandableTextField from "@/components/common/ExpandableTextField";
import { getInputClass } from "@/lib/formStyles";
import BVSGRNItemSelectionModal from "../modals/BVSGRNItemSelectionModal";
import { getfmtDisplaydate } from "@/helper/getfmtDisplayDate";

const TH = ({ children, w = "auto", center = false }) => (
  <th
    style={{ minWidth: w, width: w }}
    className={`
      sticky top-0 z-10
      border border-[#b7bcc5] bg-[#d2d2d2]
      px-1 py-1 text-[12px] font-semibold whitespace-nowrap align-middle
      ${center ? "text-center" : "text-left"}
    `}
  >
    {children}
  </th>
);

const TD = ({ children, center = false, className = "" }) => (
  <td
    className={`
      border border-[#d5d5d5] px-[2px] py-[2px] text-[12px] align-top bg-[#faf7e6]
      ${center ? "text-center" : ""}
      ${className}
    `}
  >
    {children}
  </td>
);

const ReadCell = ({ value }) => (
  <div className={`${getInputClass(false, true)} h-[28px] px-2 flex items-center text-[12px] border-0 bg-transparent min-w-[60px]`}>
    {value ?? ""}
  </div>
);

export default function BVSDetailsTab({
  form,
  disabled,
  openItemModal,
  setOpenItemModal,
}) {
  const items = form.watch("items") || [];

  const onItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    form.setValue("items", updated, { shouldDirty: true });
  };

  if (!items.length) {
    return (
      <>
        <div className="border rounded-sm p-4 text-center text-gray-400">
          Select an Order No from the left panel and add GRN items
        </div>
        <BVSGRNItemSelectionModal
          open={openItemModal}
          onClose={() => setOpenItemModal(false)}
          form={form}
        />
      </>
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="border border-gray-300">
        <div className="w-full bg-[#DCE8D2] border-b border-gray-300 px-4 py-1">
          <h2 className="text-[15px] font-semibold text-black">GRN Items List</h2>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[680px] w-full">
          <table className="border-collapse text-[12px] min-w-[1500px] w-full">
            <thead>
              <tr>
                <TH w="50px" center>SL no</TH>
                <TH w="110px">GRN No</TH>
                <TH w="90px">GRN Date</TH>
                <TH w="80px">GRNL</TH>
                <TH w="110px" center>Item Code</TH>
                <TH w="220px" center>Item Name</TH>
                <TH w="160px" center>Note</TH>
                <TH w="60px" center>Unit</TH>
                <TH w="90px" center>Received Qty</TH>
                <TH w="90px" center>Already Billed</TH>
                <TH w="90px" center>Available Qty</TH>
                <TH w="120px" center>Billing Qty</TH>
                <TH w="80px" center>Rate</TH>
                <TH w="90px" center>Amount</TH>
                <TH w="70px" center>GST %</TH>
                <TH w="90px" center>GST Amt</TH>
                <TH w="160px" center>Use Location</TH>
                <TH w="160px" center>Store Location</TH>
                {!disabled && <TH w="60px" center>Edit</TH>}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const effectiveAvailableQty = Number(item.effectiveAvailableQty ?? item.availableQty ?? 0);
                const currQty = item.billingQty;
                const currNum = currQty === "" || currQty == null ? 0 : Number(currQty);
                const qtyError = currNum > effectiveAvailableQty && currNum > 0;

                return (
                  <tr key={item.grnItemId ?? index}>
                    <TD center>{index + 1}</TD>
                    <TD><ReadCell value={item.grnNo} /></TD>
                    <TD><ReadCell value={getfmtDisplaydate(item.grnDate)} /></TD>
                    <TD><ReadCell value={item.grnl} /></TD>
                    <TD><ReadCell value={item.itemCode} /></TD>
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
                    <TD>
                      <ExpandableTextField
                        value={item.note || ""}
                        onChange={() => {}}
                        disabled
                        title="Note"
                        minHeight="min-h-[28px]"
                        modalHeight="min-h-[180px]"
                      />
                    </TD>
                    <TD><ReadCell value={item.itemUnit} /></TD>
                    <TD center><ReadCell value={item.receivedQty} /></TD>
                    <TD center><ReadCell value={item.alreadyBilled} /></TD>
                    <TD center><ReadCell value={item.availableQty} /></TD>
                    <TD>
                      <div>
                        <Input
                          type="number"
                          value={currQty ?? ""}
                          min="0"
                          step="any"
                          disabled={disabled}
                          onChange={(e) => onItemChange(index, "billingQty", e.target.value)}
                          className={`${getInputClass(qtyError, disabled)} h-[28px]`}
                        />
                        {qtyError && (
                          <p className="text-red-500 text-[10px] mt-1">
                            Max {effectiveAvailableQty}
                          </p>
                        )}
                      </div>
                    </TD>
                    <TD center><ReadCell value={item.rate} /></TD>
                    <TD center><ReadCell value={item.amount} /></TD>
                    <TD center><ReadCell value={item.gstPercent} /></TD>
                    <TD center><ReadCell value={item.gstAmount} /></TD>
                    <TD>
                      <ExpandableTextField
                        value={item.useLocation || ""}
                        onChange={() => {}}
                        disabled
                        title="Use Location"
                        minHeight="min-h-[28px]"
                        modalHeight="min-h-[180px]"
                      />
                    </TD>
                    <TD>
                      <ExpandableTextField
                        value={item.storeLocation || ""}
                        onChange={() => {}}
                        disabled
                        title="Store Location"
                        minHeight="min-h-[28px]"
                        modalHeight="min-h-[180px]"
                      />
                    </TD>
                    {!disabled && (
                      <TD center>
                        <button
                          type="button"
                          onClick={() => setOpenItemModal(true)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </TD>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <BVSGRNItemSelectionModal
        open={openItemModal}
        onClose={() => setOpenItemModal(false)}
        form={form}
      />
    </div>
  );
}
