import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/auth-utils";
import { uploadTrainingPhoto } from "@/lib/google-drive";
import { logActivity } from "@/lib/audit";

export async function POST(request: Request) {
    const { user, error } = await requireRole([
        "ADMIN",
        "WRITE",
    ]);

    if (error) {
        return error;
    }

    try {
        const formData = await request.formData();

        const trainingDate =
            formData.get("trainingDate")?.toString();

        const fieldOfficerId =
            formData.get("fieldOfficerId")?.toString();

        const clusterName =
            formData.get("clusterName")?.toString();

        const lga =
            formData.get("lga")?.toString();

        const community =
            formData.get("community")?.toString();

        const venue =
            formData.get("venue")?.toString();

        const facilitator =
            formData.get("facilitator")?.toString();

        const expectedCollectors =
            formData
                .get("expectedCollectors")
                ?.toString();

        const latitude =
            formData.get("latitude")?.toString();

        const longitude =
            formData.get("longitude")?.toString();

        const photo = formData.get("photo");

        let assignedFieldOfficerId: string;

        if (user.role === "ADMIN") {
            if (!fieldOfficerId) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Field Officer ID is required.",
                    },
                    { status: 400 }
                );
            }

            assignedFieldOfficerId =
                fieldOfficerId;
        } else {
            if (!user.foId) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Your account is not assigned to a Field Officer ID.",
                    },
                    { status: 403 }
                );
            }

            assignedFieldOfficerId = user.foId;
        }

        if (
            !trainingDate ||
            !clusterName ||
            !lga ||
            !community ||
            !venue ||
            !facilitator ||
            expectedCollectors === undefined ||
            latitude === undefined ||
            longitude === undefined
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "All training information fields are required.",
                },
                { status: 400 }
            );
        }

        const expectedCollectorsNumber =
            Number(expectedCollectors);

        if (
            !Number.isInteger(
                expectedCollectorsNumber
            ) ||
            expectedCollectorsNumber <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Expected collectors must be a whole number greater than zero.",
                },
                { status: 400 }
            );
        }

        const latitudeNumber = Number(latitude);
        const longitudeNumber = Number(longitude);

        if (
            !Number.isFinite(latitudeNumber) ||
            !Number.isFinite(longitudeNumber)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Valid latitude and longitude are required.",
                },
                { status: 400 }
            );
        }

        if (!(photo instanceof File)) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Training evidence photo is required.",
                },
                { status: 400 }
            );
        }

        if (!photo.type.startsWith("image/")) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Training evidence must be an image.",
                },
                { status: 400 }
            );
        }

        if (photo.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Training photo must be less than 10MB.",
                },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(
            process.env.MONGODB_DB
        );

        const fieldOfficer = await db
            .collection("field_officers")
            .findOne({
                foId: assignedFieldOfficerId,
                isActive: true,
            });

        if (!fieldOfficer) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Field Officer not found or inactive.",
                },
                { status: 404 }
            );
        }

        const photoBuffer = Buffer.from(
            await photo.arrayBuffer()
        );

        const safeFieldOfficerName =
            fieldOfficer.name
                .replace(/[^a-zA-Z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

        const fileName =
            `training-${trainingDate}-${safeFieldOfficerName}-${Date.now()}-${photo.name}`;

        const uploadedPhoto =
            await uploadTrainingPhoto({
                buffer: photoBuffer,
                fileName,
                mimeType: photo.type,
            });

        if (!uploadedPhoto.id) {
            throw new Error(
                "Google Drive upload did not return a file ID."
            );
        }

        const now = new Date();

        const result = await db
            .collection("training_sessions")
            .insertOne({
                trainingDate,

                fieldOfficerId:
                    fieldOfficer.foId,

                fieldOfficerName:
                    fieldOfficer.name,

                clusterName,
                lga,
                community,
                venue,
                facilitator,

                // System-generated initial status.
                trainingStatus: "Not Started",

                expectedCollectors:
                    expectedCollectorsNumber,

                latitude: latitudeNumber,
                longitude: longitudeNumber,

                photoFileId:
                    uploadedPhoto.id,

                photoUrl:
                    uploadedPhoto.webViewLink ||
                    null,

                createdAt: now,
                updatedAt: now,
            });

        // ====================================================
        // AUDIT LOG
        // ====================================================

        await logActivity({
            userId: user.id,
            userName: user.name ?? undefined,
            userEmail: user.email ?? undefined,

            action: "TRAINING_CREATED",

            resource: "training_session",

            resourceId:
                result.insertedId.toString(),

            description:
                `Created training session for ${fieldOfficer.name} - ${clusterName}`,

            metadata: {
                trainingDate,
                fieldOfficerId:
                    fieldOfficer.foId,
                fieldOfficerName:
                    fieldOfficer.name,
                clusterName,
                lga,
                community,
                venue,
                facilitator,
                expectedCollectors:
                    expectedCollectorsNumber,
            },
        });

        return NextResponse.json({
            success: true,
            message:
                "Training session created successfully.",
            trainingSessionId:
                result.insertedId.toString(),
            photoFileId:
                uploadedPhoto.id,
        });
    } catch (error) {
        console.error(
            "Training session creation error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to create training session.",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    const { user, error } = await requireRole([
        "ADMIN",
        "WRITE",
        "READ_ONLY",
    ]);

    if (error) {
        return error;
    }

    try {
        const client = await clientPromise;
        const db = client.db(
            process.env.MONGODB_DB
        );

        const query =
            user.role === "WRITE"
                ? {
                    fieldOfficerId:
                        user.foId,
                }
                : {};

        const sessions = await db
            .collection("training_sessions")
            .find(query)
            .sort({
                trainingDate: -1,
                createdAt: -1,
            })
            .project({
                _id: 1,
                trainingDate: 1,
                fieldOfficerId: 1,
                fieldOfficerName: 1,
                clusterName: 1,
                lga: 1,
                community: 1,
                venue: 1,
                expectedCollectors: 1,
                trainingStatus: 1,
            })
            .toArray();

        const sessionIds = sessions.map(
            (session) => session._id
        );

        const collectorCounts = await db
            .collection("collectors")
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
                        _id: "$trainingSessionId",
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ])
            .toArray();

        const collectorCountMap =
            new Map(
                collectorCounts.map(
                    (item) => [
                        item._id.toString(),
                        item.count,
                    ]
                )
            );

        const formattedSessions =
            sessions.map((session) => {
                const recordedCollectors =
                    collectorCountMap.get(
                        session._id.toString()
                    ) || 0;

                const expectedCollectors =
                    Number(
                        session.expectedCollectors ||
                        0
                    );

                let trainingStatus:
                    | "Not Started"
                    | "In Progress"
                    | "Completed";

                if (
                    expectedCollectors > 0 &&
                    recordedCollectors >=
                    expectedCollectors
                ) {
                    trainingStatus =
                        "Completed";
                } else if (
                    recordedCollectors > 0
                ) {
                    trainingStatus =
                        "In Progress";
                } else {
                    trainingStatus =
                        "Not Started";
                }

                return {
                    id: session._id.toString(),

                    trainingDate:
                        session.trainingDate,

                    fieldOfficerId:
                        session.fieldOfficerId,

                    fieldOfficerName:
                        session.fieldOfficerName,

                    clusterName:
                        session.clusterName,

                    lga: session.lga,

                    community:
                        session.community,

                    venue: session.venue,

                    expectedCollectors,

                    recordedCollectors,

                    trainingStatus,
                };
            });

        return NextResponse.json({
            success: true,
            sessions: formattedSessions,
        });
    } catch (error) {
        console.error(
            "Training sessions retrieval error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to retrieve training sessions.",
            },
            { status: 500 }
        );
    }
}
