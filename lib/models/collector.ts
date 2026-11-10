//lib/models/collector.ts

import { ObjectId } from "mongodb";

export interface Collector {
    _id?: ObjectId;
    collectorId?: string;
    trainingSessionId: ObjectId;
    fullName: string;
    gender: "Male" | "Female";
    phoneNumber: string;
    newlyRecruited: "Yes" | "No";
    createdAt: Date;
}