import type { ShopInfo, StaffMember, WeeklySchedule } from "./types";

const adminTokenKey = "instyle_admin_token";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: options?.body ? { "Content-Type": "application/json", ...options.headers } : options?.headers,
    ...options,
  });
  if (!response.ok) {
    if (response.status === 401) {
      clearAdminToken();
    }
    throw new Error(`Request failed: ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export async function loadMassageShopData() {
  const [shop, staff, schedule] = await Promise.all([
    request<ShopInfo>("/api/shop"),
    request<StaffMember[]>("/api/staff"),
    request<WeeklySchedule>("/api/schedule"),
  ]);

  return { shop, staff, schedule };
}

export function saveShop(shop: ShopInfo) {
  return request<ShopInfo>("/api/admin/shop", { method: "PUT", body: JSON.stringify(shop), headers: adminAuthHeaders() });
}

export function saveStaffMember(staffMember: StaffMember) {
  return request<StaffMember>("/api/admin/staff", { method: "POST", body: JSON.stringify(staffMember), headers: adminAuthHeaders() });
}

export function removeStaffMember(staffId: string) {
  return request<void>(`/api/admin/staff/${staffId}`, { method: "DELETE", headers: adminAuthHeaders() });
}

export function saveSchedule(schedule: WeeklySchedule) {
  return request<WeeklySchedule>("/api/admin/schedule", { method: "PUT", body: JSON.stringify(schedule), headers: adminAuthHeaders() });
}

export async function loginAdmin(username: string, password: string) {
  const response = await request<{ token: string }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setAdminToken(response.token);
  return response.token;
}

export function getAdminToken() {
  return localStorage.getItem(adminTokenKey);
}

export function setAdminToken(token: string) {
  localStorage.setItem(adminTokenKey, token);
}

export function clearAdminToken() {
  localStorage.removeItem(adminTokenKey);
}

function adminAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
