// SET LOCAL STORAGE
export const setLocalStorage = (key, value) => {
  if (typeof window === "undefined") return;

  const formattedValue =
    typeof value === "string"
      ? value
      : JSON.stringify(value);

  localStorage.setItem(key, formattedValue);
};

// GET LOCAL STORAGE
export const getLocalStorage = (key) => {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(key);

  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

// DELETE LOCAL STORAGE
export const deleteLocalStorage = (key) => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(key);
};

// CLEAR ALL LOCAL STORAGE
export const clearLocalStorage = () => {
  if (typeof window === "undefined") return;

  localStorage.clear();
};
