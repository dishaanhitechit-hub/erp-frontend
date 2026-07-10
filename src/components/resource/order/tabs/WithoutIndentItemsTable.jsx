"use client";

import { useRef } from "react";
// itemOptions fetched once in OrderForm and passed as prop to avoid re-fetching on tab switch
import { useFieldArray, Controller } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/common/SearchableSelect";
import ExpandableTextField from "@/components/common/ExpandableTextField";
import { getInputClass } from "@/lib/formStyles";


const defaultRow = {
  itemCode: "",
  itemName: "",
  unit: "",
  qty: "",
  rate: "",
  amount: 0,
  gstPercent: "",
  gstAmount: 0,
  note: "",
  location: "",
};

export default function WithoutIndentItemsTable({ form, disabled, itemOptions = [] }) {
  const { control, watch, setValue, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const scrollRef = useRef(null);

  const items = watch("items") || [];

  const handleItemSelect = (index, _value, item) => {
    setValue(`items.${index}.itemCode`, item?.itemCode  || "");
    setValue(`items.${index}.itemName`, item?.itemName  || "");
    setValue(`items.${index}.unit`,     item?.unit      || "");
    setValue(`items.${index}.qty`,      "");
    setValue(`items.${index}.rate`,     "");
    setValue(`items.${index}.amount`,   0);
    setValue(`items.${index}.gstPercent`, "");
    setValue(`items.${index}.gstAmount`,  0);
  };

  const recalc = (index, qty, rate, gstPercent) => {
    const amount    = Number(qty || 0) * Number(rate || 0);
    const gstAmount = (amount * Number(gstPercent || 0)) / 100;
    setValue(`items.${index}.amount`,    Number(amount.toFixed(3)));
    setValue(`items.${index}.gstAmount`, Number(gstAmount.toFixed(3)));
  };

  const totalAmount    = items.reduce((s, i) => s + Number(i?.amount    || 0), 0);
  const totalGstAmount = items.reduce((s, i) => s + Number(i?.gstAmount || 0), 0);

  return (
    <div className="flex-1 min-w-0">
      <div className="border border-gray-300">
        <div className="w-full bg-[#DCE8D2] border-b border-gray-300 px-4 py-1">
          <h2 className="text-[15px] font-semibold text-black">Order Items List</h2>
        </div>

        {!fields.length && (
          <div className="h-[140px] flex items-center justify-center text-sm text-gray-500">
            No Items Added
          </div>
        )}

        {!!fields.length && (
          <div ref={scrollRef} className="overflow-auto max-h-[680px]">
            <table className="w-full border-collapse min-w-[900px]">
              <thead className="sticky top-0 z-10 bg-[#D3D3D3]">
                <tr>
                  <th className="border px-2 py-1 text-sm w-[44px]">Sl no</th>
                  <th className="border px-2 py-1 text-sm min-w-[90px]">Item Code</th>
                  <th className="border px-2 py-1 text-sm min-w-[160px]">Item Name</th>
                  <th className="border px-2 py-1 text-sm min-w-[70px]">Unit</th>
                  <th className="border px-2 py-1 text-sm min-w-[90px]">Qty</th>
                  <th className="border px-2 py-1 text-sm min-w-[100px]">Rate</th>
                  <th className="border px-2 py-1 text-sm min-w-[90px]">Amount</th>
                  <th className="border px-2 py-1 text-sm min-w-[80px]">GST %</th>
                  <th className="border px-2 py-1 text-sm min-w-[90px]">GST Amount</th>
                  <th className="border px-2 py-1 text-sm min-w-[80px]">Note</th>
                  <th className="border px-2 py-1 text-sm min-w-[130px]">Location</th>
                  {!disabled && <th className="border px-2 py-1 text-sm w-[60px]">Action</th>}
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const selectedCode = watch(`items.${index}.itemCode`);
                  return (
                    <tr key={field.id}>
                      <td className="border px-2 py-[2px] text-center text-sm">{index + 1}</td>

                      {/* ITEM CODE */}
                      <td className="border px-2 py-[2px]">
                        <Input value={items[index]?.itemCode || ""} disabled className={getInputClass(null, true)} />
                      </td>

                      {/* ITEM NAME — searchable select */}
                      <td className="border p-0">
                        <SearchableSelect
                          options={itemOptions}
                          value={selectedCode}
                          disabled={disabled}
                          onChange={(value, item) => handleItemSelect(index, value, item)}
                          placeholder="Select Item"
                          labelKey="itemName"
                          valueKey="itemCode"
                          searchKeys={["itemName", "itemCode"]}
                          className="rounded-none"
                        />
                      </td>

                      {/* UNIT */}
                      <td className="border px-2 py-[2px] align-top overflow-hidden">
                        <ExpandableTextField
                          value={items[index]?.unit || ""}
                          onChange={() => {}}
                          disabled
                          title="Unit"
                          placeholder=""
                          minHeight="min-h-[34px]"
                          modalHeight="min-h-[120px]"
                        />
                      </td>

                      {/* QTY */}
                      <td className="border px-2 py-[2px]">
                        <Controller
                          control={control}
                          name={`items.${index}.qty`}
                          render={({ field: f }) => (
                            <Input
                              {...f}
                              type="number"
                              min={0}
                              disabled={disabled}
                              className={`${getInputClass(errors?.items?.[index]?.qty, disabled)} text-center`}
                              onChange={(e) => {
                                f.onChange(e.target.value);
                                recalc(index, e.target.value, items[index]?.rate, items[index]?.gstPercent);
                              }}
                            />
                          )}
                        />
                      </td>

                      {/* RATE */}
                      <td className="border px-2 py-[2px]">
                        <Controller
                          control={control}
                          name={`items.${index}.rate`}
                          render={({ field: f }) => (
                            <Input
                              {...f}
                              type="number"
                              step="0.001"
                              disabled={disabled}
                              className={getInputClass(errors?.items?.[index]?.rate, disabled)}
                              onChange={(e) => {
                                f.onChange(e.target.value);
                                recalc(index, items[index]?.qty, e.target.value, items[index]?.gstPercent);
                              }}
                            />
                          )}
                        />
                      </td>

                      {/* AMOUNT */}
                      <td className="border px-2 py-[2px]">
                        <Input value={items[index]?.amount ?? 0} disabled className={getInputClass(null, true)} />
                      </td>

                      {/* GST % */}
                      <td className="border px-2 py-[2px]">
                        <Controller
                          control={control}
                          name={`items.${index}.gstPercent`}
                          render={({ field: f }) => (
                            <Input
                              {...f}
                              type="number"
                              step="0.001"
                              disabled={disabled}
                              className={`${getInputClass(errors?.items?.[index]?.gstPercent, disabled)} text-center`}
                              onChange={(e) => {
                                f.onChange(e.target.value);
                                recalc(index, items[index]?.qty, items[index]?.rate, e.target.value);
                              }}
                            />
                          )}
                        />
                      </td>

                      {/* GST AMOUNT */}
                      <td className="border px-2 py-[2px]">
                        <Input value={items[index]?.gstAmount ?? 0} disabled className={getInputClass(null, true)} />
                      </td>

                      {/* NOTE */}
                      <td className="border p-0 align-top">
                        <div className="w-[80px] overflow-hidden">
                          <Controller
                            control={control}
                            name={`items.${index}.note`}
                            render={({ field: f }) => (
                              <ExpandableTextField
                                value={f.value}
                                onChange={f.onChange}
                                disabled={disabled}
                                title="Note"
                                placeholder="Note"
                                minHeight="min-h-[34px]"
                                modalHeight="min-h-[180px]"
                              />
                            )}
                          />
                        </div>
                      </td>

                      {/* LOCATION */}
                      <td className="border p-0 align-top">
                        <div className="w-[130px] overflow-hidden">
                          <Controller
                            control={control}
                            name={`items.${index}.location`}
                            render={({ field: f }) => (
                              <ExpandableTextField
                                value={f.value}
                                onChange={f.onChange}
                                disabled={disabled}
                                title="Location"
                                placeholder="Enter Location"
                                minHeight="min-h-[34px]"
                                modalHeight="min-h-[180px]"
                              />
                            )}
                          />
                        </div>
                      </td>

                      {!disabled && (
                        <td className="border px-2 py-[2px] text-center">
                          <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {/* TOTAL ROW */}
                <tr className="bg-[#D3D3D3] font-semibold">
                  <td colSpan={6} className="border px-2 py-1 text-center text-sm">TOTAL</td>
                  <td className="border px-2 py-1 text-sm text-center">{totalAmount.toFixed(3)}</td>
                  <td className="border px-2 py-1" />
                  <td className="border px-2 py-1 text-sm text-center">{totalGstAmount.toFixed(3)}</td>
                  <td className="border px-2 py-1" colSpan={disabled ? 2 : 3} />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD ROW */}
      {!disabled && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              append({ ...defaultRow });
              setTimeout(() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              }, 50);
            }}
            className="px-4 py-1 bg-[#9fc5e8] border border-[#6d9dc5] rounded-sm text-sm font-medium hover:brightness-95 cursor-pointer"
          >
            + Add Item
          </button>
        </div>
      )}

    </div>
  );
}
