// types/next-auth.d.ts

import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "ADMIN" | "WRITE" | "READ_ONLY";
            foId?: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: "ADMIN" | "WRITE" | "READ_ONLY";
        foId?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "ADMIN" | "WRITE" | "READ_ONLY";
        foId?: string;
    }
}