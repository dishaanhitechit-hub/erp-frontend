"use client";

import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { getInputClass } from "@/lib/formStyles";
import SearchableSelect from "@/components/common/SearchableSelect";
import { useState } from "react";

export default function IndentItemsTable({
  fields,
  register,
  setValue,
  watch,
  append,
  remove,
  errors,
  isEditing,
  isSubmitting,
  itemsOptions,
}) {
  const defaultItemRow = {
    itemCode: "",
    itemName: "",
    note: "",
    unit: "",
    qty: "",
    ammenmendQty: "",
    location: "",
  };

  const [expandedCells, setExpandedCells] = useState({});

  const totalQty = watch("items")?.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0,
  );

  const totalAmmenmendQty = watch("items")?.reduce(
    (sum, item) => sum + Number(item.ammenmendQty || 0),
    0,
  );

  const toggleCell = (key) => {
    setExpandedCells((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleItemSelect = (rowIndex, value, item) => {
    setValue(`items.${rowIndex}.itemCode`, item?.itemCode || "");

    setValue(`items.${rowIndex}.itemName`, item?.itemName || "");

    setValue(`items.${rowIndex}.unit`, item?.unit || "");
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="border border-[#b5b5b5] overflow-visible">
        {/* HEADER */}
        <div className="bg-[#e8f0df] px-2 py-1 border-b border-[#b5b5b5] font-bold text-[18px]">
          BASIC
        </div>

        {/* TABLE */}
        <div className="w-full">
          {/* TABLE HEADER */}
          <table className="w-full border-collapse text-sm table-fixed">
            <thead>
              <tr className="bg-[#d9d9d9]">
                <th className="border border-[#b5b5b5] w-[50px] text-center">
                  Sl no
                </th>

                <th className="border border-[#b5b5b5] w-[110px] text-left px-2">
                  Item Code
                </th>

                <th className="border border-[#b5b5b5] w-[200px] text-left px-2">
                  Item Name
                </th>

                <th className="border border-[#b5b5b5] w-[220px] text-left px-2">
                  Note
                </th>

                <th className="border border-[#b5b5b5] w-[100px] text-center">
                  Unit
                </th>

                <th className="border border-[#b5b5b5] w-[100px] text-center">
                  Qty
                </th>

                <th className="border border-[#b5b5b5] w-[100px] text-center">
                  Ammenmend Qty
                </th>

                <th className="border border-[#b5b5b5] text-center">
                  Location
                </th>

                {isEditing && (
                  <th className="border border-[#b5b5b5] w-[60px] text-center">
                    Action
                  </th>
                )}
              </tr>
            </thead>
          </table>

          {/* SCROLLABLE ROWS */}
          <div
  className={`
    relative
    overflow-y-auto
    ${fields.length > 7 ? "max-h-[224px]" : "overflow-visible"}
  `}
  style={{
    overflowX: "visible",
  }}
>
            <table className="w-full border-collapse text-sm table-fixed">
              <tbody>
                {fields.map((field, index) => {
                  const selectedItemCode = watch(
                    `items.${index}.itemCode`,
                  );

                  return (
                    <tr key={field.id}>
                      {/* SL NO */}
                      <td className="border border-[#b5b5b5] w-[50px] text-center bg-[#f7f7f7]">
                        {index + 1}
                      </td>

                      {/* ITEM CODE */}
                      <td className="border border-[#b5b5b5] w-[110px] p-0">
                        <Input
                          {...register(`items.${index}.itemCode`)}
                          disabled
                          className={`
                            ${getInputClass(false, true)}
                            border-0
                            rounded-none
                            h-[32px]
                          `}
                        />
                      </td>

                      {/* ITEM SELECT */}
                      <td className="border border-[#b5b5b5] w-[200px] p-0">
                        <SearchableSelect
                          options={itemsOptions}
                          value={selectedItemCode}
                          disabled={!isEditing || isSubmitting}
                          onChange={(value, item) =>
                            handleItemSelect(index, value, item)
                          }
                          placeholder="Select Item"
                          labelKey="itemName"
                          valueKey="itemCode"
                          searchKeys={[
                            "itemName",
                            "itemCode",
                          ]}
                          className="rounded-none "
                        />
                      </td>

                      {/* NOTE */}
                      <td
                        className="border border-[#b5b5b5] w-[220px] p-0 cursor-pointer"
                        onClick={() =>
                          toggleCell(`note-${index}`)
                        }
                      >
                        <div
                          className={`
                            px-1 py-1 text-sm
                            ${
                              expandedCells[`note-${index}`]
                                ? "whitespace-normal break-words min-h-[32px]"
                                : "truncate whitespace-nowrap overflow-hidden h-[32px] flex items-center"
                            }
                          `}
                        >
                          <Input
                            {...register(`items.${index}.note`)}
                            disabled={!isEditing || isSubmitting}
                            className={`
                              ${getInputClass(
                                errors?.items?.[index]?.note,
                                !isEditing || isSubmitting,
                              )}
                              border-0
                              rounded-none
                              h-auto
                              shadow-none
                            `}
                          />
                        </div>
                      </td>

                      {/* UNIT */}
                      <td className="border border-[#b5b5b5] w-[100px] p-0">
                        <Input
                          {...register(`items.${index}.unit`)}
                          disabled
                          className={`
                            ${getInputClass(false, true)}
                            border-0
                            rounded-none
                            h-[32px]
                            text-center
                          `}
                        />
                      </td>

                      {/* QTY */}
                      <td className="border border-[#b5b5b5] w-[100px] p-0">
                        <Input
                          type="number"
                          {...register(`items.${index}.qty`)}
                          disabled={!isEditing || isSubmitting}
                          className={`
                            ${getInputClass(
                              errors?.items?.[index]?.qty,
                              !isEditing || isSubmitting,
                            )}
                            border-0
                            rounded-none
                            h-[32px]
                            text-center
                          `}
                        />
                      </td>

                      {/* AMMENMEND QTY */}
                      <td className="border border-[#b5b5b5] w-[100px] p-0">
                        <Input
                          type="number"
                          disabled
                          className={`
                            ${getInputClass(false, true)}
                            border-0
                            rounded-none
                            h-[32px]
                            text-center
                          `}
                        />
                      </td>

                      {/* LOCATION */}
                      <td
                        className="border border-[#b5b5b5] p-0 cursor-pointer"
                        onClick={() =>
                          toggleCell(`location-${index}`)
                        }
                      >
                        <div
                          className={`
                            ${
                              expandedCells[`location-${index}`]
                                ? "min-h-[32px]"
                                : "h-[32px]"
                            }
                            overflow-hidden
                          `}
                        >
                          <Input
                            {...register(`items.${index}.location`)}
                            disabled={!isEditing || isSubmitting}
                            className={`
                              ${getInputClass(
                                errors?.items?.[index]?.location,
                                !isEditing || isSubmitting,
                              )}
                              border-0
                              rounded-none
                              h-auto
                              min-h-[32px]
                              ${
                                expandedCells[`location-${index}`]
                                  ? "whitespace-normal break-words"
                                  : "truncate whitespace-nowrap overflow-hidden"
                              }
                            `}
                          />
                        </div>
                      </td>

                      {/* DELETE */}
                      {isEditing && (
                        <td className="border border-[#b5b5b5] w-[60px] text-center">
                          <button
                            type="button"
                            disabled={fields.length === 1}
                            onClick={() => remove(index)}
                            className="inline-flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* TOTAL ROW */}
          <table className="w-full border-collapse text-sm table-fixed">
            <tbody>
              <tr className="bg-[#d9d9d9] font-bold">
                <td className="border border-[#b5b5b5] w-[50px]"></td>

                <td className="border border-[#b5b5b5] w-[110px]"></td>

                <td className="border border-[#b5b5b5] w-[200px]"></td>

                <td className="border border-[#b5b5b5] w-[220px] text-center">
                  TOTAL
                </td>

                <td className="border border-[#b5b5b5] w-[100px]"></td>

                <td className="border border-[#b5b5b5] w-[100px] text-center">
                  {totalQty}
                </td>

                <td className="border border-[#b5b5b5] w-[100px] text-center">
                  {totalAmmenmendQty}
                </td>

                <td className="border border-[#b5b5b5]"></td>

                {isEditing && (
                  <td className="border border-[#b5b5b5] w-[60px]"></td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ROW */}
      {isEditing && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => append(defaultItemRow)}
            className="
              px-4
              py-1
              bg-[#9fc5e8]
              border
              border-[#6d9dc5]
              rounded-sm
              text-sm
              font-medium
              hover:brightness-95
              cursor-pointer
            "
          >
            Add Row
          </button>
        </div>
      )}
    </div>
  );
}

