"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { toWords } from "number-to-words";

export default function BSSSummaryTab({ form, disabled }) {
  const { watch, setValue } = form;

  const ccSummary = watch("ccSummary") || [];
  const gstType = watch("gstType") || "";
  const backendBasicAmount = Number(watch("basicAmount") || 0);
  const backendGstAmount = Number(watch("gstAmount") || 0);
  const backendTotalAmount = Number(watch("totalAmount") || 0);

  const isIGST = gstType === "IGST";
  const isCGSTSGST = gstType === "CGST_SGST";

  const handleIGST = (checked) => setValue("gstType", checked ? "IGST" : "");
  const handleCGSTSGST = (checked) => setValue("gstType", checked ? "CGST_SGST" : "");

  const igstAmount = isIGST ? backendGstAmount : 0;
  const cgstAmount = isCGSTSGST ? backendGstAmount / 2 : 0;
  const sgstAmount = isCGSTSGST ? backendGstAmount / 2 : 0;

  const amountInWords = `${toWords(Math.floor(backendTotalAmount))} Only`;

  return (
    <div className="space-y-3">
      {/* BASIC TABLE */}
      <div className="border border-gray-300">
        <div className="w-full bg-[#DCE8D2] border-b border-gray-300 px-4 py-1">
          <h2 className="text-[15px] font-semibold">BASIC</h2>
        </div>
        <div className="max-h-[295px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#D3D3D3]">
                <th className="border px-2 py-1 text-sm w-[90px]">Sl no</th>
                <th className="border px-2 py-1 text-sm w-[180px]">CC Code</th>
                <th className="border px-2 py-1 text-sm">CC Name</th>
                <th className="border px-2 py-1 text-sm w-[120px]">Basic Amount</th>
                <th className="border px-2 py-1 text-sm w-[120px]">GST Amount</th>
                <th className="border px-2 py-1 text-sm w-[120px]">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {ccSummary.length
                ? ccSummary.map((item, index) => (
                    <tr key={index}>
                      <td className="border px-2 py-[2px] text-center text-sm">{index + 1}</td>
                      <td className="border px-2 py-[2px] text-sm">{item.ccCode}</td>
                      <td className="border px-2 py-[2px] text-sm">{item.ccName}</td>
                      <td className="border px-2 py-[2px] text-right text-sm">{Number(item.basicAmount || 0).toFixed(2)}</td>
                      <td className="border px-2 py-[2px] text-right text-sm">{Number(item.gstAmount || 0).toFixed(2)}</td>
                      <td className="border px-2 py-[2px] text-right text-sm">{Number(item.totalAmount || 0).toFixed(2)}</td>
                    </tr>
                  ))
                : Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      <td className="border px-2 py-[2px] h-[26px]" />
                      <td className="border px-2 py-[2px]" />
                      <td className="border px-2 py-[2px]" />
                      <td className="border px-2 py-[2px]" />
                      <td className="border px-2 py-[2px]" />
                      <td className="border px-2 py-[2px]" />
                    </tr>
                  ))}
              <tr className="bg-[#D3D3D3] font-semibold">
                <td className="border px-2 py-1" />
                <td className="border px-2 py-1" />
                <td className="border px-2 py-1 text-center text-sm">TOTAL</td>
                <td className="border px-2 py-1 text-center text-sm">{backendBasicAmount.toFixed(2)}</td>
                <td className="border px-2 py-1 text-center text-sm">{backendGstAmount.toFixed(2)}</td>
                <td className="border px-2 py-1 text-center text-sm">{backendTotalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* GST TABLE */}
      <div className="border border-gray-300">
        <div className="w-full bg-[#F5E4D7] border-b border-gray-300 px-4 py-1">
          <h2 className="text-[15px] font-semibold">GST</h2>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#D3D3D3]">
              <th className="border px-2 py-1 text-sm w-[120px]">Select</th>
              <th className="border px-2 py-1 text-sm w-[180px]">CC Code</th>
              <th className="border px-2 py-1 text-sm">CC Name</th>
              <th className="border px-2 py-1 text-sm w-[180px]">GST Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-[2px] text-center">
                <Checkbox checked={isIGST} onCheckedChange={handleIGST} />
              </td>
              <td className="border px-2 py-[2px] text-sm">IGST</td>
              <td className="border px-2 py-[2px] text-sm">Input-IGST</td>
              <td className="border px-2 py-[2px] text-right text-sm">{igstAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="border px-2 py-[2px] text-center">
                <Checkbox checked={isCGSTSGST} onCheckedChange={handleCGSTSGST} />
              </td>
              <td className="border px-2 py-[2px] text-sm">CGST</td>
              <td className="border px-2 py-[2px] text-sm">Input-CGST</td>
              <td className="border px-2 py-[2px] text-right text-sm">{cgstAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="border px-2 py-[2px] text-center">
                <Checkbox checked={isCGSTSGST} onCheckedChange={handleCGSTSGST} />
              </td>
              <td className="border px-2 py-[2px] text-sm">SGST</td>
              <td className="border px-2 py-[2px] text-sm">Input-SGST</td>
              <td className="border px-2 py-[2px] text-right text-sm">{sgstAmount.toFixed(2)}</td>
            </tr>
            <tr className="bg-[#D3D3D3] font-semibold">
              <td className="border px-2 py-1" />
              <td className="border px-2 py-1" />
              <td className="border px-2 py-1 text-center text-sm">TOTAL</td>
              <td className="border px-2 py-1 text-center text-sm">{backendGstAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TOTAL SECTION */}
      <div className="space-y-0.5">
        <div className="flex items-center">
          <div className="w-[80%] bg-[#DCE8D2] border px-4 py-1 text-[16px] font-semibold rounded-sm">
            Basic Amount
          </div>
          <div className="w-[20%] bg-[#D5DBE6] border px-4 py-1 text-right text-[16px] font-semibold rounded-sm">
            {backendBasicAmount.toFixed(2)}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-[80%] bg-[#DCE8D2] border px-4 py-1 text-[16px] font-semibold rounded-sm">
            GST Amount
          </div>
          <div className="w-[20%] bg-[#D5DBE6] border px-4 py-1 text-right text-[16px] font-semibold rounded-sm">
            {backendGstAmount.toFixed(2)}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-[80%] bg-[#DCE8D2] border px-4 py-1 text-[16px] font-bold rounded-sm">
            Total Invoice Amount (Rs.)
          </div>
          <div className="w-[20%] bg-[#F2B07E] border px-4 py-1 text-right text-[16px] font-bold rounded-sm">
            {backendTotalAmount.toFixed(2)}
          </div>
        </div>
        <div className="flex items-center mt-1.5">
          <div className="w-[180px] bg-[#DCE8D2] border px-3 py-1 text-[15px] font-semibold rounded-sm">
            Amount (In word)
          </div>
          <div className="flex-1 bg-[#F8EFC8] border px-4 py-1 text-[15px] rounded-sm">
            {amountInWords}
          </div>
        </div>
      </div>
    </div>
  );
}
