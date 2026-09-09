//app/training/page.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";


import { authOptions } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";
import TrainingFilters from "@/components/training/TrainingFilters";
import clientPromise from "@/lib/mongodb";
import DashboardAutoRefresh from "@/components/dashboard/DashboardAutoRefresh";
import TrainingExportButton from "@/components/training/TrainingExportButton";


interface TrainingSessionsPageProps {
    searchParams?: Promise<{
        search?: string;
        fieldOfficer?: string;
        lga?: string;
        status?: string;
        fromDate?: string;
        toDate?: string;
    }>;
}

export default async function TrainingSessionsPage({
    searchParams,
}: TrainingSessionsPageProps) {
    const session =
        await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const params =
        await searchParams;

    const search =
        params?.search?.trim() || "";

    const fieldOfficer =
        params?.fieldOfficer?.trim() || "";

    const lga =
        params?.lga?.trim() || "";

    const status =
        params?.status?.trim() || "";

    const fromDate =
        params?.fromDate?.trim() || "";

    const toDate =
        params?.toDate?.trim() || "";

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

    const query: Record<string, unknown> =
        session.user.role === "WRITE"
            ? {
                fieldOfficerId:
                    session.user.foId,
            }
            : {};

    /*
     * Cluster search
     */
    if (search) {
        query.clusterName = {
            $regex: search,
            $options: "i",
        };
    }

    /*
     * Field Officer filter
     *
     * WRITE users must always remain restricted
     * to their own Field Officer ID.
     */
    if (
        session.user.role !== "WRITE" &&
        fieldOfficer
    ) {
        query.fieldOfficerId =
            fieldOfficer;
    }

    /*
     * LGA filter
     */
    if (lga) {
        query.lga = {
            $regex: `^${lga}$`,
            $options: "i",
        };
    }

    /*
     * Date filtering
     *
     * trainingDate is stored as YYYY-MM-DD,
     * so string comparison works correctly.
     */
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
                expectedCollectors: 1,
                trainingStatus: 1,
            })
            .toArray();

    /*
     * ------------------------------------------------------------
     * COLLECTOR COUNTS
     * ------------------------------------------------------------
     */

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
                            trainingSessionId:
                            {
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

    /*
     * ------------------------------------------------------------
     * CALCULATE TRAINING STATUS
     * ------------------------------------------------------------
     */

    let trainingSessions =
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
                    id: training._id.toString(),
                    trainingDate:
                        training.trainingDate,
                    fieldOfficerId:
                        training.fieldOfficerId,
                    clusterName:
                        training.clusterName,
                    lga: training.lga,
                    community:
                        training.community,
                    expectedCollectors,
                    recordedCollectors,
                    trainingStatus,
                };
            }
        );

    /*
     * ------------------------------------------------------------
     * STATUS FILTER
     *
     * Status is calculated from collector counts,
     * so it must be filtered after that calculation.
     * ------------------------------------------------------------
     */

    if (status) {
        trainingSessions =
            trainingSessions.filter(
                (training) =>
                    training.trainingStatus ===
                    status
            );
    }

    /*
     * ------------------------------------------------------------
     * FILTER OPTIONS
     *
     * These are restricted for WRITE users to their
     * own training sessions.
     * ------------------------------------------------------------
     */

    const fieldOfficers =
        Array.from(
            new Set(
                trainings
                    .map(
                        (training) =>
                            training.fieldOfficerId
                    )
                    .filter(Boolean)
                    .map(String)
            )
        ).sort();

    const lgas =
        Array.from(
            new Set(
                trainings
                    .map(
                        (training) =>
                            training.lga
                    )
                    .filter(Boolean)
                    .map(String)
            )
        ).sort();

    /*
     * ------------------------------------------------------------
     * SUMMARY
     * ------------------------------------------------------------
     */

    const totalSessions =
        trainingSessions.length;

    const completedSessions =
        trainingSessions.filter(
            (training) =>
                training.trainingStatus ===
                "Completed"
        ).length;

    const inProgressSessions =
        trainingSessions.filter(
            (training) =>
                training.trainingStatus ===
                "In Progress"
        ).length;

    return (
        <AppShell
            role={session.user.role}
        >
            <DashboardAutoRefresh />
            <div className="min-h-full px-4 py-6 sm:px-6 sm:py-8">
                <div className="mx-auto w-full max-w-7xl">

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
                                View and manage
                                training sessions
                                recorded in the
                                system.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            {session.user.role !== "RESTRICTED_READ_ONLY" && (
                                <TrainingExportButton
                                    search={search}
                                    fieldOfficer={fieldOfficer}
                                    lga={lga}
                                    status={status}
                                    fromDate={fromDate}
                                    toDate={toDate}
                                />
                            )}                        


                            {(
                                session.user.role === "ADMIN" ||
                                session.user.role === "WRITE"
                            ) && (
                                    <Link
                                        href="/training/new"
                                        className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                                    >
                                        + New Training
                                    </Link>
                                )}
                        </div>
                    </div>

                    {/* Filters */}
                    <TrainingFilters
                        fieldOfficers={
                            fieldOfficers
                        }
                        lgas={lgas}
                    />

                    {/* Summary */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Total Sessions
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {
                                    totalSessions
                                }
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Completed
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {
                                    completedSessions
                                }
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                In Progress
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {
                                    inProgressSessions
                                }
                            </p>
                        </div>
                    </div>

                    {/* Training Sessions */}
                    <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                        {trainingSessions.length ===
                            0 ? (
                            <div className="px-5 py-12 text-center">
                                <p className="text-sm font-semibold text-gray-900">
                                    No training
                                    sessions found.
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Try changing
                                    your filters or
                                    create a new
                                    training session.
                                </p>

                                {(
                                    session.user.role === "ADMIN" ||
                                    session.user.role === "WRITE"
                                ) && (
                                        <Link
                                            href="/training/new"
                                            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                                        >
                                            Create Training
                                        </Link>
                                    )}
                            </div>
                        ) : (
                            <>
                                {/* Desktop */}
                                <div className="hidden max-h-[calc(100vh-420px)] overflow-y-auto overflow-x-auto overscroll-contain md:block">
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
                                                (
                                                    training
                                                ) => (
                                                    <tr
                                                        key={
                                                            training.id
                                                        }
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

                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Link
                                                                    href={`/training/${training.id}/collectors`}
                                                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                                                                >
                                                                    View
                                                                </Link>

                                                                {(
                                                                    session.user.role === "ADMIN" ||
                                                                    session.user.role === "WRITE"
                                                                ) && (
                                                                        <Link
                                                                            href={`/training/${training.id}/edit`}
                                                                            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                                                                        >
                                                                            Edit
                                                                        </Link>
                                                                    )}
                                                            </div>
                                                        </td>

                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile */}
                                <div className="max-h-[calc(100vh-380px)] overflow-y-auto overscroll-contain divide-y divide-gray-100 md:hidden">
                                    {trainingSessions.map(
                                        (
                                            training
                                        ) => (
                                            <div
                                                key={training.id}
                                                className="p-5 transition hover:bg-gray-50"
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
                                                            {
                                                                training.lga
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-5 flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/training/${training.id}/collectors`}
                                                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                                                    >
                                                        View
                                                    </Link>

                                                    {(
                                                        session.user.role === "ADMIN" ||
                                                        session.user.role === "WRITE"
                                                    ) && (
                                                            <Link
                                                                href={`/training/${training.id}/edit`}
                                                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                                                            >
                                                                Edit
                                                            </Link>
                                                        )}
                                                </div>

                                            </div>
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
