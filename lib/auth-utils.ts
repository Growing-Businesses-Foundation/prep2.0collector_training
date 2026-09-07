// lib/auth-utils.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { UserRole } from "@/lib/models/user";

export async function requireRole(allowedRoles: UserRole[]) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return {
            user: null,
            error: NextResponse.json(
                {
                    success: false,
                    message: "Authentication required.",
                },
                { status: 401 }
            ),
        };
    }

    if (!allowedRoles.includes(session.user.role)) {
        return {
            user: null,
            error: NextResponse.json(
                {
                    success: false,
                    message: "You do not have permission to perform this action.",
                },
                { status: 403 }
            ),
        };
    }

    return {
        user: session.user,
        error: null,
    };
}