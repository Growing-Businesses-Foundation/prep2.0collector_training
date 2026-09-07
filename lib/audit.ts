import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type AuditAction =
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "LOGOUT"
    | "USER_CREATED"
    | "USER_UPDATED"
    | "PASSWORD_RESET"
    | "ROLE_CHANGED"
    | "USER_DELETED"
    | "TRAINING_CREATED"
    | "TRAINING_UPDATED"
    | "COLLECTOR_CREATED"
    | "COLLECTOR_UPDATED";

export interface AuditLog {
    _id?: ObjectId;

    userId?: string;
    userName?: string;
    userEmail?: string;

    action: AuditAction;

    resource?: string;
    resourceId?: string;

    description: string;

    metadata?: Record<string, unknown>;

    ipAddress?: string;
    userAgent?: string;

    createdAt: Date;
}


/**
 * Record an activity performed in the application.
 *
 * IMPORTANT:
 * Never pass passwords or password hashes inside metadata.
 */
export async function logActivity({
    userId,
    userName,
    userEmail,
    action,
    resource,
    resourceId,
    description,
    metadata,
    ipAddress,
    userAgent,
}: {
    userId?: string;
    userName?: string;
    userEmail?: string;

    action: AuditAction;

    resource?: string;
    resourceId?: string;

    description: string;

    metadata?: Record<string, unknown>;

    ipAddress?: string;
    userAgent?: string;
}): Promise<void> {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        await db.collection<AuditLog>("audit_logs").insertOne({
            userId,
            userName,
            userEmail,
            action,
            resource,
            resourceId,
            description,
            metadata,
            ipAddress,
            userAgent,
            createdAt: new Date(),
        });
    } catch (error) {
        /*
         * Audit logging should never break the actual
         * application operation.
         *
         * If logging fails, record the error on the server
         * but allow the original operation to continue.
         */
        console.error("[AUDIT LOG ERROR]", error);
    }
}
