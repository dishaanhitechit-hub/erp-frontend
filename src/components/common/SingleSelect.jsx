"use client";

import * as React from "react";

import {
    ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils";

function SingleSelect({
                          className,
                          options = [],
                          placeholder = "Select",
                          value = [],
                          onChange,
                          disabled = false,
                          name,
                          id,
                      }) {

    return (

        <div className="relative w-full">

            <select

                id={id}

                name={name}

                value={value?.[0] || ""}

                disabled={disabled}

                onChange={(e) =>

                    onChange?.(

                        e.target.value
                            ? [Number(e.target.value)]
                            : []

                    )

                }

                className={cn(
                    `
                    h-10
                    w-full
                    appearance-none
                    rounded-md
                    border
                    border-input
                    bg-background
                    px-3
                    pr-10
                    text-sm
                    shadow-sm
                    outline-none
                    transition-all

                    focus:border-ring
                    focus:ring-2
                    focus:ring-ring/50

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    `,
                    className
                )}

            >

                <option value="">
                    {placeholder}
                </option>

                {
                    options.map((option) => (

                        <option
                            key={option.value}
                            value={option.value}
                        >

                            {option.label}

                        </option>

                    ))
                }

            </select>

            <ChevronDown
                className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                size-4
                text-gray-500
                pointer-events-none
                "
            />

        </div>

    );

}

export default SingleSelect;

// ==========================================
// Example Use - SingleSelect
// ==========================================

// const [selectedUser, setSelectedUser] =
//     useState([1]);

// const userOptions = [
//     {
//         value: 1,
//         label: "Super Admin",
//     },
//     {
//         value: 2,
//         label: "ankandas",
//     },
//     {
//         value: 3,
//         label: "Admin",
//     },
// ];

// <SingleSelect
//
//     placeholder="Select User"
//
//     options={userOptions}
//
//     value={selectedUser}
//
//     onChange={setSelectedUser}
//
// />