export type UserRole = 'ADMIN' | 'GUEST' | 'WORKER';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string; // only for mock/demo – never store like this in real apps
}
