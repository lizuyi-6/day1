export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
}
