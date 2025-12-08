import axios from 'axios';
import type { User, UserRole } from '../types/User';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Configure axios to include token in all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Keep mock users for fallback or development
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
      role: 'admin',
      password: 'admin123',
    },
    {
      id: '2',
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'guest',
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
  try {
    // Try to fetch from backend first
    const response = await axios.get(`${API_BASE_URL}/users/`);
    return response.data.map((u: any) => ({
      id: u.id.toString(),
      username: u.email.split('@')[0],
      firstName: u.name,
      lastName: u.surname,
      email: u.email_address,
      role: u.role || 'GUEST',
      password: '',
      worker_id: u.worker_id,
    }));
  } catch (error) {
    console.error('Failed to fetch users from backend, using localStorage:', error);
    return getAllFromStorage();
  }
}

export async function searchUsers(query: string): Promise<User[]> {
  const users = await getUsers();
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
  const users = await getUsers();
  return users.find((u) => u.id === id);
}

export async function createUser(data: Omit<User, 'id'>): Promise<User> {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register/`, {
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      role: data.role,
    });

    return {
      id: response.data.user.id.toString(),
      username: response.data.user.email.split('@')[0],
      firstName: response.data.user.name,
      lastName: response.data.user.surname,
      email: response.data.user.email,
      role: response.data.user.role,
      password: '',
      worker_id: response.data.user.worker_id,
    };
  } catch (error) {
    console.error('Failed to create user on backend, using localStorage:', error);
    const users = getAllFromStorage();
    const newUser: User = {
      ...data,
      id: (Date.now() + Math.random()).toString(),
    };
    users.push(newUser);
    saveAllToStorage(users);
    return newUser;
  }
}

export async function updateUser(updated: User): Promise<User> {
  // For now, use localStorage until you create backend endpoint
  const users = getAllFromStorage();
  const idx = users.findIndex((u) => u.id === updated.id);
  if (idx === -1) throw new Error('User not found');
  users[idx] = updated;
  saveAllToStorage(users);
  return updated;
}

export async function deleteUser(id: string): Promise<void> {
  // For now, use localStorage until you create backend endpoint
  const users = getAllFromStorage().filter((u) => u.id !== id);
  saveAllToStorage(users);
}

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<User | null> {
  try {
    // ✅ Use backend login
    const response = await axios.post(`${API_BASE_URL}/auth/custom-login/`, {
      email,
      password,
    });


    console.log('🔍 BACKEND RESPONSE:', response.data);
    console.log('🔍 BACKEND USER:', response.data.user); 
    const { access, refresh, user: backendUser } = response.data;

    // Store tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // Create User object with worker_id
    const user: User = {
      id: backendUser.id.toString(),
      username: backendUser.email.split('@')[0],
      firstName: backendUser.name,
      lastName: backendUser.surname,
      email: backendUser.email,
      role: backendUser.role,
      password: '',
      worker_id: backendUser.worker_id ?? null, //Include worker_id
    };
    console.log('🔍 CREATED USER OBJECT:', user);
    return user;
  } catch (error) {
    console.error('Backend login failed, trying localStorage:', error);
    
    // Fallback to localStorage
    const users = getAllFromStorage();
    const found = users.find(
      (u) => (u.username === email || u.email === email) && u.password === password
    );
    return found ?? null;
  }
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

export const allRoles: UserRole[] = ['admin', 'guest', 'staff'];