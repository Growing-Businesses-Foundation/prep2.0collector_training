"use client";

interface DashboardStatsProps {
    stats: {
        totalTrainingSessions: number;
        // completedTrainingSessions: number;
        totalExpectedCollectors: number;
        totalCollectors: number;
        totalNewlyRecruitedCollectors: number;
        maleCollectors: number;
        femaleCollectors: number;
        completionRate: number;
    };
}

function TrainingIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6.5A2.5 2.5 0 016.5 4H20v15H6.5A2.5 2.5 0 014 16.5v-10z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 8h8M8 12h6"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16.5A2.5 2.5 0 016.5 14H20"
            />
        </svg>
    );
}

// function CheckIcon() {
//     return (
//         <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             className="h-5 w-5"
//         >
//             <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M5 12l4 4L19 6"
//             />
//         </svg>
//     );
// }

function UsersIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
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

function UserPlusIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
            />
            <circle cx="8.5" cy="7" r="4" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 8v6M16 11h6"
            />
        </svg>
    );
}

function TargetIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="12" cy="12" r="1" />
        </svg>
    );
}

function ChartIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 19V5M4 19h16"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 15l4-4 3 2 5-6"
            />
        </svg>
    );
}

export default function DashboardStats({
    stats,
}: DashboardStatsProps) {
    const cards = [
        {
            title: "Training Sessions",
            value: stats.totalTrainingSessions,
            description: "Total sessions",
            icon: <TrainingIcon />,
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
        },
        // {
        //     title: "Completed Trainings",
        //     value: stats.completedTrainingSessions,
        //     description: "Sessions completed",
        //     icon: <CheckIcon />,
        //     iconBg: "bg-emerald-50",
        //     iconColor: "text-emerald-600",
        // },
        {
            title: "Expected Collectors",
            value: stats.totalExpectedCollectors,
            description: "Across all trainings",
            icon: <TargetIcon />,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500",
        },
        {
            title: "Collectors Recorded",
            value: stats.totalCollectors,
            description: "Collectors registered",
            icon: <UsersIcon />,
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
        },
        {
            title: "Newly Recruited",
            value: stats.totalNewlyRecruitedCollectors,
            description: "New collectors",
            icon: <UserPlusIcon />,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500",
        },
        {
            title: "Completion Rate",
            value: `${stats.completionRate}%`,
            description: "Collectors recorded",
            icon: <ChartIcon />,
            iconBg: "bg-green-600",
            iconColor: "text-white",
            featured: true,
        },
    ];

    return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${card.featured
                            ? "border-green-600 bg-linear-to-br from-green-700 via-green-600 to-green-700 text-white shadow-lg shadow-green-700/15"
                            : "border-gray-100 bg-white shadow-sm hover:border-green-100"
                        }`}
                >
                    {/* Decorative background */}
                    {card.featured && (
                        <>
                            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
                            <div className="absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-white/5" />
                        </>
                    )}

                    <div className="relative">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <p
                                    className={`text-sm font-semibold ${card.featured
                                            ? "text-green-50"
                                            : "text-gray-500"
                                        }`}
                                >
                                    {card.title}
                                </p>

                                <p
                                    className={`mt-3 text-3xl font-bold tracking-tight ${card.featured
                                            ? "text-white"
                                            : "text-gray-900"
                                        }`}
                                >
                                    {card.value}
                                </p>
                            </div>

                            <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.featured
                                        ? "bg-white/15"
                                        : card.iconBg
                                    } ${card.iconColor}`}
                            >
                                {card.icon}
                            </div>
                        </div>

                        {/* Description */}
                        <div
                            className={`mt-4 flex items-center gap-2 border-t pt-3 ${card.featured
                                    ? "border-white/15"
                                    : "border-gray-100"
                                }`}
                        >
                            {card.featured && (
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-300" />
                            )}

                            <p
                                className={`text-xs font-medium ${card.featured
                                        ? "text-green-100"
                                        : "text-gray-400"
                                    }`}
                            >
                                {card.description}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

