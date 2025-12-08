import type { User, UserRole } from "../types/User";

const BASE_URL = "http://localhost:8000/api/users/";

// ----------------------------
// SAFE TOKEN HEADER BUILDER
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

function buildHeaders(contentType = false): Record<string, string> {
  const headers: Record<string, string> = {};

  if (contentType) {
    headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("access_token"); // FIX HERE
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}


// ----------------------------
// GET ALL USERS (ADMIN)
// ----------------------------
export async function getUsers(): Promise<User[]> {
  const res = await fetch(BASE_URL, {
    headers: buildHeaders(true),
  });

  const data = await res.json();
  console.log("GET /users response:", res.status, data); // debug

  // If the request itself failed (401, 403, 500, etc.)
  if (!res.ok) {
    throw new Error(`Failed to load users, status ${res.status}`);
  }

  // DRF WITHOUT pagination -> plain array
  if (Array.isArray(data)) {
    return data.map(mapUser);
  }

  // DRF WITH pagination -> { count, next, previous, results: [...] }
  if (Array.isArray((data as any).results)) {
    return (data as any).results.map(mapUser);
  }

  // Anything else is unexpected -> avoid .filter crash
  console.error("Unexpected /users/ payload shape:", data);
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
  return res.json();
}

// ----------------------------
// CREATE USER (ADMIN)
export async function createUser(data: any): Promise<User> {
  const payload = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    registered_payment_method: data.registered_payment_method || "",
    role: data.role,
    password: data.password,   // <--- IMPORTANT
  };

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}


// ----------------------------
// UPDATE USER (ADMIN)
// ----------------------------
export async function updateUser(id: number, data: any): Promise<User> {
  const payload = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    registered_payment_method: data.registered_payment_method || "",
    role: data.role,
  };

  const res = await fetch(`${BASE_URL}${id}/`, {
    method: "PUT",
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

// ----------------------------
// DELETE USER (ADMIN)
// ----------------------------
export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}${id}/`, {
    method: "DELETE",
    headers: buildHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete user");
}

// ----------------------------
// UPDATE PROFILE (GUEST)
// ----------------------------
export async function updateProfile(id: number, data: any): Promise<User> {
  const payload = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    registered_payment_method: data.registered_payment_method || "",
  };

  const res = await fetch(`${BASE_URL}${id}/update-profile/`, {
    method: "PUT",
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

// ----------------------------
// CHANGE PASSWORD (GUEST)
// ----------------------------
export async function updatePassword(
  id: number,
  oldPassword: string,
  newPassword: string
): Promise<{ detail: string }> {
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
// ROLES AVAILABLE
// ----------------------------
export const allRoles: UserRole[] = ["ADMIN", "GUEST", "WORKER"];
