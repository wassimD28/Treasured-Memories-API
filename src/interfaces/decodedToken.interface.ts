export interface DecodedToken {
  userId: number;
  username: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}