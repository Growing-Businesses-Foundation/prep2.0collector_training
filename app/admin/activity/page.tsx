"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type AuditLog = {
    _id: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    action: string;
    resource?: string;
    resourceId?: string;
    description: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
};

type Statistics = {
    totalActivities: number;
    todayActivities: number;
    successfulLogins: number;
    trainingCreated: number;
    collectorsCreated: number;
};

type UserFilter = {
    _id: string;
    userName?: string;
    userEmail?: string;
};

const ACTION_LABELS: Record<string, string> = {
    LOGIN_SUCCESS: "Login",
    LOGIN_FAILED: "Failed Login",
    LOGOUT: "Logout",
    USER_CREATED: "User Created",
    USER_UPDATED: "User Updated",
    PASSWORD_RESET: "Password Reset",
    ROLE_CHANGED: "Role Changed",
    USER_DELETED: "User Deleted",
    TRAINING_CREATED: "Training Created",
    TRAINING_UPDATED: "Training Updated",
    COLLECTOR_CREATED: "Collector Added",
    COLLECTOR_UPDATED: "Collector Updated",
};

const ACTION_STYLES: Record<string, string> = {
    LOGIN_SUCCESS: "bg-green-50 text-green-700 ring-green-600/20",
    LOGIN_FAILED: "bg-red-50 text-red-700 ring-red-600/20",
    LOGOUT: "bg-gray-100 text-gray-600 ring-gray-500/20",
    USER_CREATED: "bg-blue-50 text-blue-700 ring-blue-600/20",
    USER_UPDATED: "bg-blue-50 text-blue-700 ring-blue-600/20",
    PASSWORD_RESET: "bg-orange-50 text-orange-700 ring-orange-600/20",
    ROLE_CHANGED: "bg-purple-50 text-purple-700 ring-purple-600/20",
    USER_DELETED: "bg-red-50 text-red-700 ring-red-600/20",
    TRAINING_CREATED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    TRAINING_UPDATED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    COLLECTOR_CREATED: "bg-teal-50 text-teal-700 ring-teal-600/20",
    COLLECTOR_UPDATED: "bg-teal-50 text-teal-700 ring-teal-600/20",
};

function ActivityIcon({ action }: { action: string }) {
    if (action.startsWith("LOGIN")) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12H3m0 0l4-4m-4 4l4 4"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 5V3h6a2 2 0 012 2v14a2 2 0 01-2 2h-6v-2"
                />
            </svg>
        );
    }

    if (action.startsWith("COLLECTOR")) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
            >
                <circle cx="9" cy="7" r="4" />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2 21v-2a5 5 0 015-5h4a5 5 0 015 5v2"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 8v6M16 11h6"
                />
            </svg>
        );
    }

    if (action.startsWith("TRAINING")) {
        return (
            <svg
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
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <circle cx="12" cy="8" r="4" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 21a8 8 0 0116 0"
            />
        </svg>
    );
}

