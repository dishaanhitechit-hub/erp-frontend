// "use client";

// import { Input } from "@/components/ui/input";
// import { Trash2 } from "lucide-react";
// import { getInputClass } from "@/lib/formStyles";
// import SearchableSelect from "@/components/common/SearchableSelect";
// import { useState } from "react";

// export default function IndentItemsTable({
//   fields,
//   register,
//   setValue,
//   watch,
//   append,
//   remove,
//   errors,
//   isEditing,
//   isSubmitting,
//   itemsOptions,
// }) {
//   const defaultItemRow = {
//     itemCode: "",
//     itemName: "",
//     note: "",
//     unit: "",
//     qty: "",
//     ammenmendQty: "",
//     location: "",
//   };

//   const [expandedCells, setExpandedCells] = useState({});

//   const totalQty = watch("items")?.reduce(
//     (sum, item) => sum + Number(item.qty || 0),
//     0,
//   );

//   const totalAmmenmendQty = watch("items")?.reduce(
//     (sum, item) => sum + Number(item?.ammenmendQty || 0),
//     0,
//   );

//   const toggleCell = (key) => {
//     setExpandedCells((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }));
//   };

//   const handleItemSelect = (rowIndex, value, item) => {
//     setValue(`items.${rowIndex}.itemCode`, item?.itemCode || "");

//     setValue(`items.${rowIndex}.itemName`, item?.itemName || "");

//     setValue(`items.${rowIndex}.unit`, item?.unit || "");
//   };

//   const formatNumber = (num) => {
//     if (!num) return 0;

//     const value = Number(num);

//     if (value > 999999999) {
//       return value.toExponential(2);
//     }

//     return value;
//   };

//   return (
//     <div className="flex-1 min-w-0">
//       <div className="border border-[#b5b5b5] overflow-hidden">
//         {/* HEADER */}
//         <div className="bg-[#e8f0df] px-2 py-1 border-b border-[#b5b5b5] font-bold text-[18px]">
//           BASIC
//         </div>

//         {/* TABLE WRAPPER */}
//         <div className="w-full overflow-x-auto">
//           <div
//             className={`
//               overflow-auto
//               custom-thin-scrollbar
//               ${fields.length > 7 ? "max-h-[320px]" : ""}
//             `}
//           >
//             <table className="min-w-[1010px] w-full border-collapse text-sm table-fixed">
//               {/* TABLE HEADER */}
//               <thead className="sticky top-0 z-20 bg-[#d9d9d9]">
//                 <tr>
//                   <th className="border border-[#b5b5b5] w-[40px] text-center">
//                     Sl no
//                   </th>

//                   <th className="border border-[#b5b5b5] w-[100px] text-left px-2">
//                     Item Code
//                   </th>

//                   <th className="border border-[#b5b5b5] w-[180px] text-left px-2">
//                     Item Name
//                   </th>

//                   <th className="border border-[#b5b5b5] w-[180px] text-left px-2">
//                     Note
//                   </th>

//                   <th className="border border-[#b5b5b5] w-[90px] text-center">
//                     Unit
//                   </th>

//                   <th className="border border-[#b5b5b5] w-[90px] text-center">
//                     Qty
//                   </th>

//                   <th className="border border-[#b5b5b5] w-[90px] text-center">
//                     Ammenmend Qty
//                   </th>

//                   <th className="border border-[#b5b5b5] w-[180px] text-center">
//                     Location
//                   </th>

//                   {isEditing && (
//                     <th className="border border-[#b5b5b5] w-[40px] text-center">
//                       Action
//                     </th>
//                   )}
//                 </tr>
//               </thead>

//               {/* TABLE BODY */}
//               <tbody>
//                 {fields.map((field, index) => {
//                   const selectedItemCode = watch(`items.${index}.itemCode`);

//                   return (
//                     <tr key={field.id}>
//                       {/* SL NO */}
//                       <td className="border border-[#b5b5b5] text-center bg-[#f7f7f7] align-middle">
//                         {index + 1}
//                       </td>

//                       {/* ITEM CODE */}
//                       <td className="border border-[#b5b5b5] p-0 align-middle">
//                         <Input
//                           {...register(`items.${index}.itemCode`)}
//                           disabled
//                           className={`
//                             ${getInputClass(false, true)}
//                             border-0
//                             rounded-none
//                             h-[32px]
//                           `}
//                         />
//                       </td>

//                       {/* ITEM SELECT */}
//                       <td className="border border-[#b5b5b5] p-0 align-middle">
//                         <SearchableSelect
//                           options={itemsOptions}
//                           value={selectedItemCode}
//                           disabled={!isEditing || isSubmitting}
//                           onChange={(value, item) =>
//                             handleItemSelect(index, value, item)
//                           }
//                           placeholder="Select Item"
//                           labelKey="itemName"
//                           valueKey="itemCode"
//                           searchKeys={["itemName", "itemCode"]}
//                           className="rounded-none"
//                         />
//                       </td>

