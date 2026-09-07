import { ObjectId } from "mongodb";

export interface TrainingSession {
    _id?: ObjectId;
    trainingDate: string;
    fieldOfficerId: string;
    fieldOfficer: string;
    clusterName: string;
    lga: string;
    community: string;
    venue: string;
    facilitator: string;
    trainingStatus: "Completed" | "Not Completed";
    expectedCollectors: number;
    latitude: number;
    longitude: number;
    createdAt: Date;
    updatedAt: Date;
}