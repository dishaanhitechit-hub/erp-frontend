// Add new modules here — sub-modules are linked to module value
export const TERMS_MODULES = [
  { label: "Order",    value: "Order" },
  { label: "Enquiry",  value: "Enquiry" },
  { label: "Despatch", value: "Despatch" },
  { label: "Delivery", value: "Delivery" },
  { label: "Rent",     value: "Rent" },
];

// Sub-modules keyed by module value
export const TERMS_SUB_MODULES = {
  Order: [
    { label: "Purchases Order",       value: "Purchases_Order" },
    // { label: "Service Order",        value: "Service_Order" },
    { label: "Work Order",           value: "Work_Order" },
    { label: "Customer Supply Order",value: "Customer_Supply_Order" },
    { label: "Site Transfer Order",  value: "Site_Transfer_Order" },
    { label: "Hire Order",           value: "Hire_Order" },
    { label: "Job Contract Order",   value: "Job_Contract_Order" },
  ],
  Enquiry: [
    { label: "Material Enquiry", value: "Material_Enquiry" },
    { label: "Service Enquiry",  value: "Service_Enquiry" },
  ],
  Despatch: [
    { label: "Delivery Challan", value: "Delivery_Challan" },
  ],
  Delivery: [
    { label: "General Delivery", value: "General_Delivery" },
  ],
  Rent: [
    { label: "Machinery Rent", value: "Machinery_Rent" },
    { label: "Equipment Rent", value: "Equipment_Rent" },
  ],
};

// Terms type options
export const TERMS_TYPES = [
  { label: "General Terms",  value: "General_Terms" },
  { label: "Special Terms",  value: "Special_Terms" },
];

// Sub-point list style options
export const POINT_STYLES = [
  { label: "Bullet (•)",       value: "bullet" },
  { label: "Numbered (1, 2…)", value: "numbered" },
  { label: "Alphabetical (a, b…)", value: "alpha" },
  { label: "Roman (i, ii…)",   value: "roman" },
];

