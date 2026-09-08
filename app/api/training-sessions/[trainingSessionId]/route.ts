import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/auth-utils";
import { uploadTrainingPhoto } from "@/lib/google-drive";
import { logActivity } from "@/lib/audit";

interface RouteContext {
    params: Promise<{
        trainingSessionId: string;
    }>;
}

export async function PUT(
    request: Request,
    context: RouteContext
) {
    const { user, error } = await requireRole([
        "ADMIN",
        "WRITE",
    ]);

    if (error) return error;

    try {
        const { trainingSessionId } = await context.params;

        if (!ObjectId.isValid(trainingSessionId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid training session ID.",
                },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const sessionId = new ObjectId(trainingSessionId);

        const existingSession =
            await db.collection("training_sessions").findOne({
                _id: sessionId,
            });

        if (!existingSession) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Training session not found.",
                },
                { status: 404 }
            );
        }

        /*
         * WRITE users can only edit training sessions
         * belonging to their assigned Field Officer.
         */
        if (
            user.role === "WRITE" &&
            existingSession.fieldOfficerId !== user.foId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "You do not have permission to edit this training session.",
                },
                { status: 403 }
            );
        }

        const formData = await request.formData();

        const trainingDate = formData
            .get("trainingDate")
            ?.toString()
            .trim();

        const fieldOfficerId = formData
            .get("fieldOfficerId")
            ?.toString()
            .trim();

        const clusterName = formData
            .get("clusterName")
            ?.toString()
            .trim();

        const lga = formData
            .get("lga")
            ?.toString()
            .trim();

        const community = formData
            .get("community")
            ?.toString()
            .trim();

        const venue = formData
            .get("venue")
            ?.toString()
            .trim();

        const facilitator = formData
            .get("facilitator")
            ?.toString()
            .trim();

        const expectedCollectors = formData
            .get("expectedCollectors")
            ?.toString()
            .trim();

        const latitude = formData
            .get("latitude")
            ?.toString()
            .trim();

        const longitude = formData
            .get("longitude")
            ?.toString()
            .trim();

        const photo = formData.get("photo");

        /*
         * Basic required-field validation.
         */
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

        /*
         * Determine the Field Officer.
         *
         * WRITE:
         * Always keep the Field Officer assigned to
         * the logged-in user's account.
         *
         * ADMIN:
         * Can keep the existing Field Officer or
         * change it to another active Field Officer.
         */
        let assignedFieldOfficerId: string;
        let fieldOfficerName: string;

        if (user.role === "WRITE") {
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

            assignedFieldOfficerId = String(user.foId).trim();

            fieldOfficerName =
                user.name || "Field Officer";
        } else {
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

            assignedFieldOfficerId = fieldOfficerId;

            /*
             * If the ADMIN is keeping the same Field Officer
             * already assigned to this training session, do not
             * require that Field Officer to still be active.
             *
             * This allows historical training records to remain
             * editable even if the Field Officer has since been
             * deactivated.
             */
            if (
                assignedFieldOfficerId ===
                existingSession.fieldOfficerId
            ) {
                fieldOfficerName =
                    existingSession.fieldOfficerName ||
                    "Field Officer";
            } else {
                /*
                 * The ADMIN is assigning a different Field Officer.
                 *
                 * A new Field Officer must exist and be active.
                 */
                const fieldOfficer =
                    await db
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

                fieldOfficerName =
                    fieldOfficer.name;
            }
        }

        /*
         * Validate expected collectors.
         */
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

        /*
         * Validate coordinates.
         */
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

        /*
         * Photo is optional during editing.
         *
         * If no new photo is supplied, the existing
         * Google Drive photo remains unchanged.
         */
        let photoFileId =
            existingSession.photoFileId || null;

        let photoUrl =
            existingSession.photoUrl || null;

        if (photo instanceof File) {
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

            if (photo.size > 3 * 1024 * 1024) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Training photo must be less than 3MB.",
                    },
                    { status: 400 }
                );
            }

            const photoBuffer = Buffer.from(
                await photo.arrayBuffer()
            );

            const safeFieldOfficerName =
                fieldOfficerName
                    .replace(
                        /[^a-zA-Z0-9]+/g,
                        "-"
                    )
                    .replace(
                        /^-|-$/g,
                        ""
                    );

            const safePhotoName =
                photo.name.replace(
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

            photoFileId = uploadedPhoto.id;
            photoUrl =
                uploadedPhoto.webViewLink ||
                null;
        }

        const now = new Date();

        await db
            .collection("training_sessions")
            .updateOne(
                { _id: sessionId },
                {
                    $set: {
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
                        latitude:
                            latitudeNumber,
                        longitude:
                            longitudeNumber,
                        photoFileId,
                        photoUrl,
                        updatedAt: now,
                    },
                }
            );

        await logActivity({
            userId: user.id,
            userName:
                user.name ?? undefined,
            userEmail:
                user.email ?? undefined,
            action: "TRAINING_UPDATED",
            resource: "training_session",
            resourceId:
                trainingSessionId,
            description:
                `Updated training session for ${fieldOfficerName} - ${clusterName}`,
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
                photoReplaced:
                    photo instanceof File,
            },
        });

        return NextResponse.json({
            success: true,
            message:
                "Training session updated successfully.",
            trainingSessionId,
        });
    } catch (error) {
        console.error(
            "[TRAINING] Training session update error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to update training session.",
            },
            { status: 500 }
        );
    }
}
