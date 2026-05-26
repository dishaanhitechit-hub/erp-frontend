"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Loader2,
  Pencil,
  Search,
} from "lucide-react";

import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";

import { Input } from "@/components/ui/input";

import ExpandableTextField from "@/components/common/ExpandableTextField";

import { apiRequest } from "@/lib/apiClient";

import { API_ENDPOINTS } from "@/config/api.config";

export default function TermsSelectionModal({

  open,

  onClose,

  form,
}) {

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [tempTerms, setTempTerms] =
    useState([]);

  const [editableRows, setEditableRows] =
    useState({});

  const existingTerms =
    form.watch(
      "terms",
    ) || [];

  // LOAD TERMS

  useEffect(() => {

    if (!open) {
      return;
    }

    const fetchTerms =
      async () => {

        try {

          setLoading(
            true,
          );

          const res =
            await apiRequest({

              url:
                `${API_ENDPOINTS.MASTER.TERM.LIST}?module=Order`,

              method:
                "GET",
            });

          const apiTerms =
            res.data || [];

          const merged =
            apiTerms.map(
              (
                item,
              ) => {

                const existing =
                  existingTerms.find(
                    (
                      term,
                    ) =>

                      String(
                        term.termId,
                      ) ===
                      String(
                        item.termId,
                      ),
                  );

                return {

                  termId:
                    item.termId,

                  header:
                    item.header,

                  subHeader:
                    item.sub_header,

                  description:
                    existing?.description ||

                    item.term_description ||

                    "",

                  selected:
                    !!existing,
                };
              },
            );

          setTempTerms(
            merged,
          );

        } catch {

          toast.error(
            "Failed to load terms",
          );

        } finally {

          setLoading(
            false,
          );
        }
      };

    fetchTerms();

  }, [
    open,
    existingTerms,
  ]);

  // SEARCH

  const filteredTerms =
    useMemo(() => {

      if (
        !search
      ) {

        return tempTerms;
      }

      return tempTerms.filter(
        (
          item,
        ) =>

          Object.values(
            item,
          ).some(
            (
              value,
            ) =>

              String(
                value,
              )

                .toLowerCase()

                .includes(
                  search.toLowerCase(),
                ),
          ),
      );

    }, [
      search,
      tempTerms,
    ]);

  // SELECT ALL

  const allSelected =

    filteredTerms.length > 0 &&

    filteredTerms.every(
      (
        item,
      ) => item.selected,
    );

  const handleSelectAll =
    (
      checked,
    ) => {

      setTempTerms(
        (
          prev,
        ) =>

          prev.map(
            (
              item,
            ) => ({

              ...item,

              selected:
                checked,
            }),
          ),
      );
    };

  // SINGLE SELECT

  const handleSelect =
    (
      termId,
      checked,
    ) => {

      setTempTerms(
        (
          prev,
        ) =>

          prev.map(
            (
              item,
            ) =>

              String(
                item.termId,
              ) ===
              String(
                termId,
              )

                ? {

                    ...item,

                    selected:
                      checked,
                  }

                : item,
          ),
      );
    };

  // DESCRIPTION CHANGE

  const handleDescriptionChange =
    (
      termId,
      value,
    ) => {

      setTempTerms(
        (
          prev,
        ) =>

          prev.map(
            (
              item,
            ) =>

              String(
                item.termId,
              ) ===
              String(
                termId,
              )

                ? {

                    ...item,

                    description:
                      value,
                  }

                : item,
          ),
      );
    };

  // TOGGLE EDIT

  const toggleEdit =
    (
      termId,
    ) => {

      setEditableRows(
        (
          prev,
        ) => ({

          ...prev,

          [termId]:
            !prev[
              termId
            ],
        }),
      );
    };

  // SUBMIT

  const handleSubmit =
    () => {

      const selected =
        tempTerms.filter(
          (
            item,
          ) => item.selected,
        );

      const formatted =
        selected.map(
          (
            item,
          ) => ({

            termId:
              item.termId,

            header:
              item.header,

            subHeader:
              item.subHeader,

            description:
              item.description,
          }),
        );

      form.setValue(
        "terms",
        formatted,
      );

      onClose?.();
    };

  return (

    <Dialog
      open={open}
      onOpenChange={(
        value,
      ) => {

        if (!value) {

          onClose?.();
        }
      }}
    >

      <DialogContent
        className="
          min-w-[95vw]
          max-w-[95vw]

          lg:min-w-[1200px]
          lg:max-w-[1200px]

          p-0
          gap-0
        "
      >

        {/* HEADER */}

        <DialogHeader
          className="
            px-5
            py-3

            border-b

            bg-slate-50
          "
        >

          <DialogTitle
            className="
              text-lg
              font-semibold
            "
          >

            Select Terms & Conditions

          </DialogTitle>

        </DialogHeader>

        {/* SEARCH */}

        <div
          className="
            px-4
            py-3

            border-b
          "
        >

          <div
            className="
              relative
              w-full
              max-w-[320px]
            "
          >

            <Search
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2

                w-4
                h-4

                text-gray-400
              "
            />

            <Input

              value={
                search
              }

              onChange={(
                e,
              ) =>
                setSearch(
                  e.target
                    .value,
                )
              }

              placeholder="Search Terms"

              className="
                pl-9
                h-9
              "
            />

          </div>

        </div>

        {/* TABLE */}

        <div
          className="
            overflow-auto

            max-h-[420px]
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

                bg-gray-100
              "
            >

              <tr>

                <th className="border px-2 py-1 min-w-[60px]">

                  <div
                    className="
                      flex
                      justify-center
                    "
                  >

                    <Checkbox

                      checked={
                        allSelected
                      }

                      onCheckedChange={
                        handleSelectAll
                      }
                    />

                  </div>

                </th>

                <th className="border px-2 py-1 text-sm min-w-[180px]">
                  Header
                </th>

                <th className="border px-2 py-1 text-sm min-w-[180px]">
                  Sub Header
                </th>

                <th className="border px-2 py-1 text-sm min-w-[380px]">
                  Description
                </th>

                <th className="border px-2 py-1 text-sm min-w-[100px]">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {loading && (

                <tr>

                  <td
                    colSpan={5}
                    className="
                      h-[180px]
                      text-center
                    "
                  >

                    <div
                      className="
                        flex
                        justify-center
                      "
                    >

                      <Loader2
                        className="
                          w-5
                          h-5
                          animate-spin
                        "
                      />

                    </div>

                  </td>

                </tr>
              )}

              {!loading &&
                !filteredTerms.length && (

                <tr>

                  <td
                    colSpan={5}
                    className="
                      h-[120px]
                      text-center
                      text-gray-500
                    "
                  >

                    No Terms Found

                  </td>

                </tr>
              )}

              {!loading &&
                filteredTerms.map(
                  (
                    item,
                  ) => (

                    <tr
                      key={
                        item.termId
                      }
                    >

                      {/* SELECT */}

                      <td className="border px-2 py-1">

                        <div
                          className="
                            flex
                            justify-center
                          "
                        >

                          <Checkbox

                            checked={
                              item.selected
                            }

                            onCheckedChange={(
                              checked,
                            ) =>
                              handleSelect(

                                item.termId,

                                checked,
                              )
                            }
                          />

                        </div>

                      </td>

                      {/* HEADER */}

                      <td className="border px-2 py-1 text-sm">

                        {item.header}

                      </td>

                      {/* SUB HEADER */}

                      <td className="border px-2 py-1 text-sm">

                        {item.subHeader}

                      </td>

                      {/* DESCRIPTION */}

                      <td className="border px-2 py-1">

                        <ExpandableTextField

                          value={
                            item.description
                          }

                          onChange={(
                            value,
                          ) =>
                            handleDescriptionChange(

                              item.termId,

                              value,
                            )
                          }

                          disabled={
                            !editableRows[
                              item.termId
                            ]
                          }

                          title="Term Description"

                          placeholder="Enter Description"

                          minHeight="min-h-[34px]"

                          modalHeight="min-h-[220px]"
                        />

                      </td>

                      {/* ACTION */}

                      <td className="border px-2 py-1">

                        <div
                          className="
                            flex
                            justify-center
                          "
                        >

                          <button

                            type="button"

                            onClick={() =>
                              toggleEdit(
                                item.termId,
                              )
                            }

                            className="
                              w-7
                              h-7

                              rounded-md

                              border

                              flex
                              items-center
                              justify-center

                              hover:bg-blue-50
                              transition
                            "
                          >

                            <Pencil
                              className="
                                w-3.5
                                h-3.5
                              "
                            />

                          </button>

                        </div>

                      </td>

                    </tr>
                  ),
                )}

            </tbody>

          </table>

        </div>

        {/* FOOTER */}

        <div
          className="
            flex
            justify-end
            gap-3

            border-t

            px-5
            py-3
          "
        >

          <Button

            type="button"

            variant="outline"

            onClick={
              onClose
            }
          >

            Cancel

          </Button>

          <Button

            type="button"

            onClick={
              handleSubmit
            }
          >

            <Check
              className="
                w-4
                h-4
                mr-1
              "
            />

            Add Selected Terms

          </Button>

        </div>

      </DialogContent>

    </Dialog>
  );
}