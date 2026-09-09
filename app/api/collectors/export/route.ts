import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/auth-utils";

function escapeCsv(value: unknown): string {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    const stringValue = String(value);

    if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n") ||
        stringValue.includes("\r")
    ) {
        const escapedValue =
            stringValue.replace(
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

    const headers =
        Object.keys(rows[0]);

    const csvRows = [
        headers
            .map(escapeCsv)
            .join(","),
        ...rows.map((row) =>
            headers
                .map((header) =>
                    escapeCsv(
                        row[header]
                    )
                )
                .join(",")
        ),
    ];

    return csvRows.join("\r\n");
}

export async function GET(
    request: Request
) {
    /*
     * ------------------------------------------------------------
     * EXPORT ACCESS
     * ------------------------------------------------------------
     *
     * ADMIN:
     *   Can export all collectors.
     *
     * WRITE:
     *   Can export only collectors belonging
     *   to their own Field Officer.
     *
     * READ_ONLY:
     *   Can export all collectors.
     *
     * RESTRICTED_READ_ONLY:
     *   Cannot export.
     */
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
        searchParams
            .get("search")
            ?.trim() || "";

    const gender =
        searchParams
            .get("gender")
            ?.trim() || "";

    const recruited =
        searchParams
            .get("recruited")
            ?.trim() || "";

    const fieldOfficer =
        searchParams
            .get("fieldOfficer")
            ?.trim() || "";

    const lga =
        searchParams
            .get("lga")
            ?.trim() || "";

    const cluster =
        searchParams
            .get("cluster")
            ?.trim() || "";

    const fromDate =
        searchParams
            .get("fromDate")
            ?.trim() || "";

    const toDate =
        searchParams
            .get("toDate")
            ?.trim() || "";

    const client =
        await clientPromise;

    const db =
        client.db(
            process.env.MONGODB_DB
        );

    /*
     * ------------------------------------------------------------
     * TRAINING SESSION QUERY
     * ------------------------------------------------------------
     */

    const trainingQuery:
        Record<string, unknown> =
        user.role === "WRITE"
            ? {
                fieldOfficerId:
                    user.foId,
            }
            : {};

    /*
     * Field Officer filter
     *
     * WRITE users remain restricted
     * to their own FO even if another
     * FO is supplied in the URL.
     */
    if (
        user.role !== "WRITE" &&
        fieldOfficer
    ) {
        trainingQuery.fieldOfficerId =
            fieldOfficer;
    }

    /*
     * LGA filter
     */
    if (lga) {
        trainingQuery.lga = {
            $regex: `^${lga}$`,
            $options: "i",
        };
    }

    /*
     * Cluster filter
     */
    if (cluster) {
        trainingQuery.clusterName = {
            $regex: `^${cluster}$`,
            $options: "i",
        };
    }

    /*
     * Training date filter
     *
     * trainingDate is stored as
     * YYYY-MM-DD, so string comparison
     * works correctly.
     */
    if (fromDate || toDate) {
        const dateQuery:
            Record<string, string> = {};

        if (fromDate) {
            dateQuery.$gte =
                fromDate;
        }

        if (toDate) {
            dateQuery.$lte =
                toDate;
        }

        trainingQuery.trainingDate =
            dateQuery;
    }

    const trainingSessions =
        await db
            .collection(
                "training_sessions"
            )
            .find(trainingQuery)
            .project({
                _id: 1,
                trainingDate: 1,
                fieldOfficerId: 1,
                clusterName: 1,
                lga: 1,
                community: 1,
            })
            .toArray();

    const trainingSessionIds =
        trainingSessions.map(
            (training) =>
                training._id
        );

    /*
     * ------------------------------------------------------------
     * COLLECTOR QUERY
     * ------------------------------------------------------------
     */

    const collectorQuery:
        Record<string, unknown> = {
        trainingSessionId: {
            $in: trainingSessionIds,
        },
    };

    /*
     * Gender filter
     */
    if (gender) {
        collectorQuery.gender =
            gender;
    }

    /*
     * Newly recruited filter
     */
    if (recruited) {
        collectorQuery.newlyRecruited =
            recruited;
    }

    /*
     * Collector name search
     */
    if (search) {
        collectorQuery.fullName = {
            $regex: search,
            $options: "i",
        };
    }

    const collectors =
        trainingSessionIds.length > 0
            ? await db
                .collection(
                    "collectors"
                )
                .find(
                    collectorQuery
                )
                .sort({
                    createdAt: -1,
                })
                .toArray()
            : [];

    /*
     * ------------------------------------------------------------
     * TRAINING SESSION LOOKUP
     * ------------------------------------------------------------
     */

    const trainingMap =
        new Map(
            trainingSessions.map(
                (training) => [
                    training._id.toString(),
                    training,
                ]
            )
        );

    /*
     * ------------------------------------------------------------
     * BUILD EXPORT ROWS
     * ------------------------------------------------------------
     */

    const exportRows =
        collectors.map(
            (collector) => {
                const training =
                    trainingMap.get(
                        collector
                            .trainingSessionId
                            .toString()
                    );

                return {
                    "Collector ID":
                        collector._id.toString(),

                    "Collector Name":
                        collector.fullName,

                    "Gender":
                        collector.gender,

                    "Phone Number":
                        collector.phoneNumber,

                    "Newly Recruited":
                        collector.newlyRecruited,

                    "Training Session ID":
                        collector
                            .trainingSessionId
                            .toString(),

                    "Training Date":
                        training?.trainingDate ||
                        "",

                    "Field Officer ID":
                        training?.fieldOfficerId ||
                        "",

                    "Cluster":
                        training?.clusterName ||
                        "",

                    "Community":
                        training?.community ||
                        "",

                    "LGA":
                        training?.lga ||
                        "",
                };
            }
        );

    /*
     * ------------------------------------------------------------
     * CSV
     * ------------------------------------------------------------
     */

    const csv =
        "\uFEFF" +
        toCsv(exportRows);

    /*
    * ------------------------------------------------------------
    * FILE NAME
    * ------------------------------------------------------------
    *
    * No date filter:
    *   Collector_Training_Data.csv
    *
    * Date filter:
    *   Collector_Training_Data-2026-09-01-to-2026-09-08.csv
    */

    let fileName =
        "Collector_Training_Data.csv";

    if (
        fromDate ||
        toDate
    ) {
        const startDate =
            fromDate || toDate;

        const endDate =
            toDate || fromDate;

        fileName =
            `Collector_Training_Data-${startDate}-to-${endDate}.csv`;
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
