// src/types/admin.ts
export interface Admin {
  adminId: string;
  username: string;
  name: string;
  phone?: string;
  role: number;
  createdAt: string;
  updatedAt: string;
}