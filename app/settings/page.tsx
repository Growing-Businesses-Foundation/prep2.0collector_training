import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import BackButton from "./BackButton";
/* =========================================================
   Icons
========================================================= */

function SettingsIcon() {
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
                d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.94 1.94-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.75v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.94-1.94.06-.06A1.7 1.7 0 0 0 7.6 15a1.7 1.7 0 0 0-1.56-1.03H5.95v-2.75h.09A1.7 1.7 0 0 0 7.6 10.2a1.7 1.7 0 0 0-.34-1.88L7.2 8.26 9.14 6.32l.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V5h2.75v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.94 1.94-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03H20v2.75h-.09A1.7 1.7 0 0 0 19.4 15Z"
            />
        </svg>
    );
}

function KeyIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6"
        >
            <circle cx="8" cy="15" r="4" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 12l8-8m0 0h-3m3 0v3"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 9l2 2"
            />
        </svg>
    );
}

function ShieldIcon() {
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
                d="M12 3l8 4v5c0 4.8-3.2 8.2-8 9-4.8-.8-8-4.2-8-9V7l8-4z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4"
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
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m13 6 6 6-6 6"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m5 12 4 4L19 6" />
        </svg>
    );
}

/* =========================================================
   Setting Option
========================================================= */

function SettingOption({
    href,
    title,
    description,
    icon,
    variant,
    badge,
}: {
    href: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    variant: "green" | "orange";
    badge: string;
}) {
    const green = variant === "green";

    return (
        <Link
            href={href}
            className={`group relative overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${green
                ? "border-green-100 hover:border-green-200"
                : "border-orange-100 hover:border-orange-200"
                }`}
        >
            {/* Top accent */}
            <div
                className={`h-1 ${green ? "bg-green-500" : "bg-orange-400"
                    }`}
            />

            <div className="p-6">
                <div className="flex items-start justify-between gap-5">
                    {/* Icon */}
                    <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${green
                            ? "bg-green-50 text-green-600"
                            : "bg-orange-50 text-orange-500"
                            }`}
                    >
                        {icon}
                    </div>

                    {/* Arrow */}
                    <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 group-hover:translate-x-0.5 ${green
                            ? "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white"
                            : "bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white"
                            }`}
                    >
                        <ArrowIcon />
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold tracking-tight text-gray-950">
                            {title}
                        </h3>

                        <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${green
                                ? "bg-green-50 text-green-700"
                                : "bg-orange-50 text-orange-600"
                                }`}
                        >
                            {badge}
                        </span>
                    </div>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
                        {description}
                    </p>
                </div>

                <div
                    className={`mt-6 flex items-center gap-2 border-t pt-4 text-xs font-semibold ${green
                        ? "border-green-50 text-green-600"
                        : "border-orange-50 text-orange-500"
                        }`}
                >
                    <span>Open settings</span>
                    <ArrowIcon />
                </div>
            </div>
        </Link>
    );
}

/* =========================================================
   Settings Page
========================================================= */

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const isAdmin = session.user.role === "ADMIN";

    const roleLabel = session.user.role.replaceAll("_", " ");

    return (
        <div className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-5xl py-6">
            <div className="my-5">
                <BackButton />
            </div>
            {/* =================================================
                Header
            ================================================= */}

            <section className="relative mb-7 overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
                {/* Brand accent */}
                <div className="absolute inset-x-0 top-0 h-1 bg-green-600" />

                <div className="relative px-6 py-7 sm:px-8 sm:py-8">
                    <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white shadow-sm">
                                <SettingsIcon />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                                        Settings
                                    </h1>

                                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
                                        Account & System
                                    </span>
                                </div>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                                    Manage your account security and the
                                    system settings available to you.
                                </p>
                            </div>
                        </div>

                        {/* Access Level */}
                        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                <ShieldIcon />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Access Level
                                </p>

                                <p className="mt-0.5 text-sm font-bold text-green-700">
                                    {roleLabel}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================
                Account Section
            ================================================= */}

            <section>
                <div className="mb-4 flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">
                            Preferences & Security
                        </p>

                        <h2 className="mt-1 text-lg font-bold text-gray-950">
                            Account Settings
                        </h2>
                    </div>

                    <div className="hidden h-px flex-1 bg-gray-200 sm:ml-6 sm:block" />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <SettingOption
                        href="/account/change-password"
                        title="Change Password"
                        description="Update your account password and keep your credentials secure."
                        icon={<KeyIcon />}
                        variant="green"
                        badge="Security"
                    />

                    {isAdmin && (
                        <SettingOption
                            href="/admin/maintenance"
                            title="Maintenance"
                            description="Manage application availability and configure the maintenance experience."
                            icon={<ShieldIcon />}
                            variant="orange"
                            badge="Admin"
                        />
                    )}
                </div>
            </section>

            {/* =================================================
                Security Status
            ================================================= */}

            <section className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <ShieldIcon />
                        </div>

                        <div>
                            <h2 className="text-base font-bold text-gray-950">
                                Account Security
                            </h2>

                            <p className="text-sm text-gray-500">
                                Your account security information
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                    <div className="flex items-center gap-3 px-5 py-5 sm:px-6">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <CheckIcon />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                Account Active
                            </p>

                            <p className="text-xs text-gray-500">
                                Your account is currently active.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-5 py-5 sm:px-6">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                            <ShieldIcon />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                Protected Account
                            </p>

                            <p className="text-xs text-gray-500">
                                Keep your credentials private and secure.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}