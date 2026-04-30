"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import SaveButton from "@/components/common/SaveButton";
import EditButton from "@/components/common/EditButton";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import { toast } from "sonner";

const schema = z.object({
  itemCategoryId: z.string().min(1, "Required"),
  ccCodeId: z.string().min(1, "Required"),
  itemName: z.string().min(1, "Required"),
  itemDescription: z.string().min(1, "Required"),
  unit: z.string().min(1, "Required"),
  hsnSac: z.string().min(1, "Required"),
  gstPercentage: z.string().min(1, "Required"),
});

export default function ItemForm({
  mode = "create",
  itemId,
  initialData,
  categories = [],
  ccList = [],
}) {
  const [isEditing, setIsEditing] = useState(mode === "create");

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  //  SYNC DATA (IMPORTANT)
  useEffect(() => {
    if (mode === "edit" && initialData && categories.length && ccList.length) {
      reset({
        ...initialData,
        itemCategoryId: String(initialData.itemCategoryId),
        ccCodeId: String(initialData.ccCodeId),
      });
    }
  }, [initialData, categories, ccList]);

  //  SUBMIT
  const onSubmit = async () => {
    let toastId;

    try {
      toastId = toast.loading("Saving...");

      const v = getValues();
      const payload = {
        itemCategoryId: Number(v.itemCategoryId),
        ccCodeId: Number(v.ccCodeId),
        itemName: v.itemName,
        itemDescription: v.itemDescription,
        unit: v.unit,
        hsnSac: v.hsnSac,
        gstPercentage: v.gstPercentage,
      };

      if (mode === "create") {
        const res = await apiRequest({
          url: API_ENDPOINTS.MASTER.CREATE_ITEM,
          method: "POST",
          data: payload,
        });

        const d = res.data[0];

        setValue("itemCode", d.itemCode);
        setIsEditing(false);

        toast.success("Created", { id: toastId });

      } else {
        const res = await apiRequest({
          url: `${API_ENDPOINTS.MASTER.UPDATE_ITEM_BY_ID}/${itemId}`,
          method: "PUT",
          data: payload,
        });

        const d = res.data[0];

        setValue("itemCode", d.itemCode);
        setIsEditing(false);

        toast.success("Updated", { id: toastId });
      }

    } catch (err) {
      toast.error(err.message || "Failed", { id: toastId });
    }
  };

  const handleCancel = () => {
    if (!initialData) return;

    reset({
      ...initialData,
      itemCategoryId: String(initialData.itemCategoryId),
      ccCodeId: String(initialData.ccCodeId),
    });

    setIsEditing(false);
  };

  const label =
    "w-[220px] px-3 py-1 bg-[#d6e6f2] border rounded-sm text-sm";
  const inputClass =
    "border border-[#8f8f8f] h-[30px] text-sm rounded-sm px-2";
  const error = "text-red-500 text-[10px]";

  return (
    <div className="p-4 flex flex-col gap-7">

      {/* ITEM CODE */}
      <div className="flex gap-2">
        <div className={label}>Item Code</div>
        <Input {...register("itemCode")} disabled className="w-[200px]" placeholder="[Auto]" />
      </div>

      <div className="space-y-1">
        {/* CATEGORY */}
        <div className="flex flex-col">
          <div className="flex gap-2">
            <div className={label}>Item Category</div>

            <select
              {...register("itemCategoryId")}
              disabled={!isEditing || isSubmitting}
              className={`flex-1 ${inputClass} ${errors.itemCategoryId && "border-red-500"} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
            >
              <option value="">Select</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>
          {/* <p className={error}>{errors.itemCategoryId?.message}</p> */}
        </div>

        {/* CC */}
        <div className="flex flex-col">
          <div className="flex gap-2">
            <div className={label}>CC Name</div>

            <select
              {...register("ccCodeId")}
              disabled={!isEditing || isSubmitting}
              className={`flex-1 ${inputClass} ${errors.ccCodeId && "border-red-500"} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
            >
              <option value="">Select</option>
              {ccList.map((c) => (
                <option key={c.ccId} value={c.ccId}>
                  {c.ccName}
                </option>
              ))}
            </select>
          </div>
          {/* <p className={error}>{errors.ccCodeId?.message}</p> */}
        </div>
      </div>


      <div className="space-y-1">
        {/* NAME */}
        <div className="flex flex-col">
          <div className="flex gap-2">
            <div className={label}>Item Name</div>
            <Input {...register("itemName")} disabled={!isEditing || isSubmitting} className="flex-1" />
          </div>
          {/* <p className={error}>{errors.itemName?.message}</p> */}
        </div>

        {/* DESC */}
        <div className="flex flex-col">
          <div className="flex gap-2 items-start">
            <div className={label}>Item Description</div>
            <textarea
              {...register("itemDescription")}
              disabled={!isEditing || isSubmitting}
              className={`
    flex-1
    border border-[#8f8f8f]
    text-sm
    rounded-sm
    px-2 py-1
    min-h-[80px]
    resize-none
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
    ${errors.itemDescription && "border-red-500"}
  `}
              placeholder="Text"
            />        </div>
          {/* <p className={error}>{errors.itemDescription?.message}</p> */}
        </div>
      </div>


      {/* BOTTOM LEFT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 mt-7">

        <div className="space-y-2">

          {/* UNIT */}
          <div className="flex flex-col">
            <div className="flex gap-2">
              <div className={label}>Unit</div>
              <Input
                {...register("unit")}
                disabled={!isEditing || isSubmitting}
                className={`flex-1 ${inputClass} ${errors.unit && "border-red-500"}`}
              />
            </div>
            {/* <p className={error}>{errors.unit?.message}</p> */}
          </div>

          {/* HSN */}
          <div className="flex flex-col">
            <div className="flex gap-2">
              <div className={label}>HSN/SAC</div>
              <Input
                {...register("hsnSac")}
                disabled={!isEditing || isSubmitting}
                className={`flex-1 ${inputClass} ${errors.hsnSac && "border-red-500"}`}
              />
            </div>
            {/* <p className={error}>{errors.hsnSac?.message}</p> */}
          </div>

          {/* GST */}
          <div className="flex flex-col">
            <div className="flex gap-2">
              <div className={label}>GST %</div>
              <Input
                {...register("gstPercentage")}
                disabled={!isEditing || isSubmitting}
                className={`flex-1 ${inputClass} ${errors.gstPercentage && "border-red-500"}`}
              />
            </div>
            {/* <p className={error}>{errors.gstPercentage?.message}</p> */}
          </div>

        </div>

      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-3 mt-10">
        <SaveButton
          onClick={() => handleSubmit(onSubmit)()}
          loading={isSubmitting}
          disabled={!isEditing || isSubmitting}
        />

        {mode === "edit" && (
          <EditButton onClick={isEditing ? handleCancel : () => setIsEditing(true)} disabled={isSubmitting}>
            {isEditing ? "Cancel" : "Edit"}
          </EditButton>
        )}
      </div>

    </div>
  );
}