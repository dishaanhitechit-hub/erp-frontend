import { z } from "zod";

const itemSchema = z.object({
  itemCode: z.string(),
  itemName: z.string(),
  itemUnit: z.string().optional(),
  qty: z.coerce.number({ required_error: "Qty is required" }).min(0.001, "Qty must be greater than 0"),
  rate: z.coerce.number({ required_error: "Rate is required" }).min(0, "Rate must be 0 or more"),
  gstPercent: z.coerce.number({ required_error: "GST is required" }).min(0),
  amount: z.number().optional(),
  gstAmount: z.number().optional(),
  location: z.string().optional(),
  note: z.string().optional(),
});

const termSchema = z.object({
  termId: z.any(),
  header: z.string(),
  subHeader: z.string(),
  description: z.string(),
});

export const serviceOrderSchema = z
  .object({
    categoryCode: z.string({ required_error: "Category is required" }).min(1, "Category is required"),

    // multi-select array — at least one required
    subCategoryCodes: z.array(z.string()).min(1, "Select at least one sub category"),

    costHead: z.string({ required_error: "Cost Head is required" }).min(1, "Cost Head is required"),

    vendorId: z.string({ required_error: "Party Name is required" }).min(1, "Party Name is required"),
    orderDate: z.string({ required_error: "Order Date is required" }).min(1, "Order Date is required"),
    validityDate: z.string({ required_error: "Order Validity is required" }).min(1, "Order Validity is required"),
    billingAddress: z.string({ required_error: "Billing Address is required" }).min(1, "Billing Address is required"),
    shippingAddress: z.string({ required_error: "Shipping Address is required" }).min(1, "Shipping Address is required"),
    quotationNo: z.string().min(1, "Quotation No is required"),
    quotationDate: z.string().min(1, "Quotation Date is required"),
    orderMessage: z.string().optional(),
    items: z.array(itemSchema).min(1, "At least one item is required"),
    terms: z.array(termSchema).min(1, "At least one term is required"),
  });
