import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

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
                    sessionVersion: user.sessionVersion ?? 1,
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
        /*
         * The JWT only needs the user's ID.
         *
         * Role and other authorization data are loaded from
         * MongoDB whenever the session is resolved.
         */
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.sessionVersion = user.sessionVersion;
            }

            return token;
        },

        /*
         * MongoDB is the source of truth for the current user.
         *
         * This allows role changes to take effect without
         * requiring the user to log out and log back in.
         */
        async session({ session, token }) {
            if (!session.user || !token.id) {
                return {
                    ...session,
                    user: undefined,
                };
            }

            try {
                const client = await clientPromise;
                const db = client.db(process.env.MONGODB_DB);

                const user = await db.collection("users").findOne({
                    _id: new ObjectId(token.id),
                });

                if (!user || user.isActive !== true) {
                    return {
                        ...session,
                        user: undefined,
                    };
                }

                const currentSessionVersion = user.sessionVersion ?? 1;

                if (token.sessionVersion !== currentSessionVersion) {
                    return {
                        ...session,
                        user: undefined,
                    };
                }

                session.user.id = user._id.toString();
                session.user.name = user.name;
                session.user.email = user.email;
                session.user.role = user.role;
                session.user.foId = user.foId;
            } catch (error) {
                console.error(
                    "Failed to load current user session data:",
                    error
                );

                return {
                    ...session,
                    user: undefined,
                };
            }

            return session;
        },
    },
};
