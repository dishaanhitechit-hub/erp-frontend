"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Minus,
  Plus,
  Save,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { sidebarConfig } from "@/config/sidebar.config";
import { apiRequest } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/config/api.config";
import SearchableSelect from "@/components/common/SearchableSelect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ---------------------------------------------------------------------------
// Build flat row list from sidebarConfig — runs once at module level
// Same traversal logic as MapUserModal's renderPermissionTree
// Adds serialNo (e.g. "1", "1.2", "1.2.3") and depth for indent/colour
// ---------------------------------------------------------------------------

function buildAllRows() {
  const visibleModules = sidebarConfig.filter((m) => !m.hideInPermissions);
  const rows = [];

  const recurse = (items, depth, path, serial) => {
    items.forEach((item, idx) => {
      const currentPath = [...path, idx + 1];
      const currentSerial = [...serial, idx + 1];
      const rowId = currentPath.join("-");
      const serialNo = currentSerial.join(".");

      if (item.children?.length > 0) {
        if (item.showChildrenInPermission === false) {
          // Collapsed children → single leaf row
          const key =
            item.permissionKey ||
            item.children.find((c) => c.permissionKey)?.permissionKey;
          if (key)
            rows.push({ rowId, moduleCode: key, title: item.title, depth, isLeaf: true, serialNo });
        } else {
          // Group header (no selects)
          rows.push({ rowId, moduleCode: null, title: item.title, depth, isLeaf: false, serialNo });
          recurse(item.children, depth + 1, currentPath, currentSerial);
        }
      } else if (item.permissionKey) {
        rows.push({ rowId, moduleCode: item.permissionKey, title: item.title, depth, isLeaf: true, serialNo });
      }
    });
  };

  visibleModules.forEach((module, idx) => {
    const serialNo = String(idx + 1);
    rows.push({ rowId: serialNo, moduleCode: null, title: module.title, depth: 0, isLeaf: false, serialNo });
    recurse(module.children || [], 1, [idx + 1], [idx + 1]);
  });

  return rows;
}

const ALL_ROWS = buildAllRows();
const MODULE_ROW_MAP = Object.fromEntries(
  ALL_ROWS.filter((r) => r.isLeaf && r.moduleCode).map((r) => [r.moduleCode, r.rowId])
);

// ---------------------------------------------------------------------------
// Row style helpers
// ---------------------------------------------------------------------------

const GROUP_STYLES = {
  0: "bg-[#c8e3ef] font-bold text-[12px]",
  1: "bg-[#d7ebcd] font-semibold text-[12px]",
  2: "bg-[#f5f0d9] font-medium text-[12px]",
};

function groupStyle(depth) {
  return GROUP_STYLES[depth] ?? "bg-[#efefef] font-medium text-[12px]";
}

// ---------------------------------------------------------------------------
// Creator popover — positioned near the trigger button via getBoundingClientRect
// ---------------------------------------------------------------------------

