export const getInputClass = (
  hasError = false,
  disabled = false
) =>
  `h-[30px] text-sm rounded-sm border
   disabled:opacity-100
   disabled:text-black
   disabled:cursor-default
   placeholder:text-sm placeholder:font-normal
   ${
     hasError
       ? "has-error border-red-500 bg-red-50 focus-visible:ring-red-500"
       : disabled
       ? "border-[#7fa37f] bg-[#edf8ed] disabled:bg-[#edf8ed] disabled:text-gray-500"
       : "border-[#8f8f8f] bg-white"
   }`;


export const labelClass =
  "w-[250px] px-3 py-1 bg-[#d6e6f2] border border-[#6f7f8f] text-md rounded-sm";
  

export const activeLabelClass =
  "w-[250px] px-3 py-1 bg-[#6fd1e3] border border-[#2f8fa3] text-md rounded-sm";