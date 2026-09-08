// lib/mongodb.ts

import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error("Please define MONGODB_URI in your environment variables..");
}

const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },

    maxPoolSize: 20,
    maxIdleTimeMS: 60_000,
    waitQueueTimeoutMS: 10_000,
};

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);

    global._mongoClientPromise = client.connect();
}

const clientPromise = global._mongoClientPromise;

export default clientPromise;