//                       {/* NOTE */}
//                       <td
//                         className="border border-[#b5b5b5] p-0 cursor-pointer"
//                         onClick={() => toggleCell(`note-${index}`)}
//                       >
//                         <div
//                           className={`
//                             px-1 py-1 text-sm
//                             ${
//                               expandedCells[`note-${index}`]
//                                 ? "whitespace-normal break-words min-h-[32px]"
//                                 : "truncate whitespace-nowrap overflow-hidden h-[32px] flex items-center"
//                             }
//                           `}
//                         >
//                           <Input
//                             {...register(`items.${index}.note`)}
//                             disabled={!isEditing || isSubmitting}
//                             className={`
//                               ${getInputClass(
//                                 errors?.items?.[index]?.note,
//                                 !isEditing || isSubmitting,
//                               )}
//                               border-0
//                               rounded-none
//                               h-auto
//                               shadow-none
//                             `}
//                           />
//                         </div>
//                       </td>

//                       {/* UNIT */}
//                       <td className="border border-[#b5b5b5] p-0 align-middle">
//                         <Input
//                           {...register(`items.${index}.unit`)}
//                           disabled
//                           className={`
//                             ${getInputClass(false, true)}
//                             border-0
//                             rounded-none
//                             h-[32px]
//                             text-center
//                           `}
//                         />
//                       </td>

//                       {/* QTY */}
//                       <td className="border border-[#b5b5b5] p-0 align-middle">
//                         <Input
//                           type="number"
//                           min={0}
//                           {...register(`items.${index}.qty`, {
//                             min: 0,
//                             onChange: (e) => {
//                               if (Number(e.target.value) < 0) {
//                                 e.target.value = 0;
//                               }
//                             },
//                           })}
//                           disabled={!isEditing || isSubmitting}
//                           className={`
//     ${getInputClass(errors?.items?.[index]?.qty, !isEditing || isSubmitting)}
//     border-0
//     rounded-none
//     h-[32px]
//     text-center
//   `}
//                         />
//                       </td>

//                       {/* AMMENMEND QTY */}
//                       <td className="border border-[#b5b5b5] p-0 align-middle">
//                         <Input
//                           type="number"
//                           value={watch(`items.${index}.ammenmendQty`) || ""}
//                           disabled
//                           className={`
//                                 ${getInputClass(false, true)}
//                                 border-0
//                                 rounded-none
//                                 h-[32px]
//                                 text-center
//                               `}
//                         />
//                       </td>

//                       {/* LOCATION */}
//                       <td
//                         className="border border-[#b5b5b5] p-0 cursor-pointer"
//                         onClick={() => toggleCell(`location-${index}`)}
//                       >
//                         <div
//                           className={`
//                             ${
//                               expandedCells[`location-${index}`]
//                                 ? "min-h-[32px]"
//                                 : "h-[32px]"
//                             }
//                             overflow-hidden
//                           `}
//                         >
//                           <Input
//                             {...register(`items.${index}.location`)}
//                             disabled={!isEditing || isSubmitting}
//                             className={`
//                               ${getInputClass(
//                                 errors?.items?.[index]?.location,
//                                 !isEditing || isSubmitting,
//                               )}
//                               border-0
//                               rounded-none
//                               h-auto
//                               min-h-[32px]
//                               ${
//                                 expandedCells[`location-${index}`]
//                                   ? "whitespace-normal break-words"
//                                   : "truncate whitespace-nowrap overflow-hidden"
//                               }
//                             `}
//                           />
//                         </div>
//                       </td>

//                       {/* DELETE */}
//                       {isEditing && (
//                         <td className="border border-[#b5b5b5] text-center ">
//                           <button
//                             type="button"
//                             disabled={fields.length === 1}
//                             onClick={() => remove(index)}
//                             className="inline-flex items-center justify-center"
//                           >
//                             <Trash2 className="w-4 h-4 text-red-500" />
//                           </button>
//                         </td>
//                       )}
//                     </tr>
//                   );
//                 })}
//               </tbody>

//               {/* TABLE FOOTER */}
//               <tfoot className="sticky bottom-0 z-20 bg-[#d9d9d9]">
//                 <tr className="font-bold">
//                   <td className="border border-[#b5b5b5]"></td>

//                   <td className="border border-[#b5b5b5]"></td>

//                   <td className="border border-[#b5b5b5]"></td>

//                   <td className="border border-[#b5b5b5] text-center">TOTAL</td>

//                   <td className="border border-[#b5b5b5]"></td>

