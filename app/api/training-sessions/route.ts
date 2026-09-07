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
            formData.get("trainingDate")?.toString().trim();

        const fieldOfficerId =
            formData.get("fieldOfficerId")?.toString().trim();

        const clusterName =
            formData.get("clusterName")?.toString().trim();

        const lga =
            formData.get("lga")?.toString().trim();

        const community =
            formData.get("community")?.toString().trim();

        const venue =
            formData.get("venue")?.toString().trim();

        const facilitator =
            formData.get("facilitator")?.toString().trim();

        const expectedCollectors =
            formData
                .get("expectedCollectors")
                ?.toString()
                .trim();

        const latitude =
            formData.get("latitude")?.toString().trim();

        const longitude =
            formData.get("longitude")?.toString().trim();

        const photo = formData.get("photo");

        // ====================================================
        // BASIC FIELD OFFICER VALIDATION
        // ====================================================

        let assignedFieldOfficerId: string;
        let fieldOfficerName: string;

        if (user.role === "WRITE") {
            /*
             * WRITE users are already authenticated and their
             * Field Officer ID is stored in the session.
             *
             * Do not query field_officers just to validate them.
             */

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

            assignedFieldOfficerId =
                String(user.foId).trim();

            fieldOfficerName =
                user.name || "Field Officer";
        } else {
            /*
             * ADMIN users can select a Field Officer.
             * Validate the selected Field Officer against
             * the field_officers collection.
             */

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
                fieldOfficerId.trim();

            const client = await clientPromise;

            const db = client.db(
                process.env.MONGODB_DB
            );

            const fieldOfficer =
                await db
                    .collection("field_officers")
                    .findOne({
                        foId:
                            assignedFieldOfficerId,
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

            fieldOfficerName =
                fieldOfficer.name;
        }

        // ====================================================
        // REQUIRED FIELD VALIDATION
        // ====================================================

        if (
            !trainingDate ||
            !assignedFieldOfficerId ||
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

        // ====================================================
        // EXPECTED COLLECTORS
        // ====================================================

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

        // ====================================================
        // LOCATION VALIDATION
        // ====================================================

        const latitudeNumber =
            Number(latitude);

        const longitudeNumber =
            Number(longitude);

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

        if (
            latitudeNumber < -90 ||
            latitudeNumber > 90
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Latitude must be between -90 and 90.",
                },
                { status: 400 }
            );
        }

        if (
            longitudeNumber < -180 ||
            longitudeNumber > 180
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Longitude must be between -180 and 180.",
                },
                { status: 400 }
            );
        }

        // ====================================================
        // PHOTO VALIDATION
        // ====================================================

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

        // ====================================================
        // DATABASE
        // ====================================================

        const client = await clientPromise;

        const db = client.db(
            process.env.MONGODB_DB
        );

        // ====================================================
        // GOOGLE DRIVE UPLOAD
        // ====================================================

        const photoBuffer = Buffer.from(
            await photo.arrayBuffer()
        );

        const safeFieldOfficerName =
            fieldOfficerName
                .replace(/[^a-zA-Z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

        const safePhotoName =
            photo.name
                .replace(
                    /[^a-zA-Z0-9._-]+/g,
                    "-"
                );

        const fileName =
            `training-${trainingDate}-${safeFieldOfficerName}-${Date.now()}-${safePhotoName}`;

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

        // ====================================================
        // CREATE TRAINING SESSION
        // ====================================================

        const now = new Date();

        const result =
            await db
                .collection("training_sessions")
                .insertOne({
                    trainingDate,

                    fieldOfficerId:
                        assignedFieldOfficerId,

                    fieldOfficerName:
                        fieldOfficerName,

                    clusterName,
                    lga,
                    community,
                    venue,
                    facilitator,

                    trainingStatus:
                        "Not Started",

                    expectedCollectors:
                        expectedCollectorsNumber,

                    latitude:
                        latitudeNumber,

                    longitude:
                        longitudeNumber,

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
            userName:
                user.name ?? undefined,
            userEmail:
                user.email ?? undefined,

            action:
                "TRAINING_CREATED",

            resource:
                "training_session",

            resourceId:
                result.insertedId.toString(),

            description:
                `Created training session for ${fieldOfficerName} - ${clusterName}`,

            metadata: {
                trainingDate,

                fieldOfficerId:
                    assignedFieldOfficerId,

                fieldOfficerName,

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
            "[TRAINING] Training session creation error:",
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


// ============================================================
// GET TRAINING SESSIONS
// ============================================================

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

        const sessions =
            await db
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

        const sessionIds =
            sessions.map(
                (session) =>
                    session._id
            );

        const collectorCounts =
            await db
                .collection("collectors")
                .aggregate([
                    {
                        $match: {
                            trainingSessionId: {
                                $in:
                                    sessionIds,
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
            sessions.map(
                (session) => {
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
                        expectedCollectors >
                        0 &&
                        recordedCollectors >=
                        expectedCollectors
                    ) {
                        trainingStatus =
                            "Completed";
                    } else if (
                        recordedCollectors >
                        0
                    ) {
                        trainingStatus =
                            "In Progress";
                    } else {
                        trainingStatus =
                            "Not Started";
                    }

                    return {
                        id:
                            session._id.toString(),

                        trainingDate:
                            session.trainingDate,

                        fieldOfficerId:
                            session.fieldOfficerId,

                        fieldOfficerName:
                            session.fieldOfficerName,

                        clusterName:
                            session.clusterName,

                        lga:
                            session.lga,

                        community:
                            session.community,

                        venue:
                            session.venue,

                        expectedCollectors,

                        recordedCollectors,

                        trainingStatus,
                    };
                }
            );

        return NextResponse.json({
            success: true,
            sessions:
                formattedSessions,
        });
    } catch (error) {
        console.error(
            "[TRAINING] Training sessions retrieval error:",
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
