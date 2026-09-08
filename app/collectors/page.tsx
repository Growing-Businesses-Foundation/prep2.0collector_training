import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";
import CollectorFilters from "@/components/collectors/CollectorFilters";
import clientPromise from "@/lib/mongodb";

interface CollectorsPageProps {
    searchParams?: Promise<{
        search?: string;
        gender?: string;
        recruited?: string;
        fieldOfficer?: string;
        lga?: string;
        cluster?: string;
        fromDate?: string;
        toDate?: string;
    }>;
}

export default async function CollectorsPage({
    searchParams,
}: CollectorsPageProps) {
    const session =
        await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const params =
        await searchParams;

    const search =
        params?.search?.trim() || "";

    const gender =
        params?.gender?.trim() || "";

    const recruited =
        params?.recruited?.trim() || "";

    const fieldOfficer =
        params?.fieldOfficer?.trim() || "";

    const lga =
        params?.lga?.trim() || "";

    const cluster =
        params?.cluster?.trim() || "";

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
     * TRAINING SESSION ACCESS
     * ------------------------------------------------------------
     *
     * ADMIN / READ_ONLY:
     *   Can see all training sessions.
     *
     * WRITE:
     *   Can only see their own training sessions.
     */

    const trainingQuery: Record<
        string,
        unknown
    > =
        session.user.role === "WRITE"
            ? {
                fieldOfficerId:
                    session.user.foId,
            }
            : {};

    /*
     * Field Officer filter
     *
     * WRITE users cannot use the URL to access
     * another Field Officer's collectors.
     */
    if (
        session.user.role !== "WRITE" &&
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

        trainingQuery.trainingDate =
            dateQuery;
    }

    /*
     * ------------------------------------------------------------
     * GET TRAINING SESSIONS
     * ------------------------------------------------------------
     */

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
     * GET COLLECTORS
     * ------------------------------------------------------------
     */

    const collectorQuery: Record<
        string,
        unknown
    > = {
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
     * COMBINE COLLECTOR + TRAINING DATA
     * ------------------------------------------------------------
     */

    const collectorRecords =
        collectors.map(
            (collector) => {
                const training =
                    trainingMap.get(
                        collector.trainingSessionId.toString()
                    );

                return {
                    id: collector._id.toString(),

                    fullName:
                        collector.fullName,

                    gender:
                        collector.gender,

                    phoneNumber:
                        collector.phoneNumber,

                    newlyRecruited:
                        collector.newlyRecruited,

                    trainingSessionId:
                        collector.trainingSessionId.toString(),

                    trainingDate:
                        training?.trainingDate ||
                        null,

                    fieldOfficerId:
                        training?.fieldOfficerId ||
                        "—",

                    clusterName:
                        training?.clusterName ||
                        "—",

                    lga:
                        training?.lga ||
                        "—",

                    community:
                        training?.community ||
                        "—",
                };
            }
        );

    /*
     * ------------------------------------------------------------
     * SUMMARY
     * ------------------------------------------------------------
     */

    const totalCollectors =
        collectorRecords.length;

    const newlyRecruitedCollectors =
        collectorRecords.filter(
            (collector) =>
                collector.newlyRecruited ===
                "Yes"
        ).length;

    const maleCollectors =
        collectorRecords.filter(
            (collector) =>
                collector.gender ===
                "Male"
        ).length;

    const femaleCollectors =
        collectorRecords.filter(
            (collector) =>
                collector.gender ===
                "Female"
        ).length;

    /*
     * ------------------------------------------------------------
     * FILTER OPTIONS
     * ------------------------------------------------------------
     *
     * These are based on the user's permitted
     * training sessions.
     */

    const fieldOfficers =
        Array.from(
            new Set(
                trainingSessions
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
                trainingSessions
                    .map(
                        (training) =>
                            training.lga
                    )
                    .filter(Boolean)
                    .map(String)
            )
        ).sort();

    const clusters =
        Array.from(
            new Set(
                trainingSessions
                    .map(
                        (training) =>
                            training.clusterName
                    )
                    .filter(Boolean)
                    .map(String)
            )
        ).sort();

    return (
        <AppShell
            role={session.user.role}
        >
            <div className="min-h-full px-4 py-6 sm:px-6 sm:py-8">
                <div className="mx-auto w-full max-w-7xl">

                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Collector Training
                            </p>

                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                Collectors
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                View collectors recorded during
                                training sessions.
                            </p>
                        </div>

                        {session.user.role !==
                            "READ_ONLY" && (
                                <a
                                    href="/collectors/new"
                                    className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                                >
                                    + Add Collector
                                </a>
                            )}
                    </div>

                    {/* Filters */}
                    <CollectorFilters
                        fieldOfficers={
                            fieldOfficers
                        }
                        lgas={lgas}
                        clusters={
                            clusters
                        }
                    />

                    {/* Summary */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Total Collectors
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {
                                    totalCollectors
                                }
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Female
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {
                                    femaleCollectors
                                }
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Male
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {
                                    maleCollectors
                                }
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Newly Recruited
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {
                                    newlyRecruitedCollectors
                                }
                            </p>
                        </div>
                    </div>

                    {/* Collector Table */}
                    <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                        {collectorRecords.length ===
                            0 ? (
                            <div className="px-5 py-12 text-center">
                                <p className="text-sm font-semibold text-gray-900">
                                    No collectors found.
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Try changing your
                                    filters or add a
                                    new collector.
                                </p>

                                {session.user.role !==
                                    "READ_ONLY" && (
                                        <a
                                            href="/collectors/new"
                                            className="mt-5 inline-flex rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                                        >
                                            Add Collector
                                        </a>
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
                                                    Collector
                                                </th>

                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Gender
                                                </th>

                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Phone
                                                </th>

                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Newly Recruited
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
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {collectorRecords.map(
                                                (
                                                    collector
                                                ) => (
                                                    <tr
                                                        key={
                                                            collector.id
                                                        }
                                                        className="transition hover:bg-gray-50"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {
                                                                    collector.fullName
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {collector.trainingDate
                                                                    ? new Date(
                                                                        collector.trainingDate
                                                                    ).toLocaleDateString(
                                                                        "en-NG",
                                                                        {
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                        }
                                                                    )
                                                                    : "—"}
                                                            </p>
                                                        </td>

                                                        <td className="px-5 py-4 text-sm text-gray-700">
                                                            {
                                                                collector.gender
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4 text-sm text-gray-700">
                                                            {
                                                                collector.phoneNumber
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${collector.newlyRecruited ===
                                                                    "Yes"
                                                                    ? "bg-green-50 text-green-700"
                                                                    : "bg-gray-100 text-gray-600"
                                                                    }`}
                                                            >
                                                                {
                                                                    collector.newlyRecruited
                                                                }
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                                                            {
                                                                collector.fieldOfficerId
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                                            {
                                                                collector.clusterName
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <p className="text-sm text-gray-900">
                                                                {
                                                                    collector.community
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {
                                                                    collector.lga
                                                                }
                                                            </p>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile */}
                                <div className="max-h-[calc(100vh-380px)] divide-y divide-gray-100 overflow-y-auto overscroll-contain md:hidden">
                                    {collectorRecords.map(
                                        (
                                            collector
                                        ) => (
                                            <div
                                                key={
                                                    collector.id
                                                }
                                                className="p-5"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {
                                                                collector.fullName
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {
                                                                collector.phoneNumber
                                                            }
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${collector.newlyRecruited ===
                                                            "Yes"
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-gray-100 text-gray-600"
                                                            }`}
                                                    >
                                                        {
                                                            collector.newlyRecruited
                                                        }
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Gender
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                            {
                                                                collector.gender
                                                            }
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            FO ID
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                            {
                                                                collector.fieldOfficerId
                                                            }
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Cluster
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                            {
                                                                collector.clusterName
                                                            }
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Community
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                            {
                                                                collector.community
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="mt-4 text-xs text-gray-500">
                                                    Training date:{" "}
                                                    {collector.trainingDate
                                                        ? new Date(
                                                            collector.trainingDate
                                                        ).toLocaleDateString(
                                                            "en-NG",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            }
                                                        )
                                                        : "—"}
                                                </p>
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
