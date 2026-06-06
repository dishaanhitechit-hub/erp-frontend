"use client";

import { useState } from "react";

import {
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";

import ExpandableTextField from "@/components/common/ExpandableTextField";

import TermsSelectionModal from "../modals/TermsSelectionModal";

export default function OrderTermsTab({

  form,

  disabled,
  openTermsModal,

  setOpenTermsModal,
}) {


  const terms =
    form.watch(
      "terms",
    ) || [];

  const handleDelete =
    (
      index,
    ) => {

      const updated =
        [...terms];

      updated.splice(
        index,
        1,
      );

      form.setValue(
        "terms",
        updated,
      );
    };

  return (

    <div
      className="
        bg-white
        w-full
      "
    >

      {/* TABLE SECTION */}

      <div
        className="
          border
          border-gray-300
        "
      >

        {/* TITLE */}

        <div
          className="
            w-full

            bg-[#F5EFCF]

            border-b
            border-gray-300

            px-4
            py-1.5
          "
        >

          <h2
            className="
              text-[15px]
              font-semibold
              text-black
            "
          >

            Terms & Condition

          </h2>

        </div>

        {/* TABLE */}

        <div
          className="
            overflow-auto

            max-h-[680px]
          "
        >

          <table
            className="
              w-full
              border-collapse
            "
          >

            <thead
              className="
                sticky
                top-0
                z-10
              "
            >

              <tr
                className="
                  bg-[#D3D3D3]
                "
              >

                <th className="border px-2 py-1 text-sm min-w-[70px]">
                  Sl No.
                </th>

                <th className="border px-2 py-1 text-sm min-w-[180px]">
                  Header
                </th>

                <th className="border px-2 py-1 text-sm min-w-[180px]">
                  Sub Header
                </th>

                <th className="border px-2 py-1 text-sm min-w-[450px]">
                  Description
                </th>

                {!disabled && (

                  <th className="border px-2 py-1 text-sm min-w-[120px]">
                    Action
                  </th>
                )}

              </tr>

            </thead>

            <tbody>

              {/* EMPTY */}

              {!terms.length && (

                <tr>

                  <td
                    colSpan={
                      disabled
                        ? 4
                        : 5
                    }

                    className="
                      h-[120px]

                      text-center

                      text-sm
                      text-gray-500
                    "
                  >

                    No Terms Added

                  </td>

                </tr>
              )}

              {/* ROWS */}

              {terms.map(
                (
                  term,
                  index,
                ) => (

                  <tr
                    key={
                      term.termId
                    }
                  >

                    {/* SL NO */}

                    <td className="border px-2 py-[2px] text-sm text-center">

                      {index + 1}

                    </td>

                    {/* HEADER */}

                    <td className="border px-2 py-[2px] text-sm">

                      {term.header}

                    </td>

                    {/* SUB HEADER */}

                    <td className="border px-2 py-[2px] text-sm">

                      {term.subHeader}

                    </td>

                    {/* DESCRIPTION */}

                    <td className="border px-2 py-[2px] align-top">

                      <ExpandableTextField

                        value={
                          term.description
                        }

                        disabled

                        title="Term Description"

                        placeholder="No Description"

                        minHeight="min-h-[32px]"

                        modalHeight="min-h-[220px]"
                      />

                    </td>

                    {/* ACTION */}

                    {!disabled && (

                      <td className="border px-2 py-[2px]">

                        <div
                          className="
                            flex
                            items-center
                            justify-center

                            gap-3
                          "
                        >

                          {/* EDIT */}

                          <button

                            type="button"

                            onClick={() =>
                              setOpenTermsModal(
                                true,
                              )
                            }

                            className="
                              text-blue-600

                              hover:text-blue-800

                              transition
                            "
                          >

                            <Pencil
                              className="
                                w-4
                                h-4
                              "
                            />

                          </button>

                          {/* DELETE */}

                          <button

                            type="button"

                            onClick={() =>
                              handleDelete(
                                index,
                              )
                            }

                            className="
                              text-red-500

                              hover:text-red-700

                              transition
                            "
                          >

                            <Trash2
                              className="
                                w-4
                                h-4
                              "
                            />

                          </button>

                        </div>

                      </td>
                    )}

                  </tr>
                ),
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL */}

      <TermsSelectionModal

        open={
          openTermsModal
        }

        onClose={() =>
          setOpenTermsModal(
            false,
          )
        }

        form={form}

        disabled={
          disabled
        }
      />

    </div>
  );
}