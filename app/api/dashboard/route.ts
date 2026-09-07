import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized.",
            },
            { status: 401 }
        );
    }

    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const isAdmin = session.user.role === "ADMIN";
        const isReadOnly = session.user.role === "READ_ONLY";

        // WRITE users only see their own training sessions.
        // ADMIN and READ_ONLY users see all sessions.
        const sessionQuery =
            isAdmin || isReadOnly
                ? {}
                : { fieldOfficerId: session.user.foId };

        // --------------------------------------------------
        // Training session statistics
        // --------------------------------------------------

        const totalTrainingSessions = await db
            .collection("training_sessions")
            .countDocuments(sessionQuery);

        const completedTrainingSessions = await db
            .collection("training_sessions")
            .countDocuments({
                ...sessionQuery,
                trainingStatus: "Completed",
            });

        const trainingSessions = await db
            .collection("training_sessions")
            .find(sessionQuery)
            .project({
                _id: 1,
                expectedCollectors: 1,
            })
            .toArray();

        const totalExpectedCollectors = trainingSessions.reduce(
            (total, training) =>
                total + Number(training.expectedCollectors || 0),
            0
        );

        // --------------------------------------------------
        // Collector statistics
        // --------------------------------------------------

        const trainingSessionIds = trainingSessions.map(
            (training) => training._id
        );

        const collectorQuery =
            isAdmin || isReadOnly
                ? {}
                : {
                    trainingSessionId: {
                        $in: trainingSessionIds,
                    },
                };

        const totalCollectors = await db
            .collection("collectors")
            .countDocuments(collectorQuery);

        const totalNewlyRecruitedCollectors = await db
            .collection("collectors")
            .countDocuments({
                ...collectorQuery,
                newlyRecruited: "Yes",
            });

        const maleCollectors = await db
            .collection("collectors")
            .countDocuments({
                ...collectorQuery,
                gender: "Male",
            });

        const femaleCollectors = await db
            .collection("collectors")
            .countDocuments({
                ...collectorQuery,
                gender: "Female",
            });

        // --------------------------------------------------
        // Completion rate
        // --------------------------------------------------

        const completionRate =
            totalExpectedCollectors > 0
                ? (totalCollectors / totalExpectedCollectors) * 100
                : 0;

        // --------------------------------------------------
        // Recent training sessions
        // --------------------------------------------------

        const recentTrainings = await db
            .collection("training_sessions")
            .find(sessionQuery)
            .sort({
                trainingDate: -1,
                createdAt: -1,
            })
            .limit(10)
            .project({
                _id: 1,
                trainingDate: 1,
                fieldOfficerName: 1,
                clusterName: 1,
                lga: 1,
                community: 1,
                expectedCollectors: 1,
                trainingStatus: 1,
            })
            .toArray();

        // Get collector counts for recent sessions
        const recentSessionIds = recentTrainings.map(
            (training) => training._id
        );

        const recentCollectorCounts = await db
            .collection("collectors")
            .aggregate([
                {
                    $match: {
                        trainingSessionId: {
                            $in: recentSessionIds,
                        },
                    },
                },
                {
                    $group: {
                        _id: "$trainingSessionId",
                        count: { $sum: 1 },
                    },
                },
            ])
            .toArray();

        const collectorCountMap = new Map(
            recentCollectorCounts.map((item) => [
                item._id.toString(),
                item.count,
            ])
        );

        return NextResponse.json({
            success: true,

            stats: {
                totalTrainingSessions,
                completedTrainingSessions,
                totalExpectedCollectors,
                totalCollectors,
                totalNewlyRecruitedCollectors,
                maleCollectors,
                femaleCollectors,
                completionRate: Number(completionRate.toFixed(1)),
            },

            recentTrainings: recentTrainings.map((training) => ({
                id: training._id.toString(),
                trainingDate: training.trainingDate,
                fieldOfficerName: training.fieldOfficerName,
                clusterName: training.clusterName,
                lga: training.lga,
                community: training.community,
                expectedCollectors: Number(
                    training.expectedCollectors || 0
                ),
                recordedCollectors:
                    collectorCountMap.get(
                        training._id.toString()
                    ) || 0,
                trainingStatus: training.trainingStatus,
            })),
        });
    } catch (error) {
        console.error("Dashboard error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load dashboard data.",
            },
            { status: 500 }
        );
    }
}