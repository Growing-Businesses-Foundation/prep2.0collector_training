import clientPromise from "@/lib/mongodb";

interface TrainingSession {
    _id: {
        toString(): string;
    };
    trainingDate: Date | string;
    fieldOfficerId?: string;
    clusterName?: string;
    lga?: string;
    community?: string;
    expectedCollectors?: number;
    trainingStatus?: string;
    createdAt?: Date | string;
}

interface TrainingSessionWithStatus extends TrainingSession {
    expectedCollectors: number;
    recordedCollectors: number;
    trainingStatus: "Not Started" | "In Progress" | "Completed";
}

export async function getDashboardData(
    role: "ADMIN" | "WRITE" | "READ_ONLY",
    foId?: string
) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const isAdmin = role === "ADMIN";
    const isReadOnly = role === "READ_ONLY";

    // WRITE users only see their own FO data.
    // ADMIN and READ_ONLY users see everything.
    const sessionQuery =
        isAdmin || isReadOnly
            ? {}
            : { fieldOfficerId: foId };

    // --------------------------------------------------
    // TRAINING SESSIONS
    // --------------------------------------------------

    const trainingSessions =
        (await db
            .collection("training_sessions")
            .find(sessionQuery)
            .project({
                _id: 1,
                trainingDate: 1,
                fieldOfficerId: 1,
                fieldOfficerName: 1,
                clusterName: 1,
                lga: 1,
                community: 1,
                expectedCollectors: 1,
                trainingStatus: 1,
                createdAt: 1,
            })
            .sort({
                trainingDate: -1,
                createdAt: -1,
            })
            .toArray()) as unknown as TrainingSession[];

    const trainingSessionIds = trainingSessions.map(
        (training) => training._id
    );

    // --------------------------------------------------
    // COLLECTOR COUNTS PER TRAINING SESSION
    // --------------------------------------------------

    const collectorCounts = await db
        .collection("collectors")
        .aggregate([
            {
                $match: {
                    trainingSessionId: {
                        $in: trainingSessionIds,
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

    const collectorCountMap = new Map<string, number>(
        collectorCounts.map((item) => [
            item._id.toString(),
            Number(item.count),
        ])
    );

    // --------------------------------------------------
    // CALCULATE TRAINING STATUS
    // --------------------------------------------------

    const sessionsWithStatus: TrainingSessionWithStatus[] =
        trainingSessions.map((training) => {
            const expectedCollectors = Number(
                training.expectedCollectors || 0
            );

            const recordedCollectors =
                collectorCountMap.get(
                    training._id.toString()
                ) || 0;

            let trainingStatus: TrainingSessionWithStatus["trainingStatus"];

            if (recordedCollectors === 0) {
                trainingStatus = "Not Started";
            } else if (
                expectedCollectors > 0 &&
                recordedCollectors >= expectedCollectors
            ) {
                trainingStatus = "Completed";
            } else {
                trainingStatus = "In Progress";
            }

            return {
                ...training,
                expectedCollectors,
                recordedCollectors,
                trainingStatus,
            };
        });

    // --------------------------------------------------
    // TRAINING SESSION STATISTICS
    // --------------------------------------------------

    const totalTrainingSessions =
        sessionsWithStatus.length;


    const totalExpectedCollectors =
        sessionsWithStatus.reduce(
            (total, training) =>
                total + training.expectedCollectors,
            0
        );

    // --------------------------------------------------
    // COLLECTOR STATISTICS
    // --------------------------------------------------

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

    const totalNewlyRecruitedCollectors =
        await db
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
    // COMPLETION RATE
    // --------------------------------------------------

    const completionRate =
        totalExpectedCollectors > 0
            ? (totalCollectors / totalExpectedCollectors) *
            100
            : 0;

    // --------------------------------------------------
    // RECENT TRAINING SESSIONS
    // --------------------------------------------------

    const recentTrainings = sessionsWithStatus
        .slice(0, 10)
        .map((training) => ({
            id: training._id.toString(),
            trainingDate: new Date(
                training.trainingDate
            ).toISOString(),
            fieldOfficerId:
                training.fieldOfficerId || "",
            clusterName:
                training.clusterName || "",
            lga: training.lga || "",
            community:
                training.community || "",
            expectedCollectors:
                training.expectedCollectors,
            recordedCollectors:
                training.recordedCollectors,
            trainingStatus:
                training.trainingStatus,
        }));

    // --------------------------------------------------
    // RETURN DASHBOARD DATA
    // --------------------------------------------------

    return {
        stats: {
            totalTrainingSessions,
            totalExpectedCollectors,
            totalCollectors,
            totalNewlyRecruitedCollectors,
            maleCollectors,
            femaleCollectors,
            completionRate: Number(
                completionRate.toFixed(1)
            ),
        },

        recentTrainings,
    };
}