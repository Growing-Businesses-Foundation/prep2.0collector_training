interface RecentTraining {
    id: string;
    trainingDate: string;
    fieldOfficerId: string;
    clusterName: string;
    lga: string;
    community: string;
    expectedCollectors: number;
    trainingStatus: string;
}

interface RecentTrainingsProps {
    trainings: RecentTraining[];
}

function CalendarIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
        >
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 2v4M8 2v4M3 10h18"
            />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
            />
            <circle cx="9" cy="7" r="4" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
            />
        </svg>
    );
}

function LocationIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1116 0z"
            />
            <circle cx="12" cy="10" r="2.5" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12l4 4L19 6"
            />
        </svg>
    );
}

function ProgressIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2"
            />
            <circle cx="12" cy="12" r="9" />
        </svg>
    );
}

function EmptyIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-7 w-7"
        >
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 2v4M8 2v4M3 10h18"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"
            />
        </svg>
    );
}

function getStatusStyles(status: string) {
    switch (status) {
        case "Completed":
            return {
                wrapper:
                    "border-green-100 bg-green-50 text-green-700",
                icon: "text-green-600",
                iconComponent: <CheckIcon />,
            };

        case "In Progress":
            return {
                wrapper:
                    "border-orange-100 bg-orange-50 text-orange-700",
                icon: "text-orange-500",
                iconComponent: <ProgressIcon />,
            };

        case "Not Started":
            return {
                wrapper:
                    "border-gray-200 bg-gray-50 text-gray-600",
                icon: "text-gray-400",
                iconComponent: <ProgressIcon />,
            };

        default:
            return {
                wrapper:
                    "border-gray-200 bg-gray-50 text-gray-600",
                icon: "text-gray-400",
                iconComponent: <ProgressIcon />,
            };
    }
}

export default function RecentTrainings({
    trainings,
}: RecentTrainingsProps) {
    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    return (
        <section className="mt-10 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Header */}
            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-7 w-1 shrink-0 rounded-full bg-green-600" />

                    <div>
                        <h2 className="text-lg font-bold tracking-tight text-gray-900">
                            Recent Training Sessions
                        </h2>

                        <p className="mt-1.5 text-sm text-gray-500">
                            Latest training activities recorded by field
                            officers.
                        </p>
                    </div>
                </div>
            </div>

            {trainings.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                        <EmptyIcon />
                    </div>

                    <p className="mt-5 text-sm font-semibold text-gray-900">
                        No training sessions yet
                    </p>

                    <p className="mt-1.5 max-w-sm text-sm leading-6 text-gray-500">
                        Training sessions will appear here once they are
                        recorded in the system.
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70">
                                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                                        Date
                                    </th>

                                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                                        Field Officer
                                    </th>

                                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                                        Cluster
                                    </th>

                                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                                        Location
                                    </th>

                                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                                        Expected
                                    </th>

                                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-50">
                                {trainings.map((training) => {
                                    const status = getStatusStyles(
                                        training.trainingStatus
                                    );

                                    return (
                                        <tr
                                            key={training.id}
                                            className="group transition-colors duration-150 hover:bg-green-50/30"
                                        >
                                            {/* Date */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-400 transition group-hover:bg-green-50 group-hover:text-green-600">
                                                        <CalendarIcon />
                                                    </div>

                                                    <span className="text-sm font-medium text-gray-700">
                                                        {formatDate(
                                                            training.trainingDate
                                                        )}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* FO */}
                                            <td className="px-5 py-4">
                                                <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                                                    {training.fieldOfficerId}
                                                </span>
                                            </td>

                                            {/* Cluster */}
                                            <td className="max-w-45 px-5 py-4">
                                                <p className="truncate text-sm font-semibold text-gray-900">
                                                    {training.clusterName}
                                                </p>
                                            </td>

                                            {/* Location */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-2">
                                                    <span className="mt-0.5 text-orange-500">
                                                        <LocationIcon />
                                                    </span>

                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {
                                                                training.community
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-gray-400">
                                                            {training.lga}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Expected */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                                                        <UsersIcon />
                                                    </span>

                                                    <span className="text-sm font-bold text-gray-900">
                                                        {
                                                            training.expectedCollectors
                                                        }
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold ${status.wrapper}`}
                                                >
                                                    <span
                                                        className={status.icon}
                                                    >
                                                        {
                                                            status.iconComponent
                                                        }
                                                    </span>

                                                    {
                                                        training.trainingStatus
                                                    }
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="divide-y divide-gray-100 md:hidden">
                        {trainings.map((training) => {
                            const status = getStatusStyles(
                                training.trainingStatus
                            );

                            return (
                                <div
                                    key={training.id}
                                    className="p-5 transition-colors hover:bg-gray-50/70"
                                >
                                    {/* Top */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-gray-900">
                                                {training.clusterName}
                                            </p>

                                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
                                                <CalendarIcon />

                                                <span>
                                                    {formatDate(
                                                        training.trainingDate
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <span
                                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold ${status.wrapper}`}
                                        >
                                            <span
                                                className={status.icon}
                                            >
                                                {status.iconComponent}
                                            </span>

                                            {training.trainingStatus}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-gray-50 p-3">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Field Officer
                                            </p>

                                            <p className="mt-1.5 text-sm font-semibold text-gray-900">
                                                {
                                                    training.fieldOfficerId
                                                }
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-gray-50 p-3">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Expected
                                            </p>

                                            <div className="mt-1.5 flex items-center gap-1.5">
                                                <UsersIcon />

                                                <p className="text-sm font-semibold text-gray-900">
                                                    {
                                                        training.expectedCollectors
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-gray-50 p-3">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Community
                                            </p>

                                            <p className="mt-1.5 truncate text-sm font-semibold text-gray-900">
                                                {training.community}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-gray-50 p-3">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                LGA
                                            </p>

                                            <p className="mt-1.5 truncate text-sm font-semibold text-gray-900">
                                                {training.lga}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </section>
    );
}