//                   <td
//                     className="
//     border border-[#b5b5b5]
//     text-center
//     whitespace-nowrap
//     overflow-hidden
//     text-ellipsis
//     px-2
//   "
//                     title={totalQty}
//                   >
//                     {formatNumber(totalQty)}
//                   </td>

//                   <td
//                     className="
//                       border border-[#b5b5b5]
//                       text-center
//                       whitespace-nowrap
//                       overflow-hidden
//                       text-ellipsis
//                       px-2
//                     "
//                     title={formatNumber(totalAmmenmendQty)}
//                   >
//                     {totalAmmenmendQty}
//                   </td>

//                   <td className="border border-[#b5b5b5]"></td>

//                   {isEditing && <td className="border border-[#b5b5b5]"></td>}
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* ADD ROW */}
//       {isEditing && (
//         <div className="mt-3 flex justify-end">
//           <button
//             type="button"
//             onClick={() => append(defaultItemRow)}
//             className="
//               px-4
//               py-1
//               bg-[#9fc5e8]
//               border
//               border-[#6d9dc5]
//               rounded-sm
//               text-sm
//               font-medium
//               hover:brightness-95
//               cursor-pointer
//             "
//           >
//             Add Row
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

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
    (sum, item) => sum + Number(item?.ammenmendQty || 0),
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

  const formatNumber = (num) => {
    if (!num) return 0;

    const value = Number(num);

    if (value > 999999999) {
      return value.toExponential(2);
    }

    return value;
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="border border-[#b5b5b5] overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#e8f0df] px-2 py-1 border-b border-[#b5b5b5] font-bold text-[18px]">
          BASIC
        </div>

        {/* TABLE WRAPPER */}
        <div className="w-full overflow-x-auto">
          <div
            className={`
              overflow-auto
              custom-thin-scrollbar
              ${fields.length > 7 ? "max-h-[320px]" : ""}
            `}
          >
            <table className="min-w-[1010px] w-full border-collapse text-sm table-fixed">
              {/* TABLE HEADER */}
              <thead className="sticky top-0 z-20 bg-[#d9d9d9]">
                <tr>
                  <th className="border border-[#b5b5b5] w-[40px] text-center">
                    Sl no
                  </th>

                  <th className="border border-[#b5b5b5] w-[100px] text-left px-2">
                    Item Code
                  </th>

                  <th className="border border-[#b5b5b5] w-[180px] text-left px-2">
                    Item Name
                  </th>

                  <th className="border border-[#b5b5b5] w-[180px] text-left px-2">
                    Note
                  </th>

                  <th className="border border-[#b5b5b5] w-[90px] text-center">
                    Unit
                  </th>

                  <th className="border border-[#b5b5b5] w-[90px] text-center">
                    Qty
                  </th>

                  <th className="border border-[#b5b5b5] w-[90px] text-center">
                    Ammenmend Qty
                  </th>

                  <th className="border border-[#b5b5b5] w-[180px] text-center">
                    Location
                  </th>

                  {isEditing && (
                    <th className="border border-[#b5b5b5] w-[40px] text-center">
                      Action
                    </th>
                  )}
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>
                {fields.map((field, index) => {
                  const selectedItemCode = watch(`items.${index}.itemCode`);

                  return (
                    <tr key={field.id}>
                      {/* SL NO */}
                      <td className="border border-[#b5b5b5] text-center bg-[#f7f7f7] align-middle">
                        {index + 1}
                      </td>

                      {/* ITEM CODE */}
                      <td className="border border-[#b5b5b5] p-0 align-middle">
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
                      <td className="border border-[#b5b5b5] p-0 align-middle">
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
                          searchKeys={["itemName", "itemCode"]}
                          className="rounded-none"
                        />
                      </td>

                      {/* NOTE */}
                      {/* <td
                        className="border border-[#b5b5b5] p-0 cursor-pointer"
                        onClick={() => toggleCell(`note-${index}`)}
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
                      </td> */}
                      {/* NOTE */}
                      <td className="border border-[#b5b5b5] p-0 align-stretch">
                        {isEditing ? (
                          <textarea
                            {...register(`items.${index}.note`)}
                            rows={expandedCells[`note-${index}`] ? 3 : 1}
                            disabled={!isEditing || isSubmitting}
                            className={`
        ${getInputClass(
          errors?.items?.[index]?.note,
          !isEditing || isSubmitting,
        )}
        w-full
        h-full
        min-h-[32px]
        resize-none
        border-0
        outline-none
        overflow-hidden
        text-sm
        leading-5
        px-2
        py-1
        bg-white

        ${
          expandedCells[`note-${index}`]
            ? "whitespace-normal break-words"
            : "truncate whitespace-nowrap"
        }
      `}
                          />
                        ) : (
                          <div
                            className="
        w-full
        h-full
        min-h-[32px]
        px-2
        py-1
        text-sm
        bg-[#edf8ed]
        flex
        flex-col
        justify-center
      "
                          >
                            <div
                              className={
                                expandedCells[`note-${index}`]
                                  ? "whitespace-normal break-words"
                                  : "truncate whitespace-nowrap overflow-hidden"
                              }
                            >
                              {watch(`items.${index}.note`) || ""}
                            </div>

                            {(watch(`items.${index}.note`) || "").length >
                              25 && (
                              <button
                                type="button"
                                onClick={() => toggleCell(`note-${index}`)}
                                className="
            text-blue-600
            text-[11px]
            hover:underline
            mt-[2px]
            w-fit
          "
                              >
                                {expandedCells[`note-${index}`]
                                  ? "less"
                                  : "...more"}
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* UNIT */}
                      <td className="border border-[#b5b5b5] p-0 align-middle">
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
                      <td className="border border-[#b5b5b5] p-0 align-middle">
                        <Input
                          type="number"
                          min={0}
                          {...register(`items.${index}.qty`, {
                            min: 0,
                            onChange: (e) => {
                              if (Number(e.target.value) < 0) {
                                e.target.value = 0;
                              }
                            },
                          })}
                          disabled={!isEditing || isSubmitting}
                          className={`
    ${getInputClass(errors?.items?.[index]?.qty, !isEditing || isSubmitting)}
    border-0
    rounded-none
    h-[32px]
    text-center
  `}
                        />
                      </td>

                      {/* AMMENMEND QTY */}
                      <td className="border border-[#b5b5b5] p-0 align-middle">
                        <Input
                          type="number"
                          value={watch(`items.${index}.ammenmendQty`) || ""}
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
                      {/* <td
                        className="border border-[#b5b5b5] p-0 cursor-pointer"
                        onClick={() => toggleCell(`location-${index}`)}
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
                      </td> */}
                      {/* LOCATION */}
                      <td className="border border-[#b5b5b5] p-0 align-stretch">
                        {isEditing ? (
                          <textarea
                            {...register(`items.${index}.location`)}
                            rows={expandedCells[`location-${index}`] ? 3 : 1}
                            disabled={!isEditing || isSubmitting}
                            className={`
        ${getInputClass(
          errors?.items?.[index]?.location,
          !isEditing || isSubmitting,
        )}
        w-full
        h-full
        min-h-[32px]
        resize-none
        border-0
        outline-none
        overflow-hidden
        text-sm
        leading-5
        px-2
        py-1
        bg-white

        ${
          expandedCells[`location-${index}`]
            ? "whitespace-normal break-words"
            : "truncate whitespace-nowrap"
        }
      `}
                          />
                        ) : (
                          <div
                            className="
        w-full
        h-full
        min-h-[32px]
        px-2
        py-1
        text-sm
        bg-[#edf8ed]
        flex
        flex-col
        justify-center
      "
                          >
                            <div
                              className={
                                expandedCells[`location-${index}`]
                                  ? "whitespace-normal break-words"
                                  : "truncate whitespace-nowrap overflow-hidden"
                              }
                            >
                              {watch(`items.${index}.location`) || ""}
                            </div>

                            {(watch(`items.${index}.location`) || "").length >
                              20 && (
                              <button
                                type="button"
                                onClick={() => toggleCell(`location-${index}`)}
                                className="
            text-blue-600
            text-[11px]
            hover:underline
            mt-[2px]
            w-fit
          "
                              >
                                {expandedCells[`location-${index}`]
                                  ? "less"
                                  : "...more"}
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* DELETE */}
                      {isEditing && (
                        <td className="border border-[#b5b5b5] text-center ">
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

              {/* TABLE FOOTER */}
              <tfoot className="sticky bottom-0 z-20 bg-[#d9d9d9]">
                <tr className="font-bold">
                  <td className="border border-[#b5b5b5]"></td>

                  <td className="border border-[#b5b5b5]"></td>

                  <td className="border border-[#b5b5b5]"></td>

                  <td className="border border-[#b5b5b5] text-center">TOTAL</td>

                  <td className="border border-[#b5b5b5]"></td>

                  <td
                    className="
    border border-[#b5b5b5]
    text-center
    whitespace-nowrap
    overflow-hidden
    text-ellipsis
    px-2
  "
                    title={totalQty}
                  >
                    {formatNumber(totalQty)}
                  </td>

                  <td
                    className="
                      border border-[#b5b5b5]
                      text-center
                      whitespace-nowrap
                      overflow-hidden
                      text-ellipsis
                      px-2
                    "
                    title={formatNumber(totalAmmenmendQty)}
                  >
                    {totalAmmenmendQty}
                  </td>

                  <td className="border border-[#b5b5b5]"></td>

                  {isEditing && <td className="border border-[#b5b5b5]"></td>}
                </tr>
              </tfoot>
            </table>
          </div>
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
