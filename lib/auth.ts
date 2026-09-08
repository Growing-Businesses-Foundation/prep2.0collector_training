// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { logActivity } from "@/lib/audit";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",

            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                },
                password: {
                    label: "Password",
                    type: "password",
                },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const client = await clientPromise;
                const db = client.db(process.env.MONGODB_DB);

                const email = credentials.email.trim().toLowerCase();

                const user = await db.collection("users").findOne({
                    email,
                    isActive: true,
                });

                // ------------------------------------------------
                // User not found / inactive
                // ------------------------------------------------

                if (!user) {
                    await logActivity({
                        action: "LOGIN_FAILED",
                        userEmail: email,
                        description: "Failed login attempt",
                        metadata: {
                            reason: "USER_NOT_FOUND_OR_INACTIVE",
                        },
                    });

                    return null;
                }

                // ------------------------------------------------
                // Check password
                // ------------------------------------------------

                const passwordMatch = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );

                if (!passwordMatch) {
                    await logActivity({
                        userId: user._id.toString(),
                        userName: user.name,
                        userEmail: user.email,
                        action: "LOGIN_FAILED",
                        description: "Failed login attempt",
                        metadata: {
                            reason: "INVALID_PASSWORD",
                        },
                    });

                    return null;
                }

                // ------------------------------------------------
                // Successful login
                // ------------------------------------------------

                await logActivity({
                    userId: user._id.toString(),
                    userName: user.name,
                    userEmail: user.email,
                    action: "LOGIN_SUCCESS",
                    description: "User logged in successfully",
                    metadata: {
                        role: user.role,
                        foId: user.foId,
                    },
                });

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    foId: user.foId,
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60, // 8 hours
    },

    secret: process.env.NEXTAUTH_SECRET,

    pages: {
        signIn: "/login",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.foId = user.foId;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.foId = token.foId;
            }

            return session;
        },
    },
};
