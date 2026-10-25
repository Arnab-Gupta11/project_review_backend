import type { Role } from '@prisma/client';

export interface IUserResponse {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoginResponse {
  user: IUserResponse;
  token: string;
}