function CreatorPopover({ users, anchorRect, onClose }) {
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  if (!anchorRect) return null;

  // Position near the button, keep within viewport
  const GAP = 6;
  const W = 260;
  let left = anchorRect.left;
  let top = anchorRect.bottom + GAP;

  // Flip left if overflows right edge
  if (left + W > window.innerWidth - 8) left = window.innerWidth - W - 8;
  // Flip up if overflows bottom
  const maxH = 240;
  if (top + maxH > window.innerHeight - 8) top = anchorRect.top - maxH - GAP;

  return (
    <div
      ref={ref}
      className="fixed z-[99999] bg-white border border-[#b5b5b5] rounded-sm shadow-xl overflow-hidden"
      style={{ top, left, width: W }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#f0f7ff] border-b border-[#c8d8ea]">
        <span className="text-[12px] font-semibold text-gray-700">Creator Users</span>
        <button
          type="button"
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center rounded-sm hover:bg-gray-200 transition text-gray-500 hover:text-gray-800"
        >
          <X size={12} />
        </button>
      </div>
      {/* List */}
      <div className="max-h-[200px] overflow-y-auto p-2 space-y-1">
        {users.length === 0 ? (
          <p className="text-[11px] text-gray-400 px-1">No users</p>
        ) : (
          users.map((u, i) => (
            <div
              key={i}
              className="px-2.5 py-1.5 bg-[#f5f9ff] border border-[#d0e4f7] rounded-sm text-[11px] text-gray-700"
            >
              {u.userName || u.loginUserName || "Unknown"}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Creator cell — inline, triggers popover
// ---------------------------------------------------------------------------

function CreatorCell({ userIds, allUsers, onShowMore }) {
  const btnRef = useRef(null);
  const users = allUsers.filter((u) => userIds.includes(Number(u.id)));
  if (users.length === 0)
    return <span className="text-gray-300 text-[11px] px-2 py-1 block">—</span>;

  const visible = users.slice(0, 2);
  const extra = users.length - 2;

  return (
    <div className="px-2 py-1 flex items-center gap-1 min-h-[30px] flex-wrap">
      <span className="text-[11px] text-gray-700 truncate max-w-[110px]">
        {visible.map((u) => u.userName || u.loginUserName || "?").join(", ")}
      </span>
      {extra > 0 && (
        <button
          ref={btnRef}
          type="button"
          onClick={() => {
            const rect = btnRef.current?.getBoundingClientRect();
            if (rect) onShowMore(users, rect);
          }}
          className="ml-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-sm hover:bg-blue-200 border border-blue-200 shrink-0 transition-colors"
        >
          +{extra}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ApproverSection({ projectCode, projectData }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [projectUsers, setProjectUsers] = useState([]);
  // `${rowId}_${levelKey}` → [userId] | `${rowId}_creator` → [userId, ...]
  const [selectedUsers, setSelectedUsers] = useState({});
  const [levels, setLevels] = useState(["Level1", "Level2"]);
  // Popover state: { users, anchorRect }
  const [creatorPopover, setCreatorPopover] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);

  // ---------------------------------------------------------------------------
  // Load all data in parallel on project change
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!projectCode) {
      setProjectUsers([]);
      setSelectedUsers({});
      setLevels(["Level1", "Level2"]);
      return;
    }

    const load = async () => {
      setLoading(true);
      setSelectedUsers({});
      const enc = encodeURIComponent(projectCode);

      try {
        const [approvalRes, creatorRes, usersRes] = await Promise.all([
          apiRequest({
            url: `${API_ENDPOINTS.SETTINGS.APPROVAL_PATH.LIST}?projectCode=${enc}`,
            method: "GET",
          }).catch(() => null),
          apiRequest({
            url: `${API_ENDPOINTS.SETTINGS.APPROVAL_PATH.EDIT_USERS}?projectCode=${enc}`,
            method: "GET",
          }).catch(() => null),
          apiRequest({
            url: `${API_ENDPOINTS.SETTINGS.APPROVAL_PATH.GET_USERS_BY_PROJECT}?projectCode=${enc}`,
            method: "GET",
          }).catch(() => null),
        ]);

        setProjectUsers(Array.isArray(usersRes?.data) ? usersRes.data : []);

        const restored = {};

        // Restore approver levels + initial creator list from approval-path list
        const approvalData = Array.isArray(approvalRes?.data)
          ? approvalRes.data[0]
          : approvalRes?.data;
        const modules = Array.isArray(approvalData?.modules) ? approvalData.modules : [];

        modules.forEach((mod) => {
          const rowId = MODULE_ROW_MAP[mod.moduleCode];
          if (!rowId) return;
          restored[`${rowId}_creator`] = (mod.creatorUsers || []).map((u) => Number(u.userId));
          (mod.approverUsers || []).forEach((u) => {
            restored[`${rowId}_Level${u.level}`] = [Number(u.userId)];
          });
        });

        // Determine max level and set levels state
        const maxLevel = modules.reduce((max, m) => {
          const mMax = Math.max(0, ...(m.approverUsers || []).map((u) => Number(u.level)));
          return Math.max(max, mMax);
        }, 2);
        setLevels(Array.from({ length: maxLevel }, (_, i) => `Level${i + 1}`));

        // Overwrite creator from edit-users (authoritative source)
        const editUsersData = creatorRes?.data || {};
        Object.entries(editUsersData).forEach(([key, users]) => {
          const [moduleCode, permission] = key.split(".");
          if (permission !== "EDIT") return;
          const rowId = MODULE_ROW_MAP[moduleCode];
          if (!rowId) return;
          restored[`${rowId}_creator`] = Array.isArray(users)
            ? users.map((u) => Number(u.id))
            : [];
        });

        setSelectedUsers(restored);
      } catch {
        toast.error("Failed to load approval data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [projectCode]);

  // ---------------------------------------------------------------------------
  // Level management
  // ---------------------------------------------------------------------------

  const addLevel = useCallback(() => {
    setLevels((prev) => [...prev, `Level${prev.length + 1}`]);
  }, []);

  const removeLevel = useCallback(() => {
    if (levels.length <= 2) {
      toast.warning("Minimum 2 levels required");
      return;
    }
    const last = levels[levels.length - 1];
    setSelectedUsers((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        if (k.endsWith(`_${last}`)) delete updated[k];
      });
      return updated;
    });
    setLevels((prev) => prev.slice(0, -1));
  }, [levels]);

  const handleLevelChange = useCallback((rowId, levelKey, value) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [`${rowId}_${levelKey}`]: value ? [Number(value)] : [],
    }));
  }, []);

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------

  const buildPayload = () => {
    const leafRows = ALL_ROWS.filter((r) => r.isLeaf && r.moduleCode);
    const modules = leafRows
      .map((row) => {
        const approverUsers = levels
          .map((lk, i) => {
            const val = selectedUsers[`${row.rowId}_${lk}`];
            const userId = Array.isArray(val) ? val[0] : val;
            return userId ? { userId: Number(userId), level: i + 1 } : null;
          })
          .filter(Boolean);

        const rawCreators = selectedUsers[`${row.rowId}_creator`] || [];
        const creatorUsers = [...new Set(rawCreators.map(Number))].map((id) => ({ userId: id }));

        return { moduleCode: row.moduleCode, creatorUsers, approverUsers };
      })
      .filter((m) => m.creatorUsers.length > 0 || m.approverUsers.length > 0);

    return { projectCode, modules };
  };

  // Opens the confirmation dialog
  const handleSaveRequest = () => {
    if (!projectCode) { toast.error("No project selected"); return; }
    const payload = buildPayload();
    if (payload.modules.length === 0) {
      toast.error("Please assign at least one approver");
      return;
    }
    setConfirmSave(true);
  };

  // Called only after user confirms
  const handleSaveConfirmed = async () => {
    setConfirmSave(false);
    const payload = buildPayload();
    let tid;
    try {
      setSaving(true);
      tid = toast.loading("Saving approval path...");
      await apiRequest({
        url: API_ENDPOINTS.SETTINGS.APPROVAL_PATH.SAVE,
        method: "POST",
        data: payload,
      });
      toast.success("Approval path saved", { id: tid });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save", { id: tid });
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Memoised user options for SearchableSelect
  // ---------------------------------------------------------------------------

  const userOptions = useMemo(
    () =>
      projectUsers.map((u) => ({
        id: String(u.id),
        userName: u.userName || u.loginUserName || "User",
      })),
    [projectUsers]
  );

  const disabled = loading || saving;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Save confirmation — shadcn AlertDialog */}
      <AlertDialog open={confirmSave} onOpenChange={setConfirmSave}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Save Approval Path</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              Are you sure you want to save the approval path for{" "}
              <span className="font-semibold text-black">
                {projectData?.projectName || projectCode}
              </span>
              ? This will overwrite the existing configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[12px] h-8">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveConfirmed}
              className="text-[12px] h-8 bg-blue-600 hover:bg-blue-700"
            >
              Yes, Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Creator popover (rendered outside the overflow container) */}
      {creatorPopover && (
        <CreatorPopover
          users={creatorPopover.users}
          anchorRect={creatorPopover.anchorRect}
          onClose={() => setCreatorPopover(null)}
        />
      )}

      <div className="mt-4 border border-[#b5b5b5] rounded-sm overflow-hidden">
        {/* ── Header: toggle + action buttons always visible ─────────────── */}
        <div className="flex items-center justify-between bg-[#d6e6f2] border-b border-[#b5b5b5] px-3 py-1.5">
          {/* Left: title + collapse */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-2 flex-1 min-w-0 text-left py-0.5 select-none"
          >
            <Users size={14} className="text-blue-700 shrink-0" />
            <span className="font-semibold text-[13px] text-gray-800 shrink-0">Approval Path</span>
            {projectData?.projectName && (
              <span className="text-[11px] text-gray-500 font-normal truncate hidden sm:inline">
                — {projectData.projectName}
              </span>
            )}
            {collapsed
              ? <ChevronDown size={13} className="text-gray-500 shrink-0 ml-1" />
              : <ChevronUp size={13} className="text-gray-500 shrink-0 ml-1" />
            }
          </button>

          {/* Right: action buttons — always visible, stopPropagation so they don't toggle */}
          <div
            className="flex items-center gap-1.5 ml-3 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={removeLevel}
              disabled={disabled || levels.length <= 2}
              title="Remove last level"
              className="flex items-center gap-0.5 px-2 py-1 text-[11px] border border-[#9ab0c0] rounded-sm bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={10} />
              <span className="hidden sm:inline">Level</span>
            </button>
            <button
              type="button"
              onClick={addLevel}
              disabled={disabled}
              title="Add level"
              className="flex items-center gap-0.5 px-2 py-1 text-[11px] border border-[#9ab0c0] rounded-sm bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Plus size={10} />
              <span className="hidden sm:inline">Level</span>
            </button>
            <button
              type="button"
              onClick={handleSaveRequest}
              disabled={disabled}
              title="Save approval path"
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 transition-colors border border-blue-700"
            >
              {saving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
              <span className="hidden sm:inline">{saving ? "Saving..." : "Save"}</span>
            </button>
          </div>
        </div>

        {/* ── Collapsed state: info bar ──────────────────────────────────── */}
        {collapsed && (
          <div className="px-3 py-1.5 text-[11px] text-gray-400 bg-[#fafafa]">
            {levels.length} level{levels.length !== 1 ? "s" : ""}
            {projectUsers.length > 0 && ` · ${projectUsers.length} users`}
            {" — click title to expand"}
          </div>
        )}

        {/* ── Expanded content ───────────────────────────────────────────── */}
        {!collapsed && (
          <div className="bg-white">
            {/* Info bar */}
            <div className="px-3 py-1 border-b border-[#ececec] bg-[#f7f7f7] text-[11px] text-gray-400">
              {levels.length} level{levels.length !== 1 ? "s" : ""}
              {projectUsers.length > 0 && ` · ${projectUsers.length} project users`}
            </div>

            {/* Table — bounded height enables in-component scroll for both axes */}
            {loading ? (
              <div className="flex items-center justify-center h-[100px] gap-2 text-[12px] text-gray-400">
                <Loader2 size={14} className="animate-spin" />
                Loading approval data...
              </div>
            ) : (
              <div
                className="overflow-auto"
                style={{ maxHeight: "calc(100vh - 340px)" }}
              >
                <table
                  className="w-full border-collapse text-[12px]"
                  style={{ minWidth: `${240 + 160 + levels.length * 155}px` }}
                >
                  {/* Sticky header */}
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#d9d9d9]">
                      <th
                        className="border border-[#b5b5b5] px-3 py-1.5 text-left font-semibold"
                        style={{ minWidth: 240 }}
                      >
                        Module / Sub Module
                      </th>
                      <th
                        className="border border-[#b5b5b5] px-2 py-1.5 text-center font-semibold"
                        style={{ minWidth: 160 }}
                      >
                        Creator
                      </th>
                      {levels.map((lk) => (
                        <th
                          key={lk}
                          className="border border-[#b5b5b5] px-2 py-1.5 text-center font-semibold"
                          style={{ minWidth: 155 }}
                        >
                          {lk}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {ALL_ROWS.map((row) => {
                      const isGroup = !row.isLeaf;
                      const gStyle = isGroup ? groupStyle(row.depth) : "";
                      // Leaf rows alternate white / very-light-gray
                      const leafBg = row.isLeaf ? "" : "";

                      return (
                        <tr key={row.rowId} className={leafBg}>
                          {/* Module / Sub Module name */}
                          <td
                            className={`border border-[#b5b5b5] py-1.5 ${
                              isGroup ? gStyle : "bg-white text-gray-800 text-[12px]"
                            }`}
                            style={{ paddingLeft: `${8 + row.depth * 14}px` }}
                          >
                            <span className="text-gray-500 mr-1 text-[10px] font-normal">
                              {row.serialNo}.
                            </span>
                            {row.title}
                          </td>

                          {/* Creator — read-only */}
                          <td
                            className={`border border-[#b5b5b5] ${
                              isGroup ? gStyle : "bg-[#f9fafb]"
                            }`}
                          >
                            {row.isLeaf && (
                              <CreatorCell
                                userIds={selectedUsers[`${row.rowId}_creator`] || []}
                                allUsers={projectUsers}
                                onShowMore={(users, anchorRect) =>
                                  setCreatorPopover({ users, anchorRect })
                                }
                              />
                            )}
                          </td>

                          {/* Level columns */}
                          {levels.map((lk) => {
                            const val = selectedUsers[`${row.rowId}_${lk}`];
                            const currentVal =
                              Array.isArray(val) && val[0] ? String(val[0]) : "";

                            return (
                              <td
                                key={lk}
                                className={`border border-[#b5b5b5] p-0 ${
                                  isGroup ? gStyle : ""
                                }`}
                              >
                                {row.isLeaf && (
                                  <SearchableSelect
                                    options={userOptions}
                                    value={currentVal}
                                    onChange={(v) => handleLevelChange(row.rowId, lk, v)}
                                    disabled={disabled}
                                    placeholder="— select —"
                                    labelKey="userName"
                                    valueKey="id"
                                    searchKeys={["userName"]}
                                    className="rounded-none"
                                  />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
