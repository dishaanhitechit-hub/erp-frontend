/**
 * Helpers shared across terms-related components:
 * TermsSelectionModal, OrderTermsTab, TermsForm
 */

/** Format underscore strings for display: "Work_Order" → "Work Order" */
export const fmtUnderscore = (str) => (str || "").replace(/_/g, " ");

/** Normalize a title for loose matching: lowercase, strip non-alphanumeric */
const normTitle = (t) => (t || "").toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Match two term groups: groupId equality first, then normalized title.
 * Handles cases where groupId changes but title stays the same.
 */
export const groupsMatch = (a, b) => {
  if (a.groupId != null && b.groupId != null && String(a.groupId) === String(b.groupId)) return true;
  return !!normTitle(a.title) && normTitle(a.title) === normTitle(b.title);
};

/** Prefix symbol/label for a point given the group's pointStyle and 0-based index */
export function pointPrefix(style, idx) {
  if (style === "bullet") return "•";
  if (style === "numbered") return `${idx + 1}.`;
  if (style === "alpha") return `${String.fromCharCode(97 + idx)}.`;
  if (style === "roman") {
    const nums = [1, 4, 5, 9, 10, 40, 50, 90, 100, 400, 500, 900, 1000];
    const syms = ["i", "iv", "v", "ix", "x", "xl", "l", "xc", "c", "cd", "d", "cm", "m"];
    let n = idx + 1, result = "";
    for (let i = nums.length - 1; i >= 0; i--) {
      while (n >= nums[i]) { result += syms[i]; n -= nums[i]; }
    }
    return `${result}.`;
  }
  return `${idx + 1}.`;
}
