export interface DecodedToken {
  userId: string;
  username?: string;
  email?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}