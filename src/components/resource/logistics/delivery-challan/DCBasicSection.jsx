"use client";

import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { Paperclip, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ExpandableTextField from "@/components/common/ExpandableTextField";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import { getInputClass, labelClass } from "@/lib/formStyles";
import { getLocalStorage } from "@/lib/localStorage";

const ORDER_TYPE_OPTIONS = [
  { label: "Purchase Order",      value: "Purchase_Order"      },
  { label: "Site Transfer Order", value: "Site_Transfer_Order" },
];

const PURPOSE_OPTIONS = [
  { label: "Not For Sale",   value: "Not_For_Sale"   },
  { label: "For Sale",       value: "For_Sale"        },
  { label: "New Purchases",  value: "New_Purchases"   },
];

const DELIVERY_MODE_OPTIONS = [
  { label: "Road",    value: "Road"    },
  { label: "Rail",    value: "Rail"    },
  { label: "Air",     value: "Air"     },
  { label: "Sea",     value: "Sea"     },
  { label: "Courier", value: "Courier" },
];

const LABEL = `${labelClass} w-[190px] min-w-[190px] max-w-[190px]`;

export default function DCBasicSection({
  form,
  disabled,
  mode,
  onOrderItemsFetched,
  fileRef,
  newFileName,
  existingFileUrl,
  onFileChange,
}) {
  const { register, control, setValue, watch, formState: { errors } } = form;

  const projectInfo   = getLocalStorage("projectInfo");
  const projectCode   = projectInfo?.projectCode || "";

  const orderType  = watch("orderType");
  const orderId    = watch("orderId");

  const [approvedOrders,  setApprovedOrders]  = useState([]);
  const [loadingOrders,   setLoadingOrders]   = useState(false);
  const [loadingItems,    setLoadingItems]    = useState(false);

  // ── LOAD APPROVED ORDERS when orderType changes ───────────────────────────
  useEffect(() => {
    if (!orderType || !projectCode) {
      setApprovedOrders([]);
      return;
    }
    const fetch = async () => {
      setLoadingOrders(true);
      try {
        const res = await apiRequest({
          url: `${API_ENDPOINTS.RESOURCE.MATERIAL_MANAGEMENT.LOGISTICS.DC.GET_APPROVED_ORDERS}?projectCode=${projectCode}&orderType=${orderType}`,
          method: "GET",
        });
        setApprovedOrders(res.data || []);
      } catch {
        setApprovedOrders([]);
        toast.error("Failed to load approved orders");
      } finally {
        setLoadingOrders(false);
      }
    };
    fetch();
  }, [orderType, projectCode]);

  // ── CLEAR FROM/TO WHEN ORDER TYPE CHANGES (create only) ──────────────────
  const handleOrderTypeChange = (val) => {
    setValue("orderType", val);
    if (mode === "create") {
      setValue("orderId",             "");
      setValue("fromDisplayCode",     "");
      setValue("fromDisplayName",     "");
      setValue("shippingFromAddress", "");
      setValue("fromGstn",            "");
      setValue("toProjectCode",       "");
      setValue("toProjectName",       "");
      setValue("shippingToAddress",   "");
      setValue("toGstn",              "");
      onOrderItemsFetched(null);
    }
  };

  // ── HANDLE ORDER SELECTION — fetch from/to details + items ───────────────
  const handleOrderSelect = async (val) => {
    setValue("orderId", val);
    if (!val) {
      onOrderItemsFetched(null);
      return;
    }

    // Fetch from/to details and items in parallel
    setLoadingItems(true);
    try {
      const [detailsRes, itemsRes] = await Promise.all([
        apiRequest({
          url: `${API_ENDPOINTS.RESOURCE.MATERIAL_MANAGEMENT.LOGISTICS.DC.GET_FROM_DETAILS}/${val}?currentProjectCode=${projectCode}`,
          method: "GET",
        }),
        apiRequest({
          url: `${API_ENDPOINTS.RESOURCE.MATERIAL_MANAGEMENT.LOGISTICS.DC.GET_ORDER_ITEMS}/${val}`,
          method: "GET",
        }),
      ]);

      const d = detailsRes.data?.[0] || detailsRes.data || {};
      // From details
      if (d.fromType === "vendor") {
        setValue("fromDisplayCode",     "Vendor");
        setValue("fromDisplayName",     d.fromVendorName      || "");
        setValue("fromGstn",            d.fromGstn            || "");
        setValue("shippingFromAddress", d.fromAddress         || "");
      } else {
        setValue("fromDisplayCode",     d.fromProjectCode     || "");
        setValue("fromDisplayName",     d.fromProjectName     || "");
        setValue("fromGstn",            d.fromGstn            || "");
        setValue("shippingFromAddress", d.fromAddress         || "");
      }
      setValue("toProjectCode",     d.toProjectCode   || "");
      setValue("toProjectName",     d.toProjectName   || "");
      setValue("shippingToAddress", d.toAddress       || "");
      setValue("toGstn",            d.toGstn          || "");

      onOrderItemsFetched(itemsRes.data || null);
    } catch (err) {
      toast.error(err.message || "Failed to load order details");
      onOrderItemsFetched(null);
    } finally {
      setLoadingItems(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-4 w-full xl:w-[430px] shrink-0 xl:overflow-y-auto xl:max-h-[calc(100vh-110px)] pr-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-4">

        {/* ── GROUP 1: DC INFO ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-[2px]">
          {/* DC No */}
          <div className="flex items-center">
            <div className={LABEL}>DC No</div>
            <Input
              {...register("dcNo")}
              disabled
              placeholder="[Auto]"
              className={`${getInputClass(false, true)} w-[220px] h-[30px]`}
            />
          </div>

          {/* Challan Date */}
          <div className="flex items-center">
            <div className={LABEL}>Challan Date</div>
            <Input
              type="date"
              {...register("challanDate")}
              disabled={disabled}
              className={`${getInputClass(!!errors.challanDate, disabled)} w-[220px] h-[30px]`}
            />
          </div>
        </div>

        {/* ── GROUP 2: ORDER SELECTION ──────────────────────────────────────── */}
        <div className="flex flex-col gap-[2px]">
          {/* Order Type */}
          <div className="flex items-center">
            <div className={LABEL}>Order Type</div>
            <div className="w-[220px]">
              <Controller
                control={control}
                name="orderType"
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={(v) => { field.onChange(v); handleOrderTypeChange(v); }}
                    disabled={disabled}
                  >
                    <SelectTrigger className={`${getInputClass(!!errors.orderType, disabled)} w-full h-[30px]`}>
                      <SelectValue placeholder="Select Order Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Order No */}
          <div className="flex items-center">
            <div className={LABEL}>Order No</div>
            <div className="w-[220px]">
              <Controller
                control={control}
                name="orderId"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => { field.onChange(v); handleOrderSelect(v); }}
                    disabled={disabled || !orderType || loadingOrders || loadingItems}
                  >
                    <SelectTrigger
                      className={`
                        ${getInputClass(!!errors.orderId, disabled)}
                        w-full h-[30px]
                        ${!disabled && !errors.orderId && orderId ? "" : ""}
                        ${!disabled && !errors.orderId ? "bg-[#f0fdf4] border-[#22c55e]" : ""}
                      `}
                    >
                      <SelectValue
                        placeholder={
                          loadingOrders ? "Loading orders..." :
                          loadingItems  ? "Loading items..."  :
                          !orderType    ? "Select Order Type first" :
                                          "Select Order No"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {approvedOrders.map((o) => (
                        <SelectItem key={o.orderId} value={String(o.orderId)}>
                          {o.orderNo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>

        {/* ── GROUP 3: FROM DETAILS ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-[2px]">
          {/* From Project Code */}
          <div className="flex items-center">
            <div className={LABEL}>From Project Code</div>
            <Input
              {...register("fromDisplayCode")}
              disabled
              placeholder="[Auto]"
              className={`${getInputClass(false, true)} w-[220px] h-[30px]`}
            />
          </div>

          {/* From Project Name */}
          <div className="flex items-center">
            <div className={LABEL}>From Project Name</div>
            <div className="w-[220px]">
              <Controller
                control={control}
                name="fromDisplayName"
                render={({ field }) => (
                  <ExpandableTextField
                    value={field.value}
                    onChange={field.onChange}
                    disabled
                    title="From Project Name"
                    placeholder="[Auto]"
                    minHeight="min-h-[30px]"
                    modalHeight="min-h-[140px]"
                  />
                )}
              />
            </div>
          </div>

          {/* Shipping From Address */}
          <div className="flex items-center">
            <div className={LABEL}>Shipping From Address</div>
            <div className="w-[220px]">
              <Controller
                control={control}
                name="shippingFromAddress"
                render={({ field }) => (
                  <ExpandableTextField
                    value={field.value}
                    onChange={field.onChange}
                    disabled
                    title="Shipping From Address"
                    placeholder="[Auto]"
                    minHeight="min-h-[30px]"
                    modalHeight="min-h-[180px]"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* ── GROUP 4: TO DETAILS ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-[2px]">
          {/* To Project Code */}
          <div className="flex items-center">
            <div className={LABEL}>To Project Code</div>
            <Input
              {...register("toProjectCode")}
              disabled
              placeholder="[Auto]"
              className={`${getInputClass(false, true)} w-[220px] h-[30px]`}
            />
          </div>

          {/* To Project Name */}
          <div className="flex items-center">
            <div className={LABEL}>To Project Name</div>
            <div className="w-[220px]">
              <Controller
                control={control}
                name="toProjectName"
                render={({ field }) => (
                  <ExpandableTextField
                    value={field.value}
                    onChange={field.onChange}
                    disabled
                    title="To Project Name"
                    placeholder="[Auto]"
                    minHeight="min-h-[30px]"
                    modalHeight="min-h-[140px]"
                  />
                )}
              />
            </div>
          </div>

          {/* Shipping To Address */}
          <div className="flex items-center">
            <div className={LABEL}>Shipping To Address</div>
            <div className="w-[220px]">
              <Controller
                control={control}
                name="shippingToAddress"
                render={({ field }) => (
                  <ExpandableTextField
                    value={field.value}
                    onChange={field.onChange}
                    disabled={disabled}
                    title="Shipping To Address"
                    placeholder="Text"
                    minHeight="min-h-[30px]"
                    modalHeight="min-h-[180px]"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* ── GROUP 5: CONTACT & PURPOSE ────────────────────────────────────── */}
        <div className="flex flex-col gap-[2px]">
          {/* Contact Person */}
          <div className="flex items-center">
            <div className={LABEL}>Contact Person</div>
            <Input
              {...register("contactPerson")}
              disabled={disabled}
              placeholder="Text"
              className={`${getInputClass(false, disabled)} w-[220px] h-[30px]`}
            />
          </div>

          {/* Purpose for Delivery */}
          <div className="flex items-center">
            <div className={LABEL}>Purpose for Delivery</div>
            <div className="w-[220px]">
              <Controller
                control={control}
                name="purposeForDelivery"
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <SelectTrigger className={`${getInputClass(!!errors.purposeForDelivery, disabled)} w-full h-[30px]`}>
                      <SelectValue placeholder="Select Purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {PURPOSE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Delivery Mode */}
          <div className="flex items-center">
            <div className={LABEL}>Delivery Mode</div>
            <div className="w-[220px]">
              <Controller
                control={control}
                name="deliveryMode"
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <SelectTrigger className={`${getInputClass(false, disabled)} w-full h-[30px]`}>
                      <SelectValue placeholder="Select Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_MODE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>

        {/* ── GROUP 6: VEHICLE / DRIVER ─────────────────────────────────────── */}
        <div className="flex flex-col gap-[2px]">
          {/* Vehicle Number */}
          <div className="flex items-center">
            <div className={LABEL}>Vehicle Number</div>
            <Input
              {...register("vehicleNumber")}
              disabled={disabled}
              placeholder="Text"
              className={`${getInputClass(false, disabled)} w-[220px] h-[30px]`}
            />
          </div>

          {/* Driver Name */}
          <div className="flex items-center">
            <div className={LABEL}>Driver Name</div>
            <Input
              {...register("driverName")}
              disabled={disabled}
              placeholder="Text"
              className={`${getInputClass(false, disabled)} w-[220px] h-[30px]`}
            />
          </div>

          {/* Driver Contact Number */}
          <div className="flex items-center">
            <div className={LABEL}>Driver Contact Number</div>
            <Input
              {...register("driverContactNumber")}
              disabled={disabled}
              placeholder="Text"
              className={`${getInputClass(false, disabled)} w-[220px] h-[30px]`}
            />
          </div>
        </div>

        {/* ── GROUP 7: EWAY BILL ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-[2px]">
          {/* Eway Bill Number */}
          <div className="flex items-center">
            <div className={LABEL}>Eway Bill Number</div>
            <Input
              {...register("ewayBillNumber")}
              disabled={disabled}
              placeholder="Text"
              className={`${getInputClass(false, disabled)} w-[220px] h-[30px]`}
            />
          </div>

          {/* Eway Bill Date */}
          <div className="flex items-center">
            <div className={LABEL}>Eway Bill Date</div>
            <Input
              type="date"
              {...register("ewayBillDate")}
              disabled={disabled}
              className={`${getInputClass(false, disabled)} w-[220px] h-[30px]`}
            />
          </div>

          {/* Eway Bill Expiry Date */}
          <div className="flex items-center">
            <div className={LABEL}>Eway Bill Expiry Date</div>
            <Input
              type="date"
              {...register("ewayBillExpiryDate")}
              disabled={disabled}
              className={`${getInputClass(false, disabled)} w-[220px] h-[30px]`}
            />
          </div>
        </div>
      </div>
      {/* end groups grid */}

      {/* ── DOCUMENT ATTACHMENT ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 pb-2">
        <button
          type="button"
          onClick={() => !disabled && fileRef?.current?.click()}
          className={`h-[32px] px-4 rounded-md border border-[#c96b2c] text-sm font-medium flex items-center gap-1.5 transition
            ${
              disabled
                ? "bg-[#e9a06d] opacity-60 cursor-not-allowed"
                : "bg-[#e9a06d] hover:bg-[#d88b5a] cursor-pointer"
            }`}
        >
          <Paperclip className="w-4 h-4" />
          Attached Doc @
        </button>

        <input
          ref={fileRef}
          type="file"
          hidden
          accept=".pdf,.xls,.xlsx,.jpg,.jpeg,.png"
          onChange={onFileChange}
        />

        {newFileName && (
          <span className="flex items-center gap-1 text-[12px] text-gray-700">
            <Paperclip className="w-3 h-3 text-orange-500" />
            {newFileName}
          </span>
        )}

        {!newFileName && existingFileUrl && (
          <a
            href={existingFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[12px] text-blue-600 hover:underline"
          >
            <Download className="w-3.5 h-3.5" />
            Download Attached Doc
          </a>
        )}

        {!newFileName && !existingFileUrl && disabled && (
          <span className="text-[12px] italic text-gray-400">No document attached</span>
        )}
      </div>
    </div>
  );
}
