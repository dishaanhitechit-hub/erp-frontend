/**
 * publicRequest — unauthenticated API client for print/PDF pages.
 * No auth token is attached. Use this only for public UUID-based endpoints.
 */

import API_BASE_URL from "@/config/api.config";

const BASE_URL = API_BASE_URL;

export async function publicRequest({ url, method = "GET", data } = {}) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${BASE_URL}${url}`, options);
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(json.msg || json.message || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json;
}
