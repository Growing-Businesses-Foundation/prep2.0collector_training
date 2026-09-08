// lib/mongodb.ts

import { MongoClient, ServerApiVersion } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error("Please define MONGODB_URI in your environment variables.");
}

const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },

    // Close idle connections relatively quickly on Vercel
    maxIdleTimeMS: 5_000,
};

declare global {
    var _mongoClient: MongoClient | undefined;
}

const client =
    global._mongoClient ??
    new MongoClient(uri, options);

if (!global._mongoClient) {
    global._mongoClient = client;
}

attachDatabasePool(client);

export default client;
