"use client";

import { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ExpandableTextField from "@/components/common/ExpandableTextField";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import { getInputClass, labelClass } from "@/lib/formStyles";
import { getLocalStorage } from "@/lib/localStorage";

const CATEGORY_CONFIG = {
  "Work_Order": {
    label: "Work Order",
    subCategories: [
      { label: "Service", value: "SER_001" },
      { label: "Composite", value: "COM_001" },
    ],
    costHeads: [{ label: "Project Work", value: "Project_Work" }],
    multiSelect: true,
  },
  "Hire_Order": {
    label: "Hire Order",
    subCategories: [{ label: "Service", value: "SER_001" }],
    costHeads: [{ label: "Project Work", value: "Project_Work" }],
    multiSelect: false,
  },
  "Job_Contract_Order": {
    label: "Job Contract Order",
    subCategories: [{ label: "Expenses", value: "EXP_001" }],
    costHeads: [{ label: "Project Work", value: "Project_Work" }],
    multiSelect: false,
  },
};

const BSS_CATEGORIES = Object.entries(CATEGORY_CONFIG).map(([value, cfg]) => ({
  label: cfg.label,
  value,
}));

export default function BSSLeftPanel({ form, disabled, mode }) {
  const [ledgerList, setLedgerList] = useState([]);
  const [billingOptions, setBillingOptions] = useState([]);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [subDropdownOpen, setSubDropdownOpen] = useState(false);
  const subDropdownRef = useRef(null);

  const { register, control, setValue, watch, formState: { errors } } = form;

  const projectInfo = getLocalStorage("projectInfo");
  const projectId = projectInfo?.projectId;
  const projectCode = projectInfo?.projectCode;

  const categoryCode = watch("categoryCode");
  const subCategory = watch("subCategory"); // array
  const costHead = watch("costHead");
  const orderId = watch("orderId");
  const orderNo = watch("orderNo");
  const vendorId = watch("vendorId");

  const categoryConfig = CATEGORY_CONFIG[categoryCode] || CATEGORY_CONFIG["Work_Order"];
  const subCategoryOptions = categoryConfig.subCategories;
  const costHeadOptions = categoryConfig.costHeads;
  const isMultiSelect = categoryConfig.multiSelect;

  // Normalise subCategory to always be array
  const selectedSubs = Array.isArray(subCategory) ? subCategory : (subCategory ? [subCategory] : []);

  const subLabel = selectedSubs.length > 0
    ? subCategoryOptions.filter((o) => selectedSubs.includes(o.value)).map((o) => o.label).join(", ")
    : "Select";

  // Close sub dropdown on outside click
  useEffect(() => {
    if (!subDropdownOpen) return;
    const handleOutside = (e) => {
      if (subDropdownRef.current && !subDropdownRef.current.contains(e.target)) {
        setSubDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [subDropdownOpen]);

  // LOAD LEDGERS
  useEffect(() => {
    const fetchLedgers = async () => {
      try {
        const res = await apiRequest({ url: API_ENDPOINTS.MASTER.GET_ALL_LEDGER, method: "GET" });
        setLedgerList(res.data || []);
      } catch {
        toast.error("Failed to load vendors");
      }
    };
    fetchLedgers();
  }, []);

  // LOAD PROJECT ADDRESSES
  useEffect(() => {
    if (!projectId) return;
    const fetchProject = async () => {
      try {
        const res = await apiRequest({
          url: `${API_ENDPOINTS.SETTINGS.GET_PROJECT_BY_ID}/${projectId}`,
          method: "GET",
        });
        const data = res.data?.[0];
        if (!data) return;
        const billing = [];
        const shipping = [];
        if (data.billingAddress) billing.push(data.billingAddress);
        if (data.shippingAddress) shipping.push(data.shippingAddress);
        if (data.shippingAddress2) shipping.push(data.shippingAddress2);
        if (data.shippingAddress3) shipping.push(data.shippingAddress3);
        setBillingOptions(billing);
        setShippingOptions(shipping);
      } catch {
        toast.error("Failed to load project details");
      }
    };
    fetchProject();
  }, [projectId]);

  // VENDOR AUTO-FILL — only fill if fields are currently empty
  useEffect(() => {
    if (!vendorId) {
      setValue("partyAddress", "");
      setValue("gstn", "");
      return;
    }
    const vendor = ledgerList.find((v) => String(v.ledgerId) === String(vendorId));
    if (!vendor) return;
    const { partyAddress, gstn } = form.getValues();
    if (!partyAddress) setValue("partyAddress", vendor.corporateAddress || "");
    if (!gstn) setValue("gstn", vendor.gstin || "");
  }, [vendorId, ledgerList, setValue, form]);

  // FETCH VENDOR ORDERS — one call per selected subCategory, merge unique by orderId
  useEffect(() => {
    if (!vendorId || !categoryCode || !selectedSubs.length || !costHead || !projectCode) return;
    const fetchOrders = async () => {
      try {
        const allOrders = [];
        const seenIds = new Set();

        await Promise.all(
          selectedSubs.map(async (sub) => {
            const res = await apiRequest({
              url: `${API_ENDPOINTS.RESOURCE.VENDOR_BILLING.BSS.GET_VENDOR_ORDERS}?vendorId=${vendorId}&projectCode=${projectCode}&receivedCategory=${categoryCode}&itemCategory=${sub}&costHead=${costHead}`,
              method: "GET",
            });
            const orders = Array.isArray(res.data) ? res.data : (res.data?.orders || res.data?.data || []);
            for (const o of orders) {
              const id = o.orderId ?? o.id;
              if (!seenIds.has(id)) {
                seenIds.add(id);
                allOrders.push(o);
              }
            }
          })
        );

        setVendorOrders(allOrders);
        if (mode === "create" && allOrders.length === 0) {
          toast.info("No orders available for the selected category and cost head");
        }
      } catch {
        toast.error("Failed to load vendor orders");
      }
    };
    fetchOrders();
  }, [vendorId, categoryCode, JSON.stringify(selectedSubs), costHead, projectCode]);

  const handleCategoryChange = (value) => {
    setValue("categoryCode", value);
    const cfg = CATEGORY_CONFIG[value];
    // multiSelect: clear so user picks; single: auto-set the only option
    setValue("subCategory", cfg?.multiSelect ? [] : [cfg?.subCategories[0]?.value || ""]);
    setValue("costHead", cfg?.costHeads?.[0]?.value || "");
    setValue("orderId", "");
    setValue("items", []);
    setVendorOrders([]);
    setSubDropdownOpen(false);
  };

  const handleSubCategoryToggle = (value, checked) => {
    const current = selectedSubs;
    const next = checked ? [...current, value] : current.filter((v) => v !== value);
    setValue("subCategory", next);
    setValue("orderId", "");
    setValue("items", []);
    setVendorOrders([]);
  };

  return (
    <div className="flex flex-col gap-y-4 w-full xl:w-[410px] shrink-0 xl:overflow-y-auto xl:max-h-[calc(100vh-110px)] pr-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-4">

      {/* CATEGORY GROUP */}
      <div className="flex flex-col gap-[2px] break-inside-avoid">
        <div className="flex items-center">
          <div className={`${labelClass} w-[180px] min-w-[180px] max-w-[180px]`}>Category</div>
          <div className="w-[220px] min-w-[220px] max-w-[220px]">
            <Controller
              control={control}
              name="categoryCode"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => { field.onChange(val); handleCategoryChange(val); }}
                  disabled={disabled}
                >
                  <SelectTrigger className={`${getInputClass(errors.categoryCode, disabled)} w-full h-[36px]`}>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BSS_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* SUB CATEGORY — multi-select dropdown for Work_Order, read-only for others */}
        <div className="flex items-center">
          <div className={`${labelClass} w-[180px] min-w-[180px] max-w-[180px]`}>Sub Category</div>
          <div className="w-[220px] min-w-[220px] max-w-[220px]">
            {isMultiSelect ? (
              <div ref={subDropdownRef} className="relative">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && setSubDropdownOpen((p) => !p)}
                  className={`${getInputClass(errors.subCategory && !selectedSubs.length, disabled)} w-full h-[36px] px-3 flex items-center justify-between text-sm`}
                >
                  <span className={`truncate ${!selectedSubs.length ? "text-gray-400" : ""}`}>
                    {subLabel}
                  </span>
                  <ChevronDown size={14} className="shrink-0 ml-1 text-gray-500" />
                </button>

                {subDropdownOpen && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                    {subCategoryOptions.map((opt) => {
                      const checked = selectedSubs.includes(opt.value);
                      return (
                        <div
                          key={opt.value}
                          onClick={() => handleSubCategoryToggle(opt.value, !checked)}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer"
                        >
                          <input type="checkbox" readOnly checked={checked} className="accent-blue-500 cursor-pointer" />
                          <span className="text-sm text-gray-700">{opt.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <Input
                value={subCategoryOptions[0]?.label || ""}
                disabled
                className={`${getInputClass(false, true)} w-full h-[36px]`}
              />
            )}
          </div>
        </div>

        {/* COST HEAD */}
        <div className="flex items-center">
          <div className={`${labelClass} w-[180px] min-w-[180px] max-w-[180px]`}>Cost Head</div>
          <div className="w-[220px] min-w-[220px] max-w-[220px]">
            <Controller
              control={control}
              name="costHead"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue("orderId", "");
                    setValue("items", []);
                    setVendorOrders([]);
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger className={`${getInputClass(errors.costHead, disabled)} w-full h-[36px]`}>
                    <SelectValue placeholder="Select Cost Head" />
                  </SelectTrigger>
                  <SelectContent>
                    {costHeadOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      {/* BSS INFO GROUP */}
      <div className="flex flex-col gap-[2px] break-inside-avoid">
        <div className="flex items-center">
          <div className={`${labelClass} w-[180px] min-w-[180px] max-w-[180px]`}>BSS No</div>
          <Input {...register("bssNo")} disabled placeholder="[Auto]" className={`${getInputClass(false, true)} w-[220px] h-[34px]`} />
        </div>
        <div className="flex items-center">
          <div className={`${labelClass} w-[180px] min-w-[180px] max-w-[180px]`}>BSS Date</div>
          <Input type="date" {...register("bssDate")} disabled={disabled} className={`${getInputClass(errors.bssDate, disabled)} w-[220px] h-[34px]`} />
        </div>
      </div>

      {/* PARTY GROUP */}
      <div className="flex flex-col gap-[2px] break-inside-avoid">
        <div className="flex items-center">
          <div className={`${labelClass} w-[180px] min-w-[180px] max-w-[180px]`}>Party Name</div>
          <div className="w-[220px]">
            <Controller
              control={control}
              name="vendorId"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue("orderId", "");
                    setValue("items", []);
                    setVendorOrders([]);
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger className={`${getInputClass(errors.vendorId, disabled)} w-full h-[36px]`}>
                    <SelectValue placeholder="Select Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {ledgerList.map((l) => (
                      <SelectItem key={l.ledgerId} value={String(l.ledgerId)}>{l.ledgerName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <div className="flex items-center">
          <div className={`${labelClass} w-[180px] min-w-[180px] max-w-[180px]`}>Party Address</div>
          <div className="w-[220px] min-w-[220px] max-w-[220px]">
            <Controller control={control} name="partyAddress" render={({ field }) => (
              <ExpandableTextField value={field.value} onChange={field.onChange} disabled title="Party Address" placeholder="[Auto]" minHeight="min-h-[36px]" modalHeight="min-h-[220px]" />
            )} />
          </div>
        </div>
        <div className="flex items-center">
          <div className={`${labelClass} w-[180px] min-w-[180px] max-w-[180px]`}>Party GSTN</div>
          <div className="w-[220px] min-w-[220px] max-w-[220px]">
            <Controller control={control} name="gstn" render={({ field }) => (
              <ExpandableTextField value={field.value} onChange={field.onChange} disabled title="Party GSTN" placeholder="[Auto]" minHeight="min-h-[36px]" modalHeight="min-h-[180px]" />
            )} />
          </div>
        </div>
      </div>

      {/* ORDER GROUP */}
      <div className="flex flex-col gap-[2px] break-inside-avoid">
        <div className="flex items-center">
          <div className={`${labelClass} w-[180px] min-w-[180px] max-w-[180px]`}>Order No</div>
          <div className="w-[220px]">
            {orderId && !vendorOrders.length ? (
              <Input
                value={orderNo || orderId}
                disabled
                className={`${getInputClass(false, true)} w-full h-[34px]`}
              />
            ) : (
              <Controller
                control={control}
                name="orderId"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("items", []);
                    }}
                    disabled={disabled || !vendorId || !categoryCode || !selectedSubs.length || !costHead}
                  >
                    <SelectTrigger className={`${getInputClass(errors.orderId, disabled)} w-full h-[36px]`}>
                      <SelectValue placeholder="Select Order" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorOrders.map((o) => {
                        const id = o.orderId ?? o.id;
                        return (
                          <SelectItem key={id} value={String(id)}>{o.orderNo}</SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </div>
        </div>
      </div>

      {/* PARTY BILL GROUP */}
      <div className="flex flex-col gap-[2px] break-inside-avoid">
        <div className="flex items-center">
          <div className={`${labelClass} w-[180px] min-w-[180px] max-w-[180px]`}>Party Bill No</div>
          <Input {...register("partyBillNo")} disabled={disabled} className={`${getInputClass(errors.partyBillNo, disabled)} w-[220px] h-[34px]`} />
        </div>
        <div className="flex items-center">
          <div className={`${labelClass} w-[180px] min-w-[180px] max-w-[180px]`}>Party Bill Date</div>
          <Input type="date" {...register("partyDate")} disabled={disabled} className={`${getInputClass(errors.partyDate, disabled)} w-[220px] h-[34px]`} />
        </div>
      </div>

      {/* SITE / ADDRESS GROUP */}
      <div className="flex flex-col gap-[2px] break-inside-avoid">
        <div className="flex items-center">
          <div className={`${labelClass} w-[180px] min-w-[180px] max-w-[180px]`}>Site</div>
          <Input value={projectCode || ""} disabled placeholder="[Auto]" className={`${getInputClass(false, true)} w-[220px] h-[34px]`} />
        </div>
        <div className="flex items-center">
          <div className={`${labelClass} w-[180px] min-w-[180px] max-w-[180px]`}>Billing Address</div>
          <div className="w-[220px]">
            <Controller control={control} name="billingAddress" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                <SelectTrigger className={`${getInputClass(errors.billingAddress, disabled)} w-full`}>
                  <SelectValue placeholder="Select Billing Address" />
                </SelectTrigger>
                <SelectContent>
                  {billingOptions.map((item, idx) => <SelectItem key={idx} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>
        </div>
        <div className="flex items-center">
          <div className={`${labelClass} w-[180px] min-w-[180px] max-w-[180px]`}>Shipping Address</div>
          <div className="w-[220px]">
            <Controller control={control} name="shippingAddress" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                <SelectTrigger className={`${getInputClass(errors.shippingAddress, disabled)} w-full`}>
                  <SelectValue placeholder="Select Shipping Address" />
                </SelectTrigger>
                <SelectContent>
                  {shippingOptions.map((item, idx) => <SelectItem key={idx} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
