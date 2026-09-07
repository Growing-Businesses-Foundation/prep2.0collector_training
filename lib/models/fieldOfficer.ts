import { ObjectId } from "mongodb";

export interface FieldOfficer {
    _id?: ObjectId;
    foId: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}