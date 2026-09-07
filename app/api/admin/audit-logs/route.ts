import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import clientPromise from "@/lib/mongodb";

const ALLOWED_ACTIONS = [
    "LOGIN_SUCCESS",
    "LOGIN_FAILED",
    "LOGOUT",
    "USER_CREATED",
    "USER_UPDATED",
    "PASSWORD_RESET",
    "PASSWORD_CHANGED",
    "PASSWORD_CHANGE_FAILED",
    "ROLE_CHANGED",
    "USER_DELETED",
    "TRAINING_CREATED",
    "TRAINING_UPDATED",
    "COLLECTOR_CREATED",
    "COLLECTOR_UPDATED",
] as const;

export async function GET(request: Request) {
    const { user, error } = await requireRole(["ADMIN"]);

    if (error) {
        return error;
    }

    try {
        const { searchParams } = new URL(request.url);

        const page = Math.max(
            Number(searchParams.get("page")) || 1,
            1
        );

        const limit = Math.min(
            Math.max(Number(searchParams.get("limit")) || 20, 1),
            100
        );

        const search = searchParams.get("search")?.trim() || "";
        const action = searchParams.get("action")?.trim() || "";
        const userId = searchParams.get("userId")?.trim() || "";
        const dateFrom = searchParams.get("dateFrom")?.trim() || "";
        const dateTo = searchParams.get("dateTo")?.trim() || "";

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const filter: Record<string, unknown> = {};

        // Search by user name, email or description
        if (search) {
            filter.$or = [
                {
                    userName: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    userEmail: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    description: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        // Action filter
        if (
            action &&
            ALLOWED_ACTIONS.includes(
                action as (typeof ALLOWED_ACTIONS)[number]
            )
        ) {
            filter.action = action;
        }

        // User filter
        if (userId) {
            filter.userId = userId;
        }

        // Date filter
        if (dateFrom || dateTo) {
            const createdAt: Record<string, Date> = {};

            if (dateFrom) {
                createdAt.$gte = new Date(
                    `${dateFrom} T00:00:00.000Z`
                );
            }

            if (dateTo) {
                createdAt.$lte = new Date(
                    `${dateTo} T23: 59: 59.999Z`
                );
            }

            filter.createdAt = createdAt;
        }

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            db
                .collection("audit_logs")
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),

            db.collection("audit_logs").countDocuments(filter),
        ]);

        // Serialize MongoDB ObjectIds before returning JSON
        const serializedLogs = logs.map((log) => ({
            ...log,
            _id: log._id?.toString(),
        }));

        // Get distinct users for the filter dropdown
        const users = await db
            .collection("audit_logs")
            .aggregate([
                {
                    $match: {
                        userId: {
                            $exists: true,
                            $ne: null,
                        },
                    },
                },
                {
                    $group: {
                        _id: "$userId",
                        userName: {
                            $first: "$userName",
                        },
                        userEmail: {
                            $first: "$userEmail",
                        },
                    },
                },
                {
                    $sort: {
                        userName: 1,
                    },
                },
            ])
            .toArray();

        // Statistics
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [
            totalActivities,
            todayActivities,
            successfulLogins,
            trainingCreated,
            collectorsCreated,
        ] = await Promise.all([
            db.collection("audit_logs").countDocuments(),

            db.collection("audit_logs").countDocuments({
                createdAt: {
                    $gte: todayStart,
                },
            }),

            db.collection("audit_logs").countDocuments({
                action: "LOGIN_SUCCESS",
            }),

            db.collection("audit_logs").countDocuments({
                action: "TRAINING_CREATED",
            }),

            db.collection("audit_logs").countDocuments({
                action: "COLLECTOR_CREATED",
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: serializedLogs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            users,
            statistics: {
                totalActivities,
                todayActivities,
                successfulLogins,
                trainingCreated,
                collectorsCreated,
            },
            currentUser: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Audit logs fetch error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load activity logs.",
            },
            { status: 500 }
        );
    }
}
