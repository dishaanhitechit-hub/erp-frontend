"use client";

/**
 * PhoneInput — +91 prefixed Indian phone number input.
 *
 * Display: formats digits as "XXXXX XXXXX" while typing.
 * Value:   `onChange` fires with the raw value in two formats depending on `outputFormat`:
 *   - "e164"   (default) → "+91XXXXXXXXXX" or "" if empty
 *   - "digits"           → "XXXXXXXXXX"    or "" if empty
 *   - "display"          → "XXXXX XXXXX"  (the formatted string as-is)
 *
 * Props:
 *   value         — controlled display string (formatted, e.g. "98765 43210") OR e164/digits — auto-detected
 *   onChange      — (outputValue: string) => void
 *   disabled      — bool
 *   hasError      — bool   — red border/bg
 *   className     — extra classes on the wrapper div (e.g. "w-52" or "flex-1")
 *   outputFormat  — "e164" | "digits" | "display"  (default: "e164")
 *   placeholder   — string (default: "00000 00000")
 */
export default function PhoneInput({
  value = "",
  onChange,
  onBlur,
  disabled = false,
  hasError = false,
  className = "w-52",
  outputFormat = "e164",
  placeholder = "00000 00000",
}) {
  // ── helpers ──────────────────────────────────────────────────────────────
  const toDigits = (v) =>
    String(v || "").replace(/^\+91/, "").replace(/\D/g, "").slice(0, 10);

  const toDisplay = (digits) => {
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  const toOutput = (digits) => {
    if (!digits) return "";
    if (outputFormat === "e164")   return `+91${digits}`;
    if (outputFormat === "digits")  return digits;
    return toDisplay(digits);         // "display"
  };

  // ── derive display value from whatever format is passed in ───────────────
  const displayValue = toDisplay(toDigits(value));

  // ── colours (matches getInputClass from formStyles.js) ───────────────────
  const wrapperCls = hasError
    ? "border-red-500 bg-red-50"
    : disabled
    ? "border-[#7fa37f] bg-[#edf8ed]"
    : "border-[#8f8f8f] bg-white";

  const dividerCls = hasError
    ? "border-red-300 text-red-400"
    : disabled
    ? "border-[#7fa37f] text-gray-500"
    : "border-[#8f8f8f] text-gray-500";

  const inputCls = disabled
    ? "text-gray-500 cursor-default"
    : hasError
    ? "text-red-700"
    : "text-gray-800";

  // ── handler ───────────────────────────────────────────────────────────────
  // NOTE: onChange fires normalized output ONLY when the user types.
  // If the field is pre-populated via reset()/initialData and the user never
  // touches it, the RHF/state value stays in whatever format the API returned
  // (e.g. "90070 11223", "9007011223"). Always normalize in onSubmit:
  //
  //   const normalizePhone = (v) => {
  //     const digits = (v || "").replace(/\D/g, "").slice(-10);
  //     return digits.length === 10 ? `+91${digits}` : "";
  //   };
  const handleChange = (e) => {
    const digits = toDigits(e.target.value);
    onChange?.(toOutput(digits));
  };

  return (
    <div
      className={`flex items-center h-[30px] rounded-sm border ${wrapperCls} ${className}`}
    >
      <span
        className={`px-2 text-[13px] select-none border-r shrink-0 ${dividerCls}`}
      >
        +91
      </span>
      <input
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={11}
        onBlur={onBlur}
        className={`flex-1 min-w-0 bg-transparent outline-none text-[13px] px-2 ${inputCls}`}
      />
    </div>
  );
}
