// app/api/admin/maintenance/route.ts

import { NextRequest, NextResponse } from "next/server";

import { requireRole } from "@/lib/auth-utils";
import {
    disableMaintenanceMode,
    enableMaintenanceMode,
    getMaintenanceSettings,
} from "@/lib/maintenance";
import { logActivity } from "@/lib/audit";
import { UserRole } from "@/lib/models/user";

const ADMIN_ROLES: UserRole[] = ["ADMIN"];

/**
 * GET
 *
 * Get the current application maintenance status.
 */
export async function GET() {
    const { error } = await requireRole(ADMIN_ROLES);

    if (error) {
        return error;
    }

    try {
        const settings = await getMaintenanceSettings();

        return NextResponse.json({
            success: true,
            data: {
                maintenanceMode: settings.maintenanceMode,
                message: settings.message,
                updatedAt: settings.updatedAt,
                updatedBy: settings.updatedBy ?? null,
            },
        });
    } catch (error) {
        console.error("Failed to get maintenance settings:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to retrieve maintenance settings.",
            },
            { status: 500 }
        );
    }
}

/**
 * POST
 *
 * Enable application maintenance mode.
 *
 * Optional request body:
 *
 * {
 *     "message": "The application is currently undergoing maintenance."
 * }
 */
export async function POST(request: NextRequest) {
    const { user, error } = await requireRole(ADMIN_ROLES);

    if (error) {
        return error;
    }

    if (!user) {
        return NextResponse.json(
            {
                success: false,
                message: "Authentication required.",
            },
            { status: 401 }
        );
    }

    try {
        let message: string | undefined;

        try {
            const body = await request.json();

            if (typeof body?.message === "string") {
                message = body.message;
            }
        } catch {
            // No request body is fine.
        }

        const settings = await enableMaintenanceMode(
            {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            message
        );

        await logActivity({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            action: "MAINTENANCE_MODE_ENABLED",
            description: "Application maintenance mode enabled.",
            metadata: {
                maintenanceMode: true,
                message: settings.message,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Maintenance mode enabled successfully.",
            data: {
                maintenanceMode: settings.maintenanceMode,
                message: settings.message,
                updatedAt: settings.updatedAt,
                updatedBy: settings.updatedBy ?? null,
            },
        });
    } catch (error) {
        console.error("Failed to enable maintenance mode:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to enable maintenance mode.",
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE
 *
 * Disable application maintenance mode.
 */
export async function DELETE() {
    const { user, error } = await requireRole(ADMIN_ROLES);

    if (error) {
        return error;
    }

    if (!user) {
        return NextResponse.json(
            {
                success: false,
                message: "Authentication required.",
            },
            { status: 401 }
        );
    }

    try {
        const settings = await disableMaintenanceMode({
            id: user.id,
            name: user.name,
            email: user.email,
        });

        await logActivity({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            action: "MAINTENANCE_MODE_DISABLED",
            description: "Application maintenance mode disabled.",
            metadata: {
                maintenanceMode: false,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Maintenance mode disabled successfully.",
            data: {
                maintenanceMode: settings.maintenanceMode,
                message: settings.message,
                updatedAt: settings.updatedAt,
                updatedBy: settings.updatedBy ?? null,
            },
        });
    } catch (error) {
        console.error("Failed to disable maintenance mode:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to disable maintenance mode.",
            },
            { status: 500 }
        );
    }
}