function StatCard({
    label,
    value,
    description,
}: {
    label: string;
    value: number;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                {value.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
    );
}

export default function AdminActivityPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [users, setUsers] = useState<UserFilter[]>([]);

    const [statistics, setStatistics] = useState<Statistics>({
        totalActivities: 0,
        todayActivities: 0,
        successfulLogins: 0,
        trainingCreated: 0,
        collectorsCreated: 0,
    });

    const [search, setSearch] = useState("");
    const [action, setAction] = useState("");
    const [userId, setUserId] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams({
                page: String(page),
                limit: "20",
            });

            if (search.trim()) {
                params.set("search", search.trim());
            }

            if (action) {
                params.set("action", action);
            }

            if (userId) {
                params.set("userId", userId);
            }

            if (dateFrom) {
                params.set("dateFrom", dateFrom);
            }

            if (dateTo) {
                params.set("dateTo", dateTo);
            }

            const response = await fetch(
                `/api/admin/audit-logs?${params.toString()}`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to load activity logs."
                );
            }

            setLogs(result.data || []);
            setUsers(result.users || []);
            setStatistics(
                result.statistics || {
                    totalActivities: 0,
                    todayActivities: 0,
                    successfulLogins: 0,
                    trainingCreated: 0,
                    collectorsCreated: 0,
                }
            );

            setTotal(result.pagination?.total || 0);

            setTotalPages(
                Math.max(result.pagination?.totalPages || 1, 1)
            );
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load activity logs."
            );
        } finally {
            setLoading(false);
        }
    }, [page, search, action, userId, dateFrom, dateTo]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchLogs();
        }, 0);

        return () => clearTimeout(timer);
    }, [fetchLogs]);

    const clearFilters = () => {
        setSearch("");
        setAction("");
        setUserId("");
        setDateFrom("");
        setDateTo("");
        setPage(1);
    };

    const hasFilters = useMemo(
        () =>
            Boolean(
                search ||
                    action ||
                    userId ||
                    dateFrom ||
                    dateTo
            ),
        [search, action, userId, dateFrom, dateTo]
    );

    const formatDate = (date: string) => {
        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Invalid date";
        }

        return new Intl.DateTimeFormat("en-NG", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(parsedDate);
    };

    const getActionLabel = (value: string) =>
        ACTION_LABELS[value] ||
        value
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) => letter.toUpperCase());

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600 text-white shadow-lg shadow-green-600/20">
                                <svg
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
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                    Activity Log
                                </h1>

                                <p className="mt-0.5 text-sm text-gray-500">
                                    Monitor activity across the Collector
                                    Training Platform
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => void fetchLogs()}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className={`h-4 w-4 ${
                                    loading ? "animate-spin" : ""
                                }`}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20 11a8.1 8.1 0 00-14.9-4M4 13a8.1 8.1 0 0014.9 4"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20 5v6h-6M4 19v-6h6"
                                />
                            </svg>

                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                {/* Statistics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        label="Total Activities"
                        value={statistics.totalActivities}
                        description="All recorded activities"
                    />

                    <StatCard
                        label="Today"
                        value={statistics.todayActivities}
                        description="Activities recorded today"
                    />

                    <StatCard
                        label="Successful Logins"
                        value={statistics.successfulLogins}
                        description="All successful logins"
                    />

                    <StatCard
                        label="Training Sessions"
                        value={statistics.trainingCreated}
                        description="Training sessions created"
                    />

                    <StatCard
                        label="Collectors"
                        value={statistics.collectorsCreated}
                        description="Collectors registered"
                    />
                </div>

                {/* Filters */}
                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                Activity Filters
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-500">
                                Search and filter recorded system activities.
                            </p>
                        </div>

                        <div className="grid gap-3 lg:grid-cols-6">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                    Search
                                </label>

                                <div className="relative">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                    >
                                        <circle
                                            cx="11"
                                            cy="11"
                                            r="7"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            d="M20 20l-4-4"
                                        />
                                    </svg>

                                    <input
                                        value={search}
                                        onChange={(event) => {
                                            setSearch(event.target.value);
                                            setPage(1);
                                        }}
                                        placeholder="Search user or activity..."
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
                                    />
                                </div>
                            </div>

                            {/* Action */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                    Action
                                </label>

                                <select
                                    value={action}
                                    onChange={(event) => {
                                        setAction(event.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
                                >
                                    <option value="">All actions</option>

                                    {Object.entries(ACTION_LABELS).map(
                                        ([value, label]) => (
                                            <option
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* User */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                    User
                                </label>

                                <select
                                    value={userId}
                                    onChange={(event) => {
                                        setUserId(event.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
                                >
                                    <option value="">All users</option>

                                    {users.map((item) => (
                                        <option
                                            key={item._id}
                                            value={item._id}
                                        >
                                            {item.userName ||
                                                item.userEmail ||
                                                "Unknown user"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* From */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                    From
                                </label>

                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(event) => {
                                        setDateFrom(event.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
                                />
                            </div>

                            {/* To */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                    To
                                </label>

                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(event) => {
                                        setDateTo(event.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
                                />
                            </div>
                        </div>

                        {hasFilters && (
                            <div>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-xs font-semibold text-green-700 hover:text-green-800"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Activity table */}
                <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                Recent Activity
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-500">
                                {total.toLocaleString()} activities found
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex min-h-80 items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600" />

                                <p className="text-sm text-gray-500">
                                    Loading activity...
                                </p>
                            </div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-7 w-7"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4l3 2"
                                    />
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="9"
                                    />
                                </svg>
                            </div>

                            <h3 className="mt-4 text-sm font-bold text-gray-900">
                                No activities found
                            </h3>

                            <p className="mt-1 max-w-sm text-xs text-gray-500">
                                Try adjusting your filters or wait for new
                                activities to be recorded.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full">
                                    <thead className="border-b border-gray-100 bg-gray-50/80">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Time
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                User
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Action
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Activity
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Resource
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {logs.map((log) => (
                                            <tr
                                                key={log._id}
                                                className="transition hover:bg-gray-50/70"
                                            >
                                                <td className="whitespace-nowrap px-5 py-4 align-top">
                                                    <p className="text-xs font-medium text-gray-700">
                                                        {formatDate(
                                                            log.createdAt
                                                        )}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4 align-top">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-xs font-bold text-green-700">
                                                            {(
                                                                log.userName ||
                                                                "S"
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-gray-900">
                                                                {log.userName ||
                                                                    "System"}
                                                            </p>

                                                            {log.userEmail && (
                                                                <p className="truncate text-xs text-gray-400">
                                                                    {
                                                                        log.userEmail
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 align-top">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${
                                                            ACTION_STYLES[
                                                                log.action
                                                            ] ||
                                                            "bg-gray-100 text-gray-600 ring-gray-500/20"
                                                        }`}
                                                    >
                                                        {getActionLabel(
                                                            log.action
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="max-w-md px-5 py-4 align-top">
                                                    <div className="flex gap-3">
                                                        <div className="mt-0.5 text-gray-400">
                                                            <ActivityIcon
                                                                action={
                                                                    log.action
                                                                }
                                                            />
                                                        </div>

                                                        <p className="text-sm leading-6 text-gray-700">
                                                            {
                                                                log.description
                                                            }
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 align-top">
                                                    {log.resource ? (
                                                        <div>
                                                            <p className="text-xs font-semibold capitalize text-gray-700">
                                                                {log.resource.replaceAll(
                                                                    "_",
                                                                    " "
                                                                )}
                                                            </p>

                                                            {log.resourceId && (
                                                                <p className="mt-0.5 max-w-32 truncate font-mono text-[10px] text-gray-400">
                                                                    {
                                                                        log.resourceId
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile activity cards */}
                            <div className="divide-y divide-gray-100 lg:hidden">
                                {logs.map((log) => (
                                    <div
                                        key={log._id}
                                        className="p-4"
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                                <ActivityIcon
                                                    action={log.action}
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${
                                                            ACTION_STYLES[
                                                                log.action
                                                            ] ||
                                                            "bg-gray-100 text-gray-600 ring-gray-500/20"
                                                        }`}
                                                    >
                                                        {getActionLabel(
                                                            log.action
                                                        )}
                                                    </span>

                                                    <span className="text-[10px] text-gray-400">
                                                        {formatDate(
                                                            log.createdAt
                                                        )}
                                                    </span>
                                                </div>

                                                <p className="mt-2 text-sm leading-5 text-gray-700">
                                                    {log.description}
                                                </p>

                                                <div className="mt-3 flex items-center gap-2">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-bold text-gray-600">
                                                        {(
                                                            log.userName ||
                                                            "S"
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-semibold text-gray-800">
                                                            {log.userName ||
                                                                "System"}
                                                        </p>

                                                        {log.resource && (
                                                            <p className="text-[10px] capitalize text-gray-400">
                                                                {log.resource.replaceAll(
                                                                    "_",
                                                                    " "
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 0 && (
                        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-gray-500">
                                Page{" "}
                                <span className="font-semibold text-gray-700">
                                    {page}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-gray-700">
                                    {totalPages}
                                </span>
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.max(current - 1, 1)
                                        )
                                    }
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <button
                                    type="button"
                                    disabled={page >= totalPages}
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.min(
                                                current + 1,
                                                totalPages
                                            )
                                        )
                                    }
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
