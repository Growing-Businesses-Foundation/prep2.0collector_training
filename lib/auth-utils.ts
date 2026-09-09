// // lib/auth-utils.ts
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";

// import { authOptions } from "@/lib/auth";
// import { UserRole } from "@/lib/models/user";

// export async function requireRole(allowedRoles: UserRole[]) {
//     const session = await getServerSession(authOptions);

//     if (!session?.user) {
//         return {
//             user: null,
//             error: NextResponse.json(
//                 {
//                     success: false,
//                     message: "Authentication required.",
//                 },
//                 { status: 401 }
//             ),
//         };
//     }

//     if (!allowedRoles.includes(session.user.role)) {
//         return {
//             user: null,
//             error: NextResponse.json(
//                 {
//                     success: false,
//                     message: "You do not have permission to perform this action.",
//                 },
//                 { status: 403 }
//             ),
//         };
//     }

//     return {
//         user: session.user,
//         error: null,
//     };
// }


import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";

import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { UserRole } from "@/lib/models/user";

export async function requireRole(allowedRoles: UserRole[]) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
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

    let userId: ObjectId;

    try {
        userId = new ObjectId(session.user.id);
    } catch {
        return {
            user: null,
            error: NextResponse.json(
                {
                    success: false,
                    message: "Invalid user session.",
                },
                { status: 401 }
            ),
        };
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const user = await db.collection("users").findOne({
        _id: userId,
    });

    /*
     * User no longer exists.
     */
    if (!user) {
        return {
            user: null,
            error: NextResponse.json(
                {
                    success: false,
                    message: "User account no longer exists.",
                },
                { status: 401 }
            ),
        };
    }

    /*
     * User has been deactivated.
     */
    if (user.isActive !== true) {
        return {
            user: null,
            error: NextResponse.json(
                {
                    success: false,
                    message: "Your account has been deactivated.",
                },
                { status: 401 }
            ),
        };
    }

    /*
     * Always use the current role from MongoDB.
     *
     * This means a role change takes effect without
     * requiring the user to log in again.
     */
    const currentRole = user.role as UserRole;

    if (!allowedRoles.includes(currentRole)) {
        return {
            user: null,
            error: NextResponse.json(
                {
                    success: false,
                    message:
                        "You do not have permission to perform this action.",
                },
                { status: 403 }
            ),
        };
    }

    return {
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: currentRole,
            foId: user.foId,
        },
        error: null,
    };
}