import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";
import clientPromise from "@/lib/mongodb";

export default async function TrainingSessionsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const query =
        session.user.role === "WRITE"
            ? { fieldOfficerId: session.user.foId }
            : {};

    const trainings = await db
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
            clusterName: 1,
            lga: 1,
            community: 1,
            expectedCollectors: 1,
            trainingStatus: 1,
        })
        .toArray();

    const sessionIds = trainings.map((training) => training._id);

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

    const collectorCountMap = new Map(
        collectorCounts.map((item) => [
            item._id.toString(),
            item.count,
        ])
    );

    const trainingSessions = trainings.map((training) => {
        const recordedCollectors =
            collectorCountMap.get(training._id.toString()) || 0;

        const expectedCollectors = Number(
            training.expectedCollectors || 0
        );

        let trainingStatus: string;

        if (recordedCollectors === 0) {
            trainingStatus = "Not Started";
        } else if (recordedCollectors >= expectedCollectors) {
            trainingStatus = "Completed";
        } else {
            trainingStatus = "In Progress";
        }

        return {
            id: training._id.toString(),
            trainingDate: training.trainingDate,
            fieldOfficerId: training.fieldOfficerId,
            clusterName: training.clusterName,
            lga: training.lga,
            community: training.community,
            expectedCollectors,
            recordedCollectors,
            trainingStatus,
        };
    });

    return (
        <AppShell role={session.user.role}>
            <div className="px-4 py-6 sm:px-6 sm:py-8">
                <div className="mx-auto max-w-7xl">

                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Collector Training
                            </p>

                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                Training Sessions
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                View and manage training sessions recorded
                                in the system.
                            </p>
                        </div>

                        {session.user.role !== "READ_ONLY" && (
                            <Link
                                href="/training/new"
                                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                + New Training
                            </Link>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Total Sessions
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {trainingSessions.length}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Completed
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {
                                    trainingSessions.filter(
                                        (training) =>
                                            training.trainingStatus ===
                                            "Completed"
                                    ).length
                                }
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                In Progress
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {
                                    trainingSessions.filter(
                                        (training) =>
                                            training.trainingStatus ===
                                            "In Progress"
                                    ).length
                                }
                            </p>
                        </div>
                    </div>

                    {/* Training Sessions */}
                    <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        {trainingSessions.length === 0 ? (
                            <div className="px-5 py-12 text-center">
                                <p className="text-sm font-semibold text-gray-900">
                                    No training sessions found.
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Create a training session to get
                                    started.
                                </p>

                                {session.user.role !== "READ_ONLY" && (
                                    <Link
                                        href="/training/new"
                                        className="mt-5 inline-flex rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                                    >
                                        Create Training
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Desktop */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full text-left">
                                        <thead className="border-b border-gray-200 bg-gray-50">
                                            <tr>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Date
                                                </th>

                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    FO ID
                                                </th>

                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Cluster
                                                </th>

                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Location
                                                </th>

                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Collectors
                                                </th>

                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Status
                                                </th>

                                                <th className="px-5 py-3"></th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {trainingSessions.map(
                                                (training) => (
                                                    <tr
                                                        key={training.id}
                                                        className="transition hover:bg-gray-50"
                                                    >
                                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                                                            {new Date(
                                                                training.trainingDate
                                                            ).toLocaleDateString(
                                                                "en-NG",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                }
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                                                            {
                                                                training.fieldOfficerId
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                                            {
                                                                training.clusterName
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <p className="text-sm text-gray-900">
                                                                {
                                                                    training.community
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {
                                                                    training.lga
                                                                }
                                                            </p>
                                                        </td>

                                                        <td className="px-5 py-4 text-sm">
                                                            <span className="font-semibold text-gray-900">
                                                                {
                                                                    training.recordedCollectors
                                                                }
                                                            </span>

                                                            <span className="text-gray-400">
                                                                {" "}
                                                                /{" "}
                                                            </span>

                                                            <span className="text-gray-500">
                                                                {
                                                                    training.expectedCollectors
                                                                }
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${training.trainingStatus ===
                                                                    "Completed"
                                                                    ? "bg-green-50 text-green-700"
                                                                    : training.trainingStatus ===
                                                                        "In Progress"
                                                                        ? "bg-blue-50 text-blue-700"
                                                                        : "bg-yellow-50 text-yellow-700"
                                                                    }`}
                                                            >
                                                                {
                                                                    training.trainingStatus
                                                                }
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-4 text-right">
                                                            <Link
                                                                href={`/training/${training.id}/collectors`}
                                                                className="text-sm font-medium text-gray-900 hover:underline"
                                                            >
                                                                View →
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile */}
                                <div className="divide-y divide-gray-100 md:hidden">
                                    {trainingSessions.map(
                                        (training) => (
                                            <Link
                                                key={training.id}
                                                href={`/training/${training.id}/collectors`}
                                                className="block p-5 transition hover:bg-gray-50"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {
                                                                training.clusterName
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {new Date(
                                                                training.trainingDate
                                                            ).toLocaleDateString(
                                                                "en-NG",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                }
                                                            )}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${training.trainingStatus ===
                                                            "Completed"
                                                            ? "bg-green-50 text-green-700"
                                                            : training.trainingStatus ===
                                                                "In Progress"
                                                                ? "bg-blue-50 text-blue-700"
                                                                : "bg-yellow-50 text-yellow-700"
                                                            }`}
                                                    >
                                                        {
                                                            training.trainingStatus
                                                        }
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            FO ID
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                            {
                                                                training.fieldOfficerId
                                                            }
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Collectors
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                            {
                                                                training.recordedCollectors
                                                            }{" "}
                                                            /{" "}
                                                            {
                                                                training.expectedCollectors
                                                            }
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Community
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                            {
                                                                training.community
                                                            }
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            LGA
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                            {training.lga}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 text-right text-sm font-medium text-gray-900">
                                                    View Training →
                                                </div>
                                            </Link>
                                        )
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}