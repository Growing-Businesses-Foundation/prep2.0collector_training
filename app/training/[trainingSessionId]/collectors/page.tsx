import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ObjectId } from "mongodb";

import { authOptions } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";
import BackButton from "@/components/navigation/BackButton";
import clientPromise from "@/lib/mongodb";

interface PageProps {
    params: Promise<{
        trainingSessionId: string;
    }>;
}

export default async function TrainingSessionCollectorsPage({
    params,
}: PageProps) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const { trainingSessionId } = await params;

    if (!ObjectId.isValid(trainingSessionId)) {
        notFound();
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const trainingSession = await db
        .collection("training_sessions")
        .findOne({
            _id: new ObjectId(trainingSessionId),
        });

    if (!trainingSession) {
        notFound();
    }

    // WRITE users can only access their own training sessions.
    if (
        session.user.role === "WRITE" &&
        trainingSession.fieldOfficerId !== session.user.foId
    ) {
        redirect("/training");
    }

    const collectors = await db
        .collection("collectors")
        .find({
            trainingSessionId: new ObjectId(trainingSessionId),
        })
        .sort({
            createdAt: 1,
        })
        .toArray();

    const expectedCollectors = Number(
        trainingSession.expectedCollectors || 0
    );

    const recordedCollectors = collectors.length;

    const remainingCollectors = Math.max(
        expectedCollectors - recordedCollectors,
        0
    );

    const progress =
        expectedCollectors > 0
            ? Math.min(
                (recordedCollectors / expectedCollectors) * 100,
                100
            )
            : 0;

    const trainingStatus =
        recordedCollectors === 0
            ? "Not Started"
            : recordedCollectors >= expectedCollectors
                ? "Completed"
                : "In Progress";

    const isCompleted = trainingStatus === "Completed";

    return (
        <AppShell role={session.user.role}>
            <div className="min-h-full px-4 py-6 sm:px-6 sm:py-8">
                <div className="mx-auto max-w-7xl">
                    {/* Back */}
                    <div className="mb-6">
                        <BackButton label="Back to Training Sessions" />
                    </div>

                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Collector Training
                            </p>

                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                Training Session
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                View training details and manage recorded
                                collectors.
                            </p>
                        </div>

                        {!isCompleted &&
                            session.user.role !== "READ_ONLY" && (
                                <Link
                                    href={`/collectors/new?trainingSessionId=${trainingSessionId}`}
                                    className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                                >
                                    + Add Collector
                                </Link>
                            )}
                    </div>

                    {/* Training Overview */}
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Training Status
                            </p>

                            <div className="mt-3">
                                <span
                                    className={`inline-flex rounded-full px-3 py-1.5 text-sm font-medium ${trainingStatus === "Completed"
                                        ? "bg-green-50 text-green-700"
                                        : trainingStatus === "In Progress"
                                            ? "bg-blue-50 text-blue-700"
                                            : "bg-yellow-50 text-yellow-700"
                                        }`}
                                >
                                    {trainingStatus}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Expected Collectors
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {expectedCollectors}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Recorded Collectors
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {recordedCollectors}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Remaining
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {remainingCollectors}
                            </p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Collector Progress
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    {recordedCollectors} of{" "}
                                    {expectedCollectors} collectors recorded
                                </p>
                            </div>

                            <p className="text-sm font-semibold text-gray-900">
                                {Math.round(progress)}%
                            </p>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-gray-900 transition-all"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>

                        {isCompleted && (
                            <div className="mt-4 rounded-lg bg-green-50 px-4 py-3">
                                <p className="text-sm font-medium text-green-800">
                                    Training completed successfully. All
                                    expected collectors have been recorded.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Training Details */}
                    <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-5 py-4">
                            <h2 className="text-base font-semibold text-gray-900">
                                Training Information
                            </h2>
                        </div>

                        <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Training Date
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {new Date(
                                        trainingSession.trainingDate
                                    ).toLocaleDateString("en-NG", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Field Officer
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {trainingSession.fieldOfficerId}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    {trainingSession.fieldOfficerName}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Cluster
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {trainingSession.clusterName}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    LGA
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {trainingSession.lga}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Community
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {trainingSession.community}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Training Venue
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {trainingSession.venue}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Facilitator
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {trainingSession.facilitator}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Latitude
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {trainingSession.latitude}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Longitude
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {trainingSession.longitude}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Collectors */}
                    <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    Recorded Collectors
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Collectors recorded for this training
                                    session.
                                </p>
                            </div>

                            <p className="text-sm font-semibold text-gray-900">
                                {recordedCollectors} / {expectedCollectors}
                            </p>
                        </div>

                        {collectors.length === 0 ? (
                            <div className="px-5 py-12 text-center">
                                <p className="text-sm font-semibold text-gray-900">
                                    No collectors recorded yet.
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Add the first collector to begin
                                    recording this training session.
                                </p>

                                {!isCompleted &&
                                    session.user.role !== "READ_ONLY" && (
                                        <Link
                                            href={`/collectors/new?trainingSessionId=${trainingSessionId}`}
                                            className="mt-5 inline-flex rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                                        >
                                            + Add Collector
                                        </Link>
                                    )}
                            </div>
                        ) : (
                            <>
                                <div className="hidden max-h-[calc(100vh-420px)] overflow-y-auto overflow-x-auto overscroll-contain md:block">
                                    <table className="w-full text-left">
                                        <thead className="border-b border-gray-200 bg-gray-50">
                                            <tr>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    #
                                                </th>

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
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {collectors.map(
                                                (collector, index) => (
                                                    <tr
                                                        key={collector._id.toString()}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-5 py-4 text-sm text-gray-500">
                                                            {index + 1}
                                                        </td>

                                                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                                                            {
                                                                collector.fullName
                                                            }
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
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="max-h-[calc(100vh-380px)] divide-y divide-gray-100 overflow-y-auto overscroll-contain md:hidden">
                                    {collectors.map(
                                        (collector, index) => (
                                            <div
                                                key={collector._id.toString()}
                                                className="p-5"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex gap-3">
                                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                                                            {index + 1}
                                                        </span>

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
                                                            Collector #
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                            {index + 1}
                                                        </p>
                                                    </div>
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