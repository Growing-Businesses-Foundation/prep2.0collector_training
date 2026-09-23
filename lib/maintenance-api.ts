import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getMaintenanceSettings } from "@/lib/maintenance";

export async function requireMaintenanceAccess(): Promise<
    NextResponse | null
> {
    const settings = await getMaintenanceSettings();

    // Application is live.
    if (!settings.maintenanceMode) {
        return null;
    }

    const session = await getServerSession(authOptions);

    // Administrators retain access during maintenance.
    if (session?.user?.role === "ADMIN") {
        return null;
    }

    return NextResponse.json(
        {
            success: false,
            message: settings.message,
            maintenanceMode: true,
        },
        {
            status: 503,
            headers: {
                "Retry-After": "300",
            },
        }
    );
}