export type UserRole = 'ADMIN' | 'GUEST' | 'WORKER';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  registered_payment_method?: string;
}