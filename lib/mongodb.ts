// lib/mongodb.ts

import { MongoClient, ServerApiVersion } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },

    maxIdleTimeMS: 5_000,
};

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createMongoClient(): Promise<MongoClient> {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error(
            "Please define MONGODB_URI in your environment variables."
        );
    }

    const client = new MongoClient(uri, options);

    attachDatabasePool(client);

    return client.connect();
}

if (!global._mongoClientPromise) {
    global._mongoClientPromise = Promise.resolve().then(
        createMongoClient
    );
}

const clientPromise = global._mongoClientPromise;

export default clientPromise;