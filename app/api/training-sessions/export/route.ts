import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/auth-utils";

function escapeCsv(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }

    const stringValue = String(value);

    if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n") ||
        stringValue.includes("\r")
    ) {
        const escapedValue = stringValue.replace(
            /"/g,
            '""'
        );

        return `"${escapedValue}"`;
    }

    return stringValue;
}

function toCsv(
    rows: Record<string, unknown>[]
): string {
    if (rows.length === 0) {
        return "";
    }

    const headers = Object.keys(rows[0]);

    const csvRows = [
        headers.map(escapeCsv).join(","),
        ...rows.map((row) =>
            headers
                .map((header) =>
                    escapeCsv(row[header])
                )
                .join(",")
        ),
    ];

    return csvRows.join("\r\n");
}

export async function GET(
    request: Request
) {
    const { user, error } =
        await requireRole([
            "ADMIN",
            "WRITE",
            "READ_ONLY",
        ]);

    if (error) {
        return error;
    }

    const { searchParams } =
        new URL(request.url);

    const search =
        searchParams.get("search")?.trim() || "";

    const fieldOfficer =
        searchParams
            .get("fieldOfficer")
            ?.trim() || "";

    const lga =
        searchParams.get("lga")?.trim() || "";

    const status =
        searchParams.get("status")?.trim() || "";

    const fromDate =
        searchParams.get("fromDate")?.trim() || "";

    const toDate =
        searchParams.get("toDate")?.trim() || "";

    const client =
        await clientPromise;

    const db =
        client.db(
            process.env.MONGODB_DB
        );

    const query: Record<string, unknown> =
        user.role === "WRITE"
            ? {
                fieldOfficerId:
                    user.foId,
            }
            : {};

    if (search) {
        query.clusterName = {
            $regex: search,
            $options: "i",
        };
    }

    if (
        user.role !== "WRITE" &&
        fieldOfficer
    ) {
        query.fieldOfficerId =
            fieldOfficer;
    }

    if (lga) {
        query.lga = {
            $regex: `^${lga}$`,
            $options: "i",
        };
    }

    if (fromDate || toDate) {
        const dateQuery: Record<
            string,
            string
        > = {};

        if (fromDate) {
            dateQuery.$gte =
                fromDate;
        }

        if (toDate) {
            dateQuery.$lte =
                toDate;
        }

        query.trainingDate =
            dateQuery;
    }

    const trainings =
        await db
            .collection(
                "training_sessions"
            )
            .find(query)
            .sort({
                trainingDate: -1,
                createdAt: -1,
            })
            .project({
                _id: 1,
                trainingDate: 1,
                fieldOfficerId: 1,
                clusterName: 1,
                lga: 1,
                community: 1,
                venue: 1,
                latitude: 1, 
                longitude: 1,
                expectedCollectors: 1,
            })
            .toArray();

    const sessionIds =
        trainings.map(
            (training) =>
                training._id
        );

    const collectorCounts =
        sessionIds.length > 0
            ? await db
                .collection(
                    "collectors"
                )
                .aggregate([
                    {
                        $match: {
                            trainingSessionId: {
                                $in: sessionIds,
                            },
                        },
                    },
                    {
                        $group: {
                            _id:
                                "$trainingSessionId",
                            count: {
                                $sum: 1,
                            },
                        },
                    },
                ])
                .toArray()
            : [];

    const collectorCountMap =
        new Map(
            collectorCounts.map(
                (item) => [
                    item._id.toString(),
                    item.count,
                ]
            )
        );


    let exportRows =
        trainings.map(
            (training) => {
                const recordedCollectors =
                    collectorCountMap.get(
                        training._id.toString()
                    ) || 0;

                const expectedCollectors =
                    Number(
                        training.expectedCollectors ||
                        0
                    );

                let trainingStatus:
                    | "Not Started"
                    | "In Progress"
                    | "Completed";

                if (
                    recordedCollectors ===
                    0
                ) {
                    trainingStatus =
                        "Not Started";
                } else if (
                    expectedCollectors >
                    0 &&
                    recordedCollectors >=
                    expectedCollectors
                ) {
                    trainingStatus =
                        "Completed";
                } else {
                    trainingStatus =
                        "In Progress";
                }

                return {
                    "Training ID":
                        training._id.toString(),
                    "Training Date":
                        training.trainingDate,
                    "Field Officer ID":
                        training.fieldOfficerId,
                    "Cluster":
                        training.clusterName,
                    "Community":
                        training.community,
                    "Training Venue":
                        training.venue,
                    "LGA":
                        training.lga,
                    "Latitude":
                        training.latitude,
                    "Longitude":
                        training.longitude,
                    "Expected Collectors":
                        expectedCollectors,
                    "Recorded Collectors":
                        recordedCollectors,
                    "Training Status":
                        trainingStatus,
                };
            }
        );

    if (status) {
        exportRows =
            exportRows.filter(
                (training) =>
                    training[
                    "Training Status"
                    ] === status
            );
    }

    const csv =
        "\uFEFF" +
        toCsv(exportRows);


    let fileName =
        "training-sessions.csv";

    if (fromDate || toDate) {
        const startDate =
            fromDate || toDate;

        const endDate =
            toDate || fromDate;

        fileName =
            `training-sessions-${startDate}-to-${endDate}.csv`;
    }

    return new NextResponse(
        csv,
        {
            status: 200,
            headers: {
                "Content-Type":
                    "text/csv; charset=utf-8",
                "Content-Disposition":
                    `attachment; filename="${fileName}"`,
                "Cache-Control":
                    "no-store",
            },
        }
    );

}
