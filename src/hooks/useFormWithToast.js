"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function useFormWithToast(options) {
  const form = useForm(options);

  const handleSubmit = (onValid, onInvalid) =>
    form.handleSubmit(onValid, (errors) => {
      const fields = Object.keys(errors).join(", ");
      toast.error(`Please fill required fields: ${fields}`);
      onInvalid?.(errors);
    });

  return { ...form, handleSubmit };
}
