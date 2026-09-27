import { UserRole } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  sid: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  sessionId: string;
}
