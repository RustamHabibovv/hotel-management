import type { User, UserRole } from "../types/User";

const BASE_URL = "http://localhost:8000/api/users/";

// ----------------------------
// MAP RAW API USER → FRONTEND USER OBJECT
// ----------------------------
function mapUser(raw: any): User {
  return {
    id: raw.id,
    firstName: raw.firstName ?? raw.name ?? "",
    lastName: raw.lastName ?? raw.surname ?? "",
    email: raw.email ?? raw.email_address ?? "",
    registered_payment_method: raw.registered_payment_method ?? "",
    role: raw.role ?? "GUEST",
  };
}

// ----------------------------
// TOKEN HEADER
// ----------------------------
function buildHeaders(contentType = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (contentType) headers["Content-Type"] = "application/json";

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("access");

  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// ----------------------------
// GET USERS (no pagination backend → returns array)
// ----------------------------
export async function getUsers(): Promise<User[]> {
  const res = await fetch(BASE_URL, {
    headers: buildHeaders(true),
  });

  if (!res.ok) throw new Error("Failed to load users");

  const data = await res.json();

  if (Array.isArray(data)) return data.map(mapUser);
  if (Array.isArray(data.results)) return data.results.map(mapUser);

  return [];
}

// ----------------------------
// GET USER BY ID
// ----------------------------
export async function getUser(id: number): Promise<User> {
  const res = await fetch(`${BASE_URL}${id}/`, {
    headers: buildHeaders(true),
  });

  if (!res.ok) throw new Error("Failed to load user");

  return mapUser(await res.json());
}

// ----------------------------
// CREATE USER (ADMIN)
// ----------------------------
export async function createUser(data: any): Promise<User> {
  const payload = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    registered_payment_method: data.registered_payment_method || "",
    role: data.role,
    password: data.password,
  };

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error(json);
    throw new Error("Failed to create user");
  }

  return mapUser(json);
}

// ----------------------------
// UPDATE USER
// ----------------------------
export async function updateUser(id: number, data: any): Promise<User> {
  const payload = {
    name: data.firstName,
    surname: data.lastName,
    email_address: data.email,
    registered_payment_method: data.registered_payment_method || "",
    role: data.role,
  };

  const res = await fetch(`${BASE_URL}${id}/`, {
    method: "PUT",
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to update user");
  return mapUser(await res.json());
}

// ----------------------------
// DELETE USER
// ----------------------------
export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}${id}/`, {
    method: "DELETE",
    headers: buildHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete user");
}

// ----------------------------
// UPDATE PROFILE
// ----------------------------
export async function updateProfile(id: number, data: any): Promise<User> {
  const payload = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    registered_payment_method: data.registered_payment_method,
  };


  const res = await fetch(`${BASE_URL}${id}/update-profile/`, {
    method: "PUT",
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to update profile");
  return mapUser(await res.json());
}

// ----------------------------
// CHANGE PASSWORD
// ----------------------------
export async function updatePassword(
  id: number,
  oldPassword: string,
  newPassword: string
) {
  const payload = {
    old_password: oldPassword,
    new_password: newPassword,
  };

  const res = await fetch(`${BASE_URL}${id}/change-password/`, {
    method: "PUT",
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to change password");
  return res.json();
}

// ----------------------------
// ROLES
// ----------------------------
export const allRoles: UserRole[] = ["ADMIN", "GUEST", "WORKER"];
