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
};

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

function getMongoClientPromise(): Promise<MongoClient> {
    if (!global._mongoClientPromise) {
        global._mongoClientPromise = createMongoClient();
    }

    return global._mongoClientPromise;
}

const clientPromise = {
    then<TResult1 = MongoClient, TResult2 = never>(
        onfulfilled?:
            | ((value: MongoClient) => TResult1 | PromiseLike<TResult1>)
            | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ) {
        return getMongoClientPromise().then(onfulfilled, onrejected);
    },

    catch<TResult = never>(
        onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null
    ) {
        return getMongoClientPromise().catch(onrejected);
    },

    finally(onfinally?: (() => void) | null) {
        return getMongoClientPromise().finally(onfinally);
    },
};

export default clientPromise;