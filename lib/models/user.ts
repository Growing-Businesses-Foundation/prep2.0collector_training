//
import { ObjectId } from "mongodb";

export type UserRole =
    | "ADMIN"
    | "WRITE"
    | "READ_ONLY"
    | "RESTRICTED_READ_ONLY";

export interface User {
    _id?: ObjectId;

    name: string;

    email: string;

    foId?: string;

    role: UserRole;

    passwordHash: string;

    isActive: boolean;

    createdAt: Date;

    updatedAt: Date;
}
