import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { logActivity } from "@/lib/audit";
import { validatePassword } from "@/lib/validation/password";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication required.",
                },
                { status: 401 }
            );
        }

        const body = await request.json();

        const currentPassword =
            typeof body.currentPassword === "string"
                ? body.currentPassword
                : "";

        const newPassword =
            typeof body.newPassword === "string"
                ? body.newPassword
                : "";

        const confirmPassword =
            typeof body.confirmPassword === "string"
                ? body.confirmPassword
                : "";

        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: "All password fields are required.",
                },
                { status: 400 }
            );
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: "New password and confirmation do not match.",
                },
                { status: 400 }
            );
        }

        if (currentPassword === newPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Your new password must be different from your current password.",
                },
                { status: 400 }
            );
        }

        const passwordError = validatePassword(newPassword);

        if (passwordError) {
            return NextResponse.json(
                {
                    success: false,
                    message: passwordError,
                },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const user = await db.collection("users").findOne({
            _id: new ObjectId(session.user.id),
            isActive: true,
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User account could not be found.",
                },
                { status: 404 }
            );
        }

        const currentPasswordMatch = await bcrypt.compare(
            currentPassword,
            user.passwordHash
        );

        if (!currentPasswordMatch) {
            await logActivity({
                userId: user._id.toString(),
                userName: user.name,
                userEmail: user.email,
                action: "LOGIN_FAILED",
                description: "Password change failed because the current password was incorrect.",
                metadata: {
                    reason: "INVALID_CURRENT_PASSWORD",
                },
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "Your current password is incorrect.",
                },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await db.collection("users").updateOne(
            {
                _id: user._id,
            },
            {
                $set: {
                    passwordHash,
                    updatedAt: new Date(),
                },
            }
        );

        await logActivity({
            userId: user._id.toString(),
            userName: user.name,
            userEmail: user.email,
            action: "PASSWORD_CHANGED",
            resource: "users",
            resourceId: user._id.toString(),
            description: "User changed their password successfully.",
        });

        return NextResponse.json({
            success: true,
            message: "Your password has been changed successfully.",
        });
    } catch (error) {
        console.error("[CHANGE PASSWORD ERROR]", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to change your password. Please try again.",
            },
            { status: 500 }
        );
    }
}
