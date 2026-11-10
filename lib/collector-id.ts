
import type { Db } from "mongodb";

interface CollectorCounter {
    _id: string;
    sequence: number;
}

export async function generateCollectorId(db: Db): Promise<string> {
    const counters = db.collection<CollectorCounter>("counters");

    const counter = await counters.findOneAndUpdate(
        { _id: "collectorId" },
        {
            $inc: { sequence: 1 },
        },
        {
            upsert: true,
            returnDocument: "after",
        }
    );

    if (!counter || typeof counter.sequence !== "number") {
        throw new Error("Failed to generate collector ID.");
    }

    return `C${String(counter.sequence).padStart(6, "0")}`;
}
