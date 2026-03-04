import { session } from "./session";

export const call = async (
  url: string,
  method = "GET",
  body: Record<string, unknown> | null = null,
) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = session.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || data.error || `Error ${res.status}`);
  return data;
};
