import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import client from "@/lib/mongodb";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Forbidden",
                },
                { status: 403 }
            );
        }

        const db = client.db("collector_training");

        const fieldOfficers = await db
            .collection("users")
            .find(
                {
                    role: "WRITE",
                    isActive: true,
                },
                {
                    projection: {
                        _id: 0,
                        name: 1,
                        foId: 1,
                    },
                }
            )
            .sort({ foId: 1 })
            .toArray();

        return NextResponse.json({
            success: true,
            fieldOfficers,
        });
    } catch (error) {
        console.error(
            "[FIELD-OFFICERS] Failed to fetch field officers:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load field officers.",
            },
            { status: 500 }
        );
    }
}
