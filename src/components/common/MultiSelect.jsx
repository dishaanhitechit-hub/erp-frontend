"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    ChevronDown,
    X,
} from "lucide-react";

import { cn } from "@/lib/utils";


export default function MultiSelect({
                                        options = [],
                                        value = [],
                                        onChange,
                                        placeholder = "Select Users",
                                        className,
                                        disabled = false,
                                    }) {

    const [open, setOpen] =
        useState(false);

    const wrapperRef =
        useRef(null);


    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setOpen(false);
            }

        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    const handleToggle = (userId) => {

        const exists =
            value.includes(userId);

        const updated = exists
            ? value.filter((id) => id !== userId)
            : [...value, userId];

        onChange?.(updated);

    };


    const handleRemove = (userId, e) => {

        e.stopPropagation();

        onChange?.(
            value.filter((id) => id !== userId)
        );

    };


    const selectedUsers =
        options.filter((option) =>
            value.includes(Number(option.value))
        );


    return (

        <div
            ref={wrapperRef}
            className={cn(
                "relative w-full",
                className
            )}
        >

            <button
                type="button"
                disabled={disabled}
                onClick={() =>
                    setOpen((prev) => !prev)
                }
                className="
                min-h-11
                w-full
                rounded-2xl
                border-2
                border-gray-200
                bg-white
                px-3
                py-2
                text-sm
                shadow-sm
                flex
                items-center
                justify-between
                gap-2
                text-left
                hover:border-sky-300
                hover:shadow-md
                focus:border-sky-400
                focus:ring-2
                focus:ring-sky-100
                outline-none
                transition-all
                duration-200

                disabled:cursor-not-allowed
                disabled:opacity-50
                "
            >

                <div
                    className="
                    flex
                    flex-wrap
                    gap-1.5
                    "
                >

                    {
                        selectedUsers.length > 0

                            ? selectedUsers.map((user) => (

                                <span
                                    key={user.value}
                                    className="
                                    bg-gradient-to-r
                                    from-blue-50
                                    to-sky-100
                                    text-sky-800
                                    border
                                    border-sky-200
                                    px-3
                                    py-1.5
                                    rounded-full
                                    text-[13px]
                                    font-medium
                                    flex
                                    items-center
                                    gap-1.5
                                    shadow-sm
                                    hover:shadow-md
                                    transition-all
                                    duration-200
                                    "
                                >

                                    {user.label}

                                    <X
                                        className="
                                        size-3.5
                                        cursor-pointer
                                        hover:text-red-500
                                        transition-colors
                                        "
                                        onClick={(e) =>
                                            handleRemove(
                                                Number(user.value),
                                                e
                                            )
                                        }
                                    />

                                </span>

                            ))

                            : (

                                <span className="text-muted-foreground">

                                    {placeholder}

                                </span>

                            )
                    }

                </div>

                <ChevronDown
                    className={cn(
                        `
                        size-4
                        shrink-0
                        text-sky-600
                        transition-transform
                        duration-200
                        `,
                        open && "rotate-180"
                    )}
                />

            </button>


            {
                open && (

                    <div
                        className="
                        absolute
                        z-50
                        mt-2
                        w-full
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        shadow-2xl
                        max-h-72
                        overflow-y-auto
                        p-2
                        animate-in
                        fade-in-0
                        zoom-in-95
                        duration-200
                        "
                    >

                        {
                            options.length > 0

                                ? options.map((option) => {

                                    const checked =
                                        value.includes(
                                            Number(option.value)
                                        );

                                    return (

                                        <label
                                            key={option.value}
                                            className="
                                            flex
                                            items-center
                                            gap-3
                                            px-3
                                            py-2.5
                                            rounded-xl
                                            cursor-pointer
                                            hover:bg-sky-50
                                            transition-all
                                            duration-150
                                            group
                                            "
                                        >

                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    handleToggle(
                                                        Number(option.value)
                                                    )
                                                }
                                                className="
                                                h-4
                                                w-4
                                                rounded
                                                border-gray-300
                                                text-sky-600
                                                focus:ring-sky-500
                                                "
                                            />

                                            <span
                                                className="
                                                text-sm
                                                font-medium
                                                text-gray-700
                                                group-hover:text-sky-700
                                                "
                                            >
                                                {option.label}
                                            </span>

                                        </label>

                                    );

                                })

                                : (

                                    <div
                                        className="
                                        px-3
                                        py-3
                                        text-sm
                                        text-gray-500
                                        text-center
                                        "
                                    >

                                        No Options

                                    </div>

                                )
                        }

                    </div>

                )
            }

        </div>

    );

}

// ==========================================
// Example Use - MultiSelect
// ==========================================

// const [selectedUsers, setSelectedUsers] =
//     useState([1, 3]);

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

// <MultiSelect
//
//     placeholder="Select Users"
//
//     options={userOptions}
//
//     value={selectedUsers}
//
//     onChange={setSelectedUsers}
//
// />