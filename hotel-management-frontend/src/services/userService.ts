import type { User, UserRole } from '../types/User';

const USERS_KEY = 'hm_users';

function seedUsersIfNeeded() {
  const existing = localStorage.getItem(USERS_KEY);
  if (existing) return;

  const seed: User[] = [
    {
      id: '1',
      username: 'admin',
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@hotel.com',
      role: 'ADMIN',
      password: 'admin123',
    },
    {
      id: '2',
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'GUEST',
      password: 'john123',
    },
  ];

  localStorage.setItem(USERS_KEY, JSON.stringify(seed));
}

function getAllFromStorage(): User[] {
  seedUsersIfNeeded();
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as User[]) : [];
}

function saveAllToStorage(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function getUsers(): Promise<User[]> {
  return getAllFromStorage();
}

export async function searchUsers(query: string): Promise<User[]> {
  const users = getAllFromStorage();
  if (!query.trim()) return users;

  const q = query.toLowerCase();
  return users.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
  );
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = getAllFromStorage();
  return users.find((u) => u.id === id);
}

export async function createUser(
  data: Omit<User, 'id'>
): Promise<User> {
  const users = getAllFromStorage();
  const newUser: User = {
    ...data,
    id: (Date.now() + Math.random()).toString(),
  };
  users.push(newUser);
  saveAllToStorage(users);
  return newUser;
}

export async function updateUser(updated: User): Promise<User> {
  const users = getAllFromStorage();
  const idx = users.findIndex((u) => u.id === updated.id);
  if (idx === -1) throw new Error('User not found');
  users[idx] = updated;
  saveAllToStorage(users);
  return updated;
}

export async function deleteUser(id: string): Promise<void> {
  const users = getAllFromStorage().filter((u) => u.id !== id);
  saveAllToStorage(users);
}

export async function loginWithCredentials(
  username: string,
  password: string
): Promise<User | null> {
  const users = getAllFromStorage();
  const found = users.find(
    (u) => u.username === username && u.password === password
  );
  return found ?? null;
}

export async function updatePassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const users = getAllFromStorage();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  users[idx].password = newPassword;
  saveAllToStorage(users);
}

export const allRoles: UserRole[] = ['ADMIN', 'GUEST', 'WORKER'];
