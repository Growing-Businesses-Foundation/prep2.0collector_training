// types/next-auth.d.ts

import { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/models/user";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: UserRole;
            foId?: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: UserRole;
        foId?: string;
        sessionVersion: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: UserRole;
        foId?: string;
        sessionVersion: number;
    }
}