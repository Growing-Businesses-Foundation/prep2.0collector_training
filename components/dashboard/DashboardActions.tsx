//components/dashboard/DashboardActions.tsx
"use client";

import { useRouter } from "next/navigation";


interface DashboardActionsProps {
    canWrite: boolean;
}

function TrainingPlusIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6.5A2.5 2.5 0 016.5 4H20v15H6.5A2.5 2.5 0 014 16.5v-10z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 8h8M8 12h5"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 14v6M14 17h6"
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
            className="h-6 w-6"
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

function TrainingIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6"
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

function UsersIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6"
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

function ArrowIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M13 6l6 6-6 6"
            />
        </svg>
    );
}

interface ActionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant: "green" | "orange" | "neutral";
}

function ActionCard({
    title,
    description,
    icon,
    onClick,
    variant,
}: ActionCardProps) {
    const styles = {
        green: {
            icon: "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white",
            accent: "bg-green-600",
            arrow: "text-green-600",
            hover: "hover:border-green-200",
        },
        orange: {
            icon: "bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white",
            accent: "bg-orange-500",
            arrow: "text-orange-500",
            hover: "hover:border-orange-200",
        },
        neutral: {
            icon: "bg-gray-100 text-gray-500 group-hover:bg-gray-800 group-hover:text-white",
            accent: "bg-gray-300 group-hover:bg-gray-800",
            arrow: "text-gray-500",
            hover: "hover:border-gray-300",
        },
    };

    const style = styles[variant];

    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${style.hover}`}
        >
            {/* Accent bar */}
            <div
                className={`absolute left-0 top-0 h-full w-1 rounded-r-full transition-colors duration-200 ${style.accent}`}
            />

            <div className="flex items-start justify-between">
                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${style.icon}`}
                >
                    {icon}
                </div>

                <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 transition-all duration-200 group-hover:bg-gray-100 ${style.arrow}`}
                >
                    <ArrowIcon />
                </div>
            </div>

            <h3 className="mt-5 text-sm font-bold text-gray-900">
                {title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-gray-500">
                {description}
            </p>

            <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition-colors group-hover:text-gray-600">
                <span>Open</span>
                <ArrowIcon />
            </div>
        </button>
    );
}

export default function DashboardActions({
    canWrite,
}: DashboardActionsProps) {
    const router = useRouter();
    

    return (
        <section className="mt-10">
            {/* Section heading */}
            <div className="mb-5 flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="h-6 w-1 rounded-full bg-green-600" />

                        <h2 className="text-lg font-bold tracking-tight text-gray-900">
                            Quick Actions
                        </h2>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                        Access the main areas of the collector training
                        system.
                    </p>
                </div>
            </div>

            <div
                className={`grid gap-5 ${canWrite
                    ? "sm:grid-cols-2 xl:grid-cols-4"
                    : "sm:grid-cols-2"
                    }`}
            >
                {canWrite && (
                    <ActionCard
                        title="New Training Session"
                        description="Create a new training session and record its location and evidence."
                        icon={<TrainingPlusIcon />}
                        variant="green"
                        onClick={() =>
                            router.push("/training/new")
                        }
                    />
                )}

                {canWrite && (
                    <ActionCard
                        title="Add Collector"
                        description="Record a collector against an existing training session."
                        icon={<UserPlusIcon />}
                        variant="orange"
                        onClick={() =>
                            router.push("/collectors/new")
                        }
                    />
                )}

                <ActionCard
                    title="Training Sessions"
                    description="View and manage recorded training sessions."
                    icon={<TrainingIcon />}
                    variant="neutral"
                    onClick={() => router.push("/training")}
                />

                <ActionCard
                    title="Collectors"
                    description="View collectors recorded in the system."
                    icon={<UsersIcon />}
                    variant="neutral"
                    onClick={() => router.push("/collectors")}
                />
            </div>
        </section>
    );
}
