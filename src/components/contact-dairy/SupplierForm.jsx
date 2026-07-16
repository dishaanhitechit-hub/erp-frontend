"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import SaveButton from "@/components/common/SaveButton";
import EditButton from "@/components/common/EditButton";
import ExpandableTextField from "@/components/common/ExpandableTextField";
import NatureOfServiceSelect, { TYPE_LABEL, TYPE_BADGE_COLOR } from "./NatureOfServiceSelect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import { getInputClass, labelClass } from "@/lib/formStyles";

// ─── Constants ──────────────────────────────────────────────────────────────

const ALL_TYPES = [
  { value: "Materials",       label: "Materials" },
  { value: "Work_Force",      label: "Work Force" },
  { value: "Plant_Machinery", label: "Plant & Machinery" },
  { value: "Others",          label: "Others" },
];

// ─── Validation schema ───────────────────────────────────────────────────────

const schema = z.object({
  supplierName:        z.string().min(1, "Supplier name is required"),
  registeredAddress:   z.string().optional(),
  corporateAddress:    z.string().optional(),
  contactPerson:       z.string().optional(),
  designation:         z.string().optional(),
  mobileNumber:        z.string().refine((v) => !v || /^\d{10}$/.test(v), "Must be 10 digits").optional(),
  whatsappNumber:      z.string().refine((v) => !v || /^\d{10}$/.test(v), "Must be 10 digits").optional(),
  email:               z.string().refine((v) => !v || z.string().email().safeParse(v).success, "Invalid email").optional(),
});

// ─── Suggestion fetch hook ───────────────────────────────────────────────────
// Debounces on the TRIMMED value (spaces don't re-trigger), skips empty/short
// queries, and skips if trimmed value hasn't changed since the last API call.

function useSuggestionFetch({ query, pageType, minLen = 3, delay = 600, onResult, onLoading }) {
  const timerRef    = useRef(null);
  const lastFetched = useRef("");  // last trimmed value actually sent to API
  const cancelRef   = useRef(false);

  useEffect(() => {
    const trimmed = query.trim();

    // Empty or too short — clear immediately, no timer needed
    if (!trimmed || trimmed.length < minLen) {
      clearTimeout(timerRef.current);
      lastFetched.current = "";
      onResult([]);
      return;
    }

    // Same trimmed value as last fetch — skip (handles space presses)
    if (trimmed === lastFetched.current) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      // Re-check after delay in case value shrank below minLen while waiting
      const q = query.trim();
      if (!q || q.length < minLen || q === lastFetched.current) return;

      lastFetched.current = q;
      cancelRef.current = false;
      onLoading(true);

      try {
        const res = await apiRequest({
          url: API_ENDPOINTS.SUPPLIER.LIST,
          method: "GET",
          // TODO: Remove supplierType param from suggestion query once backend no longer needs it
          params: { search: q, supplierType: pageType },
        });
        if (cancelRef.current) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        onResult(list.slice(0, 6));
      } catch {
        if (!cancelRef.current) onResult([]);
      } finally {
        if (!cancelRef.current) onLoading(false);
      }
    }, delay);

    return () => {
      clearTimeout(timerRef.current);
      cancelRef.current = true;
    };
  }, [query]); // eslint-disable-line
}

// ─── Suggestion item ────────────────────────────────────────────────────────

