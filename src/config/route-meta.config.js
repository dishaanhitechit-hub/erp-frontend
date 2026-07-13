export const routeMetaConfig = [
  //dashboard
  {
    basePath: "/dashboard",
    breadcrumbs: ["Dashboard"],
  },
  //settings
  {
    basePath: "/settings/company-details",
    breadcrumbs: ["Settings", "Company Details"],
  },
  {
    basePath: "/settings/user-id-password",
    breadcrumbs: ["Settings", "User ID & Password List"],
  },
  {
    basePath: "/settings/user-id-password/new",
    breadcrumbs: ["Settings", "User ID & Password","New"],
  },
  {
    basePath: "/settings/user-id-password/[id]",
    breadcrumbs: ["Settings", "User ID & Password","Edit"],
  },
  {
    basePath: "/settings/project-code",
    breadcrumbs: ["Settings", "Project Code List"],
  },
  {
    basePath: "/settings/project-code/new",
    breadcrumbs: ["Settings", "Project Code", "New"],
  },
  {
    basePath: "/settings/project-code/[id]",
    breadcrumbs: ["Settings", "Project Details","Edit"],
  },
  {
    basePath: "/settings/role-designation",
    breadcrumbs: ["Settings", "Role & Designation"],
  },
  {
    basePath: "/settings/approval-path",
    breadcrumbs: ["Settings", "Approval Path Line"],
  },
  //master
  {
    basePath: "/master/ledger-code",
    breadcrumbs: ["Master", "Ledger Code List"],
  },
  {
    basePath: "/master/ledger-code/new",
    breadcrumbs: ["Master", "Ledger Code", "New"],
  },
  {
    basePath: "/master/ledger-code/[id]",
    breadcrumbs: ["Master", "Ledger Code", "Edit"],
  },
  {
    basePath: "/master/terms-condition",
    breadcrumbs: ["Master", "Terms & Condition"],
  },
  //cc code
  {
    basePath: "/master/cc-code",
    breadcrumbs: ["Master", "CC Code List" ],
  },
  {
    basePath: "/master/cc-code/new",
    breadcrumbs: ["Master", "CC Code", "New"],
  },
  {
    basePath: "/master/cc-code/[id]",
    breadcrumbs: ["Master", "CC Code", "Edit"],
  },
  //item
  {
    basePath: "/master/item-code",
    breadcrumbs: ["Master", "Item Code List" ],
  },
  {
    basePath: "/master/item-code/new",
    breadcrumbs: ["Master", "Item Code", "New"],
  },
  {
    basePath: "/master/item-code/[id]",
    breadcrumbs: ["Master", "Item Code", "Edit"],
  },
  //asset
  {
    basePath: "/master/asset-code",
    breadcrumbs: ["Master", "Asset Code List" ],
  },
  {
    basePath: "/master/asset-code/new",
    breadcrumbs: ["Master", "Asset Code", "New"],
  },
  {
    basePath: "/master/asset-code/[id]",
    breadcrumbs: ["Master", "Asset Code", "Edit"],
  },
  //group and category
  {
    basePath: "/master/category-group",
    breadcrumbs: ["Master", "Category & Group"],
  },
  //unit
  {
    basePath: "/master/unit",
    breadcrumbs: ["Master", "Unit List" ],
  },
  {
    basePath: "/master/unit/new",
    breadcrumbs: ["Master", "Unit", "New"],
  },
  {
    basePath: "/master/unit/[id]",
    breadcrumbs: ["Master", "Unit", "Edit"],
  },
  //bank & cash
  {
    basePath: "/master/bank-cash",
    breadcrumbs: ["Master", "Bank & Cash ID" ],
  },
  {
    basePath: "/master/bank-cash/new",
    breadcrumbs: ["Master", "Bank & Cash ID", "New"],
  },
  {
    basePath: "/master/bank-cash/[id]",
    breadcrumbs: ["Master", "Bank & Cash ID", "Edit"],
  },
  //resource-management/procurement
  //indent
  {
    basePath: "/resource-management/procurement/indent",
    breadcrumbs: ["Resources Management", "Procurement","Indent List"],
  },
  {
    basePath: "/resource-management/procurement/indent/new",
    breadcrumbs: ["Resources Management", "Procurement","Indent","New"],
  },
  {
    basePath: "/resource-management/procurement/indent/[id]",
    breadcrumbs: ["Resources Management", "Procurement","Indent","Edit"],
  },
  ///resource-management/procurement/order/material-order/new
  //material-order
  {
    basePath: "/resource-management/procurement/order/material-order",
    breadcrumbs: ["Resources Management", "Procurement","Order","Material Order","Material Order List"],
  },
  {
    basePath: "/resource-management/procurement/order/material-order/new",
    breadcrumbs: ["Resources Management", "Procurement","Order","Material Order","New"],
  },
  {
    basePath: "/resource-management/procurement/order/material-order/[id]",
    breadcrumbs: ["Resources Management", "Procurement","Order","Material Order","Edit"],
  },
  //service-order
  {
    basePath: "/resource-management/procurement/order/service-order",
    breadcrumbs: ["Resources Management", "Procurement","Order","Service Order","Service Order List"],
  },
  {
    basePath: "/resource-management/procurement/order/service-order/new",
    breadcrumbs: ["Resources Management", "Procurement","Order","Service Order","New"],
  },
  {
    basePath: "/resource-management/procurement/order/service-order/[id]",
    breadcrumbs: ["Resources Management", "Procurement","Order","Service Order","Edit"],
  },
  //Material management
  //grn
  {
    basePath: "/resource-management/material/grn",
    breadcrumbs: ["Resources Management", "Materials","Goods Received Note (GRN)","List"],
  },
  {
    basePath: "/resource-management/material/grn/new",
    breadcrumbs: ["Resources Management", "Materials","Goods Received Note (GRN)","New"],
  },
  {
    basePath: "/resource-management/material/grn/[id]",
    breadcrumbs: ["Resources Management", "Materials","Goods Received Note (GRN)","Edit"],
  },
  //srn
  {
    basePath: "/resource-management/services/srn",
    breadcrumbs: ["Resources Management", "Services","Service Received Note (SRN)","List"],
  },
  {
    basePath: "/resource-management/services/srn/new",
    breadcrumbs: ["Resources Management", "Services","Service Received Note (SRN)","New"],
  },
  {
    basePath: "/resource-management/services/srn/[id]",
    breadcrumbs: ["Resources Management", "Services","Service Received Note (SRN)","Edit"],
  },
  //gin
  {
    basePath: "/resource-management/material/gin",
    breadcrumbs: ["Resources Management", "Materials","Goods Issue Note","List"],
  },
  {
    basePath: "/resource-management/material/gin/new",
    breadcrumbs: ["Resources Management", "Materials","Goods Issue Note","New"],
  },
  {
    basePath: "/resource-management/material/gin/[id]",
    breadcrumbs: ["Resources Management", "Materials","Goods Issue Note","Edit"],
  },
  
  //machinery/log-sheet
  {
    basePath: "/resource-management/services/plant-machinery/log-sheet",
    breadcrumbs: ["Resource Management", "Services","Plant Machinery" ,"Log Sheet"],
  },
  {
    basePath: "/resource-management/services/plant-machinery/log-sheet/log-book/new",
    breadcrumbs: ["Resource Management", "Services","Plant Machinery" ,"Machine Log Book","Add"],
  },
  {
    basePath: "/resource-management/services/plant-machinery/log-sheet/log-book/[id]",
    breadcrumbs: ["Resource Management", "Services","Plant Machinery" ,"Machine Log Book","Edit"],
  },
  {
    basePath: "/resource-management/services/plant-machinery/log-sheet/log-entry/new",
    breadcrumbs: ["Resource Management", "Services","Plant Machinery" ,"Log Book Entry","Add"],
  },
  {
    basePath: "/resource-management/services/plant-machinery/log-sheet/log-entry/[id]",
    breadcrumbs: ["Resource Management", "Services","Plant Machinery" ,"Log Book Entry","Edit"],
  },

  //billing by grn
  {
    basePath: "/resource-management/sub-contractor-billing/grn",
    breadcrumbs: ["Resources Management", "Sub Contractor Billing","By GRN","List"],
  },
  {
    basePath: "/resource-management/sub-contractor-billing/grn/new",
    breadcrumbs: ["Resources Management", "Sub Contractor Billing","By GRN","New"],
  },
  {
    basePath: "/resource-management/sub-contractor-billing/grn/[id]",
    breadcrumbs: ["Resources Management", "Sub Contractor Billing","By GRN","Edit"],
  },
  //billing by srn
  {
    basePath: "/resource-management/sub-contractor-billing/srn",
    breadcrumbs: ["Resources Management", "Sub Contractor Billing","By SRN","List"],
  },
  {
    basePath: "/resource-management/sub-contractor-billing/srn/new",
    breadcrumbs: ["Resources Management", "Sub Contractor Billing","By SRN","New"],
  },
  {
    basePath: "/resource-management/sub-contractor-billing/srn/[id]",
    breadcrumbs: ["Resources Management", "Sub Contractor Billing","By SRN","Edit"],
  },
  //stock report
  {
    basePath: "/resource-management/material/stock-report",
    breadcrumbs: ["Resources Management", "Materials", "Inventory"],
  },
  //logistics/delivery-challan
  {
    basePath: "/logistics/delivery-challan",
    breadcrumbs: ["Logistics","Delivery Challan","List"],
  },
  {
    basePath: "/logistics/delivery-challan/new",
    breadcrumbs: ["Logistics","Delivery Challan","New"],
  },
  {
    basePath: "/logistics/delivery-challan/[id]",
    breadcrumbs: ["Logistics","Delivery Challan","Edit"],
  },
  //project management
  {
    basePath: "/project-management/register/concrete",
    breadcrumbs: ["Project Management", "Register","Concrete Register","List"],
  },
  {
    basePath: "/project-management/register/concrete/new",
    breadcrumbs: ["Project Management", "Register","Concrete Register","New"],
  },
  {
    basePath: "/project-management/register/concrete/[id]",
    breadcrumbs: ["Project Management", "Register","Concrete Register","Edit"],
  },
  
];