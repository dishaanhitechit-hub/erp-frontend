"use client";

import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ExpandableTextField from "@/components/common/ExpandableTextField";
import { getInputClass, labelClass } from "@/lib/formStyles";
import { getLocalStorage } from "@/lib/localStorage";

function Row({ label, children }) {
  return (
    <div className="flex items-center">
      <div className={`${labelClass} w-[170px] min-w-[170px] max-w-[170px]`}>{label}</div>
      <div className="w-[220px] min-w-[220px] max-w-[220px]">{children}</div>
    </div>
  );
}

export default function BRRBillingLeftPanel({ form, disabled, billingType, shippingOptions = [] }) {
  const { register, control, formState: { errors } } = form;

  const projectInfo = getLocalStorage("projectInfo");
  const projectCode = projectInfo?.projectCode;

  const isGRN = billingType === "grn" || billingType === "brg";

  return (
    <div className="flex flex-col gap-y-3 w-full xl:w-[410px] shrink-0 xl:overflow-y-auto xl:max-h-[calc(100vh-110px)] pr-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-3">

        {/* Billing type badge */}
        <div className="inline-flex items-center gap-2 mb-1">
          <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${isGRN ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
            {isGRN ? "GRN Billing (BRG)" : "SRN Billing (BRS)"}
          </span>
        </div>

        {/* BRR Info — all auto-filled and disabled */}
        <div className="flex flex-col gap-[2px] break-inside-avoid">
          <Row label="BRR No">
            <Input {...register("brrNo")} disabled placeholder="[Auto]" className={`${getInputClass(false, true)} w-full h-[34px]`} />
          </Row>
          <Row label={isGRN ? "BRG No" : "BRS No"}>
            <Input {...register("billingNo")} disabled placeholder="[Auto]" className={`${getInputClass(false, true)} w-full h-[34px]`} />
          </Row>
          <Row label={isGRN ? "BRG Date" : "BRS Date"}>
            <Input type="date" {...register("billingDate")} disabled={disabled}
              className={`${getInputClass(errors.billingDate, disabled)} w-full h-[34px]`} />
          </Row>
        </div>

        {/* Party info */}
        <div className="flex flex-col gap-[2px] break-inside-avoid">
          <Row label="Party Name">
            <Input {...register("partyName")} disabled placeholder="[Auto]" className={`${getInputClass(false, true)} w-full h-[34px]`} />
          </Row>
          <Row label="Party Address">
            <Controller control={control} name="partyAddress" render={({ field }) => (
              <ExpandableTextField value={field.value} onChange={field.onChange} disabled title="Party Address" placeholder="[Auto]" minHeight="min-h-[34px]" modalHeight="min-h-[180px]" />
            )} />
          </Row>
          <Row label="Party GSTN">
            <Controller control={control} name="partyGstn" render={({ field }) => (
              <ExpandableTextField value={field.value} onChange={field.onChange} disabled title="Party GSTN" placeholder="[Auto]" minHeight="min-h-[34px]" modalHeight="min-h-[180px]" />
            )} />
          </Row>
        </div>

        {/* Order info */}
        <div className="flex flex-col gap-[2px] break-inside-avoid">
          <Row label="Order Category">
            <Input {...register("orderCategory")} disabled placeholder="[Auto]" className={`${getInputClass(false, true)} w-full h-[34px]`} />
          </Row>
          <Row label="Order No">
            <Input {...register("orderNo")} disabled placeholder="[Auto]" className={`${getInputClass(false, true)} w-full h-[34px]`} />
          </Row>
          <Row label="Order Date">
            <Input {...register("orderDate")} disabled placeholder="[Auto]" className={`${getInputClass(false, true)} w-full h-[34px]`} />
          </Row>
        </div>

        {/* Party bill */}
        <div className="flex flex-col gap-[2px] break-inside-avoid">
          <Row label="Party Bill No">
            <Input {...register("partyBillNo")} disabled placeholder="[Auto from BRR]" className={`${getInputClass(false, true)} w-full h-[34px]`} />
          </Row>
          <Row label="Party Bill Date">
            <Input {...register("partyDate")} disabled placeholder="[Auto from BRR]" className={`${getInputClass(false, true)} w-full h-[34px]`} />
          </Row>
        </div>

        {/* Site + Addresses — addresses are editable */}
        <div className="flex flex-col gap-[2px] break-inside-avoid">
          <Row label="Site">
            <Input value={projectCode || ""} disabled placeholder="[Auto]" className={`${getInputClass(false, true)} w-full h-[34px]`} />
          </Row>
          <Row label="Billing Address">
            <Controller control={control} name="billingAddress" render={({ field }) => (
              <ExpandableTextField
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
                title="Billing Address"
                placeholder="Billing Address"
                minHeight="min-h-[34px]"
                modalHeight="min-h-[180px]"
              />
            )} />
          </Row>
          <Row label="Shipping Address">
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
          </Row>
        </div>
      </div>
    </div>
  );
}
