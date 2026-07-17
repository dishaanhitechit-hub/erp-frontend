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
    { label: "Purchase Order",       value: "Purchase_Order" },
    { label: "Service Order",        value: "Service_Order" },
    { label: "Work Order",           value: "Work_Order" },
    { label: "Customer Supply Order",value: "Customer_Supply_Order" },
    { label: "Site Transfer Order",  value: "Site_Transfer_Order" },
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

// Dummy fallback data — REMOVE after backend APIs are ready
export const DUMMY_TERMS = [
  {
    termId: 1,
    module: "Order",
    subModule: "Purchase_Order",
    termType: "General_Terms",
    termGroups: [
      {
        groupId: "g1",
        title: "Contract Documents",
        description: "The following documents shall form an integral part of the contract:",
        pointStyle: "numbered",
        points: [
          { pointId: "p1", text: "Work Order" },
          { pointId: "p2", text: "Bill of Quantities (BOQ)" },
          { pointId: "p3", text: "Technical Specifications" },
          { pointId: "p4", text: "Approved Drawings" },
          { pointId: "p5", text: "Site Instructions" },
        ],
      },
      {
        groupId: "g2",
        title: "Payment Terms",
        description: "Payments shall be made as per the following schedule:",
        pointStyle: "bullet",
        points: [
          { pointId: "p6", text: "30% advance on order confirmation" },
          { pointId: "p7", text: "60% on delivery of materials" },
          { pointId: "p8", text: "10% after satisfactory inspection" },
        ],
      },
    ],
  },
  {
    termId: 2,
    module: "Order",
    subModule: "Service_Order",
    termType: "Special_Terms",
    termGroups: [
      {
        groupId: "g3",
        title: "Scope of Work",
        description: "The contractor shall carry out the following works:",
        pointStyle: "alpha",
        points: [
          { pointId: "p9",  text: "Civil works as per drawings" },
          { pointId: "p10", text: "Structural steel erection" },
        ],
      },
    ],
  },
];
