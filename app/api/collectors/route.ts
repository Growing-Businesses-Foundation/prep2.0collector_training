import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/auth-utils";
import { logActivity } from "@/lib/audit";

export async function POST(request: Request) {
    const { user, error } = await requireRole(["ADMIN", "WRITE"]);

    if (error) {
        return error;
    }

    try {
        const body = await request.json();

        const {
            trainingSessionId,
            fullName,
            gender,
            phoneNumber,
            newlyRecruited,
        } = body;

        // Validate required fields
        if (!trainingSessionId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Training session is required.",
                },
                { status: 400 }
            );
        }

        if (!fullName?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Collector full name is required.",
                },
                { status: 400 }
            );
        }

        if (!gender) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Gender is required.",
                },
                { status: 400 }
            );
        }

        if (!phoneNumber) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Phone number is required.",
                },
                { status: 400 }
            );
        }

        if (!newlyRecruited) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Please indicate whether the collector is newly recruited.",
                },
                { status: 400 }
            );
        }

        // Validate training session ID
        if (!ObjectId.isValid(trainingSessionId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid training session ID.",
                },
                { status: 400 }
            );
        }

        // Validate Nigerian phone number
        const phoneRegex = /^0[789][01]\d{8}$/;

        if (!phoneRegex.test(phoneNumber)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Enter a valid Nigerian mobile number.",
                },
                { status: 400 }
            );
        }

        // Normalize values for duplicate detection
        const normalizedName = fullName
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase()

        const normalizedPhone = phoneNumber.trim();

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // Check that the training session exists
        const trainingSession = await db
            .collection("training_sessions")
            .findOne({
                _id: new ObjectId(trainingSessionId),
            });

        if (!trainingSession) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Training session not found.",
                },
                { status: 404 }
            );
        }

        // WRITE users can only add collectors to their own training sessions
        if (
            user.role === "WRITE" &&
            trainingSession.fieldOfficerId !== user.foId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "You do not have permission to add collectors to this training session.",
                },
                { status: 403 }
            );
        }

        // Prevent duplicate collectors
        const existingCollector = await db
            .collection("collectors")
            .findOne({
                normalizedName,
                normalizedPhone,
            });

        if (existingCollector) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "A collector with the same name and phone number already exists.",
                },
                { status: 409 }
            );
        }

        // Count collectors already recorded
        const recordedCollectors = await db
            .collection("collectors")
            .countDocuments({
                trainingSessionId: new ObjectId(trainingSessionId),
            });

        // Prevent recording more collectors than expected
        if (
            recordedCollectors >=
            Number(trainingSession.expectedCollectors || 0)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "All expected collectors have already been recorded for this training session.",
                },
                { status: 400 }
            );
        }

        // Save collector
        try {
            const result = await db.collection("collectors").insertOne({
                trainingSessionId: new ObjectId(trainingSessionId),
                fullName: fullName.trim(),
                gender,
                phoneNumber: normalizedPhone,
                newlyRecruited,
                normalizedName,
                normalizedPhone,
                createdAt: new Date(),
            });

            await logActivity({
                userId: user.id,
                userName: user.name ?? undefined,
                userEmail: user.email ?? undefined,
                action: "COLLECTOR_CREATED",
                resource: "collector",
                resourceId: result.insertedId.toString(),
                description: `Added collector to training session ${trainingSessionId}`,
                metadata: {
                    trainingSessionId,
                    gender,
                    newlyRecruited,
                },
            });

            /*
             * Automatically update training status
             * based on the number of collectors recorded.
             */
            const newRecordedCollectors = recordedCollectors + 1;
            const expectedCollectors = Number(
                trainingSession.expectedCollectors || 0
            );

            let trainingStatus: "Not Started" | "In Progress" | "Completed";

            if (newRecordedCollectors >= expectedCollectors) {
                trainingStatus = "Completed";
            } else if (newRecordedCollectors > 0) {
                trainingStatus = "In Progress";
            } else {
                trainingStatus = "Not Started";
            }

            await db.collection("training_sessions").updateOne(
                {
                    _id: new ObjectId(trainingSessionId),
                },
                {
                    $set: {
                        trainingStatus,
                        updatedAt: new Date(),
                    },
                }
            );

            return NextResponse.json({
                success: true,
                message: "Collector recorded successfully.",
                collectorId: result.insertedId.toString(),
                trainingStatus,
                recordedCollectors: newRecordedCollectors,
            });
        } catch (insertError) {
            // Database-level duplicate protection
            if (
                insertError &&
                typeof insertError === "object" &&
                "code" in insertError &&
                insertError.code === 11000
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "A collector with the same name and phone number already exists.",
                    },
                    { status: 409 }
                );
            }

            throw insertError;
        }
    } catch (error) {
        console.error("Collector creation error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to record collector.",
            },
            { status: 500 }
        );
    }
}
