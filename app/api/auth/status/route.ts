// app/api/auth/status/route.ts

import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth-utils";

export async function GET() {
    const { user, error } = await requireRole([
        "ADMIN",
        "WRITE",
        "READ_ONLY",
        "RESTRICTED_READ_ONLY",
    ]);

    if (error) {
        return error;
    }

    return NextResponse.json({
        success: true,
        active: true,
        user: {
            id: user.id,
            role: user.role,
            foId: user.foId,
        },
    });
}