function SuggestionItem({ supplier, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors group"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-gray-800 group-hover:text-blue-700 truncate">
          {supplier.supplierName}
        </span>
        <span className="text-[10px] text-gray-400 shrink-0 font-mono">{supplier.supplierCode}</span>
      </div>
      <div className="mt-0.5 flex flex-wrap gap-1">
        {(supplier.supplierTypes || []).map((t) => (
          <span
            key={t}
            className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${TYPE_BADGE_COLOR[t] || "bg-gray-100 text-gray-600 border-gray-200"}`}
          >
            {TYPE_LABEL[t] || t}
          </span>
        ))}
      </div>
    </button>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

/**
 * pageType: "materials" | "work_force" | "plant_machinery"
 * mode: "create" | "edit" | "view"
 * supplierId: string|undefined (present in edit/view)
 * initialData: object|null
 * listPath: string (back-navigation path)
 */
export default function SupplierForm({ pageType, mode = "create", supplierId, initialData, listPath, disabled: disabledProp = false }) {
  const router = useRouter();

  // ── Editing state ──────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(mode === "create");
  const [saving, setSaving] = useState(false);

  // If this record was populated from suggestion, track the real supplierId for UPDATE
  const [resolvedId, setResolvedId] = useState(supplierId || null);
  const isUpdate = mode === "edit" || !!resolvedId;

  // ── React Hook Form ────────────────────────────────────────────────────────
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierName: "", registeredAddress: "", corporateAddress: "",
      contactPerson: "", designation: "", mobileNumber: "", whatsappNumber: "", email: "",
    },
  });

  // supplierCode is auto/read-only — keep it separate
  const [supplierCode, setSupplierCode] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [supplierTypes, setSupplierTypes] = useState([pageType]);
  const [natureOfService, setNatureOfService] = useState("");

  // ── Suggestions ────────────────────────────────────────────────────────────
  const [nameQuery, setNameQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState(null);

  const fieldDisabled = !isEditing || saving;

  // ── Populate from initialData (edit/view mode) ─────────────────────────────
  useEffect(() => {
    if (!initialData) return;
    const d = initialData;
    reset({
      supplierName:      d.supplierName      || "",
      registeredAddress: d.registeredAddress || "",
      corporateAddress:  d.corporateAddress  || "",
      contactPerson:     d.contactPerson     || "",
      designation:       d.designation       || "",
      mobileNumber:      d.mobileNumber      || "",
      whatsappNumber:    d.whatsappNumber    || "",
      email:             d.email             || "",
    });
    setSupplierCode(d.supplierCode || "");
    setNameQuery(d.supplierName || "");
    setServiceDescription(d.serviceDescription || "");
    const existingTypes = Array.isArray(d.supplierTypes) ? d.supplierTypes : [];
    setSupplierTypes(existingTypes.includes(pageType) ? existingTypes : [pageType, ...existingTypes]);
    setNatureOfService(d.natureOfService || "");
  }, [initialData]);

  // ── Suggestion fetch (debounced, deduped, empty-safe) ──────────────────────
  useSuggestionFetch({
    query: nameQuery,
    pageType,
    onResult: (list) => {
      setSuggestions(list);
      setShowSuggestions(list.length > 0);
    },
    onLoading: setSuggestLoading,
  });

  // ── Populate form from accepted suggestion ──────────────────────────────────
  const acceptSuggestion = useCallback((s) => {
    reset({
      supplierName:      s.supplierName      || "",
      registeredAddress: s.registeredAddress || "",
      corporateAddress:  s.corporateAddress  || "",
      contactPerson:     s.contactPerson     || "",
      designation:       s.designation       || "",
      mobileNumber:      s.mobileNumber      || "",
      whatsappNumber:    s.whatsappNumber    || "",
      email:             s.email             || "",
    });
    setSupplierCode(s.supplierCode || "");
    setNameQuery(s.supplierName || "");
    setServiceDescription(s.serviceDescription || "");
    const existing = Array.isArray(s.supplierTypes) ? s.supplierTypes : [];
    setSupplierTypes(existing.includes(pageType) ? existing : [pageType, ...existing]);
    setNatureOfService(s.natureOfService || "");
    setResolvedId(String(s.supplierId));
    setShowSuggestions(false);
    setSuggestions([]);
    setPendingSuggestion(null);
    setIsEditing(true);
  }, [pageType]);

  // ── Type toggle ─────────────────────────────────────────────────────────────
  const toggleType = (typeVal) => {
    if (typeVal === pageType) return; // page's own type always stays
    setSupplierTypes((prev) =>
      prev.includes(typeVal) ? prev.filter((t) => t !== typeVal) : [...prev, typeVal]
    );
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    const payload = { ...data, supplierTypes, natureOfService, serviceDescription };
    let tid;
    try {
      setSaving(true);
      tid = toast.loading(isUpdate ? "Updating supplier..." : "Creating supplier...");
      let res;
      if (isUpdate && resolvedId) {
        res = await apiRequest({ url: `${API_ENDPOINTS.SUPPLIER.UPDATE}/${resolvedId}`, method: "PUT", data: payload });
      } else {
        res = await apiRequest({ url: API_ENDPOINTS.SUPPLIER.CREATE, method: "POST", data: payload });
      }
      toast.success(isUpdate ? "Supplier updated" : "Supplier created", { id: tid });
      const saved = Array.isArray(res?.data) ? res.data[0] : res?.data;
      if (saved?.supplierId && !isUpdate) {
        setResolvedId(String(saved.supplierId));
        setSupplierCode(saved.supplierCode || "");
      }
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.message || "Save failed", { id: tid });
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Suggestion confirmation dialog */}
      <AlertDialog open={!!pendingSuggestion} onOpenChange={(o) => !o && setPendingSuggestion(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Existing Supplier Found</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              <strong>{pendingSuggestion?.supplierName}</strong>{" "}
              ({pendingSuggestion?.supplierCode}) already exists. Load their details?
              Saving will <span className="font-semibold text-orange-600">update</span> the existing record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[12px] h-8" onClick={() => { setPendingSuggestion(null); setShowSuggestions(false); }}>
              No, keep typing
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-[12px] h-8 bg-blue-600 hover:bg-blue-700"
              onClick={() => acceptSuggestion(pendingSuggestion)}
            >
              Yes, load details
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="px-6 pt-2 pb-4 w-full">
        {/* ── Supplier ID row ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <label className={labelClass}>Supplier ID</label>
          <Input
            value={supplierCode || (resolvedId ? `SUP${String(resolvedId).padStart(4, "0")}` : "")}
            disabled
            placeholder="[Auto]"
            className={`${getInputClass(false, true)} w-40 font-mono`}
          />
        </div>

        {/* ── Supplier type checkboxes ──────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-5 px-1">
          {ALL_TYPES.map((t) => {
            const checked = supplierTypes.includes(t.value);
            const isPageType = t.value === pageType;
            return (
              <label
                key={t.value}
                className={`flex items-center gap-1.5 select-none ${isPageType || fieldDisabled ? "cursor-default" : "cursor-pointer"}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isPageType || fieldDisabled}
                  onChange={() => toggleType(t.value)}
                  className="w-3.5 h-3.5 accent-blue-600"
                />
                <span className={`text-[11px] px-2 py-0.5 rounded border font-medium transition-opacity ${
                  TYPE_BADGE_COLOR[t.value] || "bg-gray-100 text-gray-600 border-gray-200"
                } ${!checked ? "opacity-40" : ""}`}>
                  {TYPE_LABEL[t.value] || t.label}
                </span>
              </label>
            );
          })}
        </div>

        {/* ── Supplier Details ──────────────────────────────────────── */}
        <Section title="Supplier Details">
          {/* Supplier Name with suggestion */}
          <div className="relative">
            <FormRow label="Supplier Name" required>
              <div className="relative flex-1">
                <Input
                  {...register("supplierName")}
                  value={nameQuery}
                  onChange={(e) => {
                    setNameQuery(e.target.value);
                    setValue("supplierName", e.target.value, { shouldValidate: true });
                    if (!e.target.value.trim()) { setSuggestions([]); setShowSuggestions(false); }
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  disabled={fieldDisabled}
                  placeholder="Supplier / Concern name"
                  className={`${getInputClass(!!errors.supplierName, fieldDisabled)} pr-8`}
                />
                {suggestLoading && (
                  <Loader2 size={12} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>
            </FormRow>

            {/* Suggestion dropdown — stays visible on focus elsewhere */}
            {showSuggestions && suggestions.length > 0 && !fieldDisabled && (
              <div className="absolute left-[calc(250px+12px)] right-0 z-[9999] bg-white border border-blue-200 rounded-sm shadow-2xl mt-0.5">
                <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 border-b border-blue-100">
                  <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-1">
                    <Search size={10} /> Existing suppliers found
                  </span>
                  <button
                    type="button"
                    onClick={() => { setShowSuggestions(false); setSuggestions([]); }}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X size={12} />
                  </button>
                </div>
                {suggestions.map((s) => (
                  <SuggestionItem
                    key={s.supplierId}
                    supplier={s}
                    onClick={() => setPendingSuggestion(s)}
                  />
                ))}
              </div>
            )}
          </div>

          <FormRow label="Registered Address">
            <Input
              {...register("registeredAddress")}
              disabled={fieldDisabled}
              placeholder="Registered address"
              className={getInputClass(false, fieldDisabled)}
            />
          </FormRow>
          <FormRow label="Corporate Address">
            <Input
              {...register("corporateAddress")}
              disabled={fieldDisabled}
              placeholder="Corporate / head office address"
              className={getInputClass(false, fieldDisabled)}
            />
          </FormRow>
        </Section>

        {/* ── Contact Details ───────────────────────────────────────── */}
        <Section title="Contact Details">
          <FormRow label="Contact Person">
            <Input
              {...register("contactPerson")}
              disabled={fieldDisabled}
              placeholder="Contact person name"
              className={getInputClass(false, fieldDisabled)}
            />
          </FormRow>
          <FormRow label="Designation">
            <Input
              {...register("designation")}
              disabled={fieldDisabled}
              placeholder="Designation"
              className={getInputClass(false, fieldDisabled)}
            />
          </FormRow>
          <FormRow label="Mobile Number">
            <Input
              {...register("mobileNumber")}
              disabled={fieldDisabled}
              placeholder="Mobile number"
              className={`${getInputClass(!!errors.mobileNumber, fieldDisabled)} w-52`}
            />
          </FormRow>
          <FormRow label="WhatsApp Number">
            <Input
              {...register("whatsappNumber")}
              disabled={fieldDisabled}
              placeholder="WhatsApp number"
              className={`${getInputClass(!!errors.whatsappNumber, fieldDisabled)} w-52`}
            />
          </FormRow>
          <FormRow label="Email ID">
            <Input
              {...register("email")}
              disabled={fieldDisabled}
              placeholder="Email address"
              className={`${getInputClass(!!errors.email, fieldDisabled)} w-72`}
            />
          </FormRow>
        </Section>

        {/* ── Products ─────────────────────────────────────────────── */}
        <Section title="Products">
          <FormRow label="Nature of Service">
            <div className="flex-1">
              <NatureOfServiceSelect
                selectedTypes={supplierTypes}
                value={natureOfService}
                onChange={setNatureOfService}
                disabled={fieldDisabled}
              />
            </div>
          </FormRow>
          <FormRow label="Service Description / List" alignStart>
            <div className="flex-1 min-h-[60px]">
              <ExpandableTextField
                value={serviceDescription}
                onChange={setServiceDescription}
                disabled={fieldDisabled}
                title="Service Description / List"
                placeholder="Describe services or paste a list..."
                minHeight="min-h-[60px]"
                modalHeight="min-h-[200px]"
              />
            </div>
          </FormRow>
        </Section>

        {/* ── Linked Ledgers (view only, shown in edit/view mode) ───── */}
        {initialData?.linkedLedgers?.length > 0 && (
          <Section title="Linked Vendors">
            <div className="flex flex-wrap gap-2 py-1 px-1">
              {initialData.linkedLedgers.map((l) => (
                <span
                  key={l.ledgerId}
                  className="text-[12px] px-2.5 py-1 bg-[#e8f0f8] border border-[#b5cde0] rounded-sm text-gray-700"
                >
                  {l.ledgerCode} — {l.ledgerName}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Action Buttons ─────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 mt-6">
          {!disabledProp && mode !== "create" && (
            <EditButton
              onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
              disabled={saving}
            >
              {isEditing ? "Cancel" : "Edit"}
            </EditButton>
          )}
          {isEditing && (
            <SaveButton onClick={handleSubmit(onSubmit)} loading={saving} disabled={false} />
          )}
        </div>
      </div>
    </>
  );
}

// ─── Small layout helpers ─────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <div className="text-[13px] font-bold text-gray-800 border-b border-[#b8c7da] pb-0.5 mb-2">
        {title}:
      </div>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function FormRow({ label, children, required, alignStart }) {
  return (
    <div className={`flex ${alignStart ? "items-start" : "items-center"} gap-3`}>
      <label className="w-[250px] shrink-0 px-3 py-1 bg-[#d6e6f2] border border-[#6f7f8f] text-[13px] rounded-sm self-start mt-0.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
