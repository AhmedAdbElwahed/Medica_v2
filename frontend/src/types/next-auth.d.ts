import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Role } from "./auth.types";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      role: Role;
      accessToken: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: number;
    role: Role;
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: Role;
    accessToken: string;
  }
}
