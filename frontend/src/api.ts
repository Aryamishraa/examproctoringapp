// In production, VITE_API_URL is empty so we use a relative path (/api/...).
// This works because Express serves both the frontend and backend on the same domain.
// In local dev, VITE_API_URL typically set to http://localhost:5000
const VITE_API_URL = import.meta.env.VITE_API_URL || "";
const API_BASE = VITE_API_URL ? `${VITE_API_URL}/api` : "/api";

console.log("Using API_BASE:", API_BASE);

export const loginUser = async (data: any): Promise<any> => {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  return { ok: response.ok, ...responseData };
};