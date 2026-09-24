"use client";

import { useEffect, useState } from "react";
import BackButton from "../../settings/BackButton";

interface MaintenanceData {
    maintenanceMode: boolean;
    message: string;
    updatedAt: string;
    updatedBy: {
        id: string;
        name?: string;
        email?: string;
    } | null;
}

export default function MaintenanceControl() {
    const [settings, setSettings] =
        useState<MaintenanceData | null>(null);

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [maintenanceMessage, setMaintenanceMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadInitialSettings() {
            try {
                const response = await fetch(
                    "/api/admin/maintenance",
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message ||
                        "Failed to load maintenance settings."
                    );
                }

                if (!cancelled) {
                    setSettings(data.data);
                    setMaintenanceMessage(data.data.message || "");
                    setError(null);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load maintenance settings."
                    );

                    setLoading(false);
                }
            }
        }

        loadInitialSettings();

        return () => {
            cancelled = true;
        };
    }, []);

    async function enableMaintenance() {
        try {
            setUpdating(true);
            setError(null);

            const response = await fetch(
                "/api/admin/maintenance",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: maintenanceMessage.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Failed to enable maintenance mode."
                );
            }

            setSettings(data.data);
            setMaintenanceMessage(data.data.message || "");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to enable maintenance mode."
            );
        } finally {
            setUpdating(false);
        }
    }

    async function disableMaintenance() {
        try {
            setUpdating(true);
            setError(null);

            const response = await fetch(
                "/api/admin/maintenance",
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Failed to disable maintenance mode."
                );
            }

            setSettings(data.data);
            setMaintenanceMessage(data.data.message || "");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to disable maintenance mode."
            );
        } finally {
            setUpdating(false);
        }
    }

    async function saveMaintenanceMessage() {
        if (!settings || updating) {
            return;
        }

        const message = maintenanceMessage.trim();

        if (!message) {
            setError("Maintenance message cannot be empty.");
            return;
        }

        if (message.length > 500) {
            setError("Maintenance message cannot exceed 500 characters.");
            return;
        }

        if (message === settings.message) {
            return;
        }

        try {
            setUpdating(true);
            setError(null);

            const response = await fetch(
                "/api/admin/maintenance",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Failed to update maintenance message."
                );
            }

            setSettings(data.data);
            setMaintenanceMessage(data.data.message || "");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update maintenance message."
            );
        } finally {
            setUpdating(false);
        }
    }

    async function handleToggle() {
        if (!settings || updating) {
            return;
        }

        if (settings.maintenanceMode) {
            await disableMaintenance();
            return;
        }

        if (!maintenanceMessage.trim()) {
            setError(
                "Please enter a maintenance message before enabling maintenance mode."
            );
            return;
        }

        if (maintenanceMessage.trim().length > 500) {
            setError(
                "Maintenance message cannot exceed 500 characters."
            );
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to enable maintenance mode? Regular users will no longer be able to access the application."
        );

        if (!confirmed) {
            return;
        }

        await enableMaintenance();
    }

    if (loading) {
        return (
            <div className="min-h-full bg-slate-50 p-6 lg:p-8">
                <div className="mx-auto max-w-5xl">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 w-56 rounded-lg bg-slate-200" />

                        <div className="h-4 w-96 max-w-full rounded bg-slate-200" />

                        <div className="rounded-2xl border border-slate-200 bg-white p-8">
                            <div className="h-28 rounded-xl bg-slate-100" />

                            <div className="mt-6 h-20 rounded-xl bg-slate-100" />

                            <div className="mt-6 h-12 rounded-xl bg-slate-100" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isMaintenance =
        settings?.maintenanceMode ?? false;

    return (
        <div className="min-h-full bg-slate-50 p-6 lg:p-8">
            <div className="my-5">
                <BackButton />
            </div>

            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                                    <svg
                                        className="h-4 w-4 text-orange-600"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M10.5 6h3M10 3h4M12 3v3m-6.36 1.64 2.12 2.12M18.36 7.64l-2.12 2.12M5 13h3m8 0h3M7.64 18.36l2.12-2.12m8.6 2.12-2.12-2.12M12 18v3m0 0H9m3 0h3"
                                        />

                                        <circle
                                            cx="12"
                                            cy="13"
                                            r="4"
                                        />
                                    </svg>
                                </div>

                                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">
                                    System Control
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Maintenance Mode
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Control application availability and temporarily
                                restrict access while system maintenance is in
                                progress.
                            </p>
                        </div>

                        {/* Status pill */}
                        <div
                            className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${isMaintenance
                                ? "border-orange-200 bg-orange-50 text-orange-700"
                                : "border-green-200 bg-green-50 text-green-700"
                                }`}
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span
                                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 ${isMaintenance
                                        ? "bg-orange-400"
                                        : "bg-green-400"
                                        }`}
                                />

                                <span
                                    className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isMaintenance
                                        ? "bg-orange-500"
                                        : "bg-green-500"
                                        }`}
                                />
                            </span>

                            {isMaintenance
                                ? "Maintenance Active"
                                : "Application Live"}
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <svg
                                className="h-4 w-4 text-red-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v4m0 4h.01M10.3 3.6 2.8 17a1.5 1.5 0 0 0 1.3 2.25h15.8a1.5 1.5 0 0 0 1.3-2.25L13.7 3.6a2 2 0 0 0-3.4 0Z"
                                />
                            </svg>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-red-800">
                                Unable to update maintenance mode
                            </p>

                            <p className="mt-1 text-sm text-red-700">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {settings && (
                    <>
                        {/* Main status card */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            {/* Top accent */}
                            <div
                                className={`h-1.5 ${isMaintenance
                                    ? "bg-orange-500"
                                    : "bg-green-500"
                                    }`}
                            />

                            <div className="p-6 sm:p-8">

                                {/* Status section */}
                                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">

                                        <div
                                            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${isMaintenance
                                                ? "bg-orange-100"
                                                : "bg-green-100"
                                                }`}
                                        >
                                            {isMaintenance ? (
                                                <svg
                                                    className="h-8 w-8 text-orange-600"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 3.75 4.6 17a1.5 1.5 0 0 0 1.31 2.25h12.18A1.5 1.5 0 0 0 19.4 17L12 3.75Z"
                                                    />

                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 9v4"
                                                    />

                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 16.5h.01"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="h-8 w-8 text-green-600"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9 12.75 11.25 15 15.5 10.5"
                                                    />

                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="8.25"
                                                    />
                                                </svg>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Current status
                                            </p>

                                            <h2
                                                className={`mt-1 text-xl font-bold ${isMaintenance
                                                    ? "text-orange-700"
                                                    : "text-green-700"
                                                    }`}
                                            >
                                                {isMaintenance
                                                    ? "Maintenance Mode Active"
                                                    : "Application Is Live"}
                                            </h2>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {isMaintenance
                                                    ? "Regular users are currently restricted from accessing the application."
                                                    : "The application is currently available to regular users."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Information cards */}
                                <div className="mt-8 grid gap-4 sm:grid-cols-2">

                                    {/* Availability */}
                                    <div
                                        className={`rounded-xl border p-5 ${isMaintenance
                                            ? "border-orange-100 bg-orange-50/60"
                                            : "border-green-100 bg-green-50/60"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">

                                            <div
                                                className={`flex h-9 w-9 items-center justify-center rounded-lg ${isMaintenance
                                                    ? "bg-orange-100"
                                                    : "bg-green-100"
                                                    }`}
                                            >
                                                <svg
                                                    className={`h-4 w-4 ${isMaintenance
                                                        ? "text-orange-600"
                                                        : "text-green-600"
                                                        }`}
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 8v4l2.5 2.5"
                                                    />

                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="8.5"
                                                    />
                                                </svg>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                                    Availability
                                                </p>

                                                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                                    {isMaintenance
                                                        ? "Restricted"
                                                        : "Fully Available"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Last updated */}
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="flex items-center gap-3">

                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200">
                                                <svg
                                                    className="h-4 w-4 text-slate-600"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 8v4l2.5 2.5"
                                                    />

                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="8.5"
                                                    />
                                                </svg>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                                    Last updated
                                                </p>

                                                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                                    {new Date(
                                                        settings.updatedAt
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Maintenance message */}
                                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100">
                                            <svg
                                                className="h-5 w-5 text-orange-600"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4.75 5.75h14.5a1 1 0 0 1 1 1v10.5a1 1 0 0 1-1 1H4.75a1 1 0 0 1-1-1V6.75a1 1 0 0 1 1-1Z"
                                                />

                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m7 9 5 4 5-4"
                                                />
                                            </svg>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        Maintenance message
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                                        This message will be shown to users while maintenance
                                                        mode is active.
                                                    </p>
                                                </div>

                                                <span className="w-fit rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-orange-600">
                                                    User-facing
                                                </span>
                                            </div>

                                            <textarea
                                                value={maintenanceMessage}
                                                onChange={(event) =>
                                                    setMaintenanceMessage(event.target.value)
                                                }
                                                disabled={updating}
                                                rows={4}
                                                maxLength={500}
                                                placeholder="Enter the message users should see during maintenance..."
                                                className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                                            />

                                            <div className="mt-2 flex items-center justify-between">
                                                <p className="text-xs text-slate-400">
                                                    Keep the message clear and concise.
                                                </p>

                                                <span className="text-xs text-slate-400">
                                                    {maintenanceMessage.length}/500
                                                </span>
                                            </div>

                                            {isMaintenance && (
                                                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-green-100 bg-green-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-green-800">
                                                            Update user-facing message
                                                        </p>

                                                        <p className="mt-1 text-xs leading-5 text-green-700">
                                                            Changes will be visible to users immediately.
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={saveMaintenanceMessage}
                                                        disabled={
                                                            updating ||
                                                            !maintenanceMessage.trim() ||
                                                            maintenanceMessage.trim() === settings.message
                                                        }
                                                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {updating ? (
                                                            <>
                                                                <svg
                                                                    className="h-4 w-4 animate-spin"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                >
                                                                    <circle
                                                                        className="opacity-25"
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="9"
                                                                        stroke="currentColor"
                                                                        strokeWidth="3"
                                                                    />

                                                                    <path
                                                                        className="opacity-90"
                                                                        d="M21 12a9 9 0 0 1-9 9"
                                                                        stroke="currentColor"
                                                                        strokeWidth="3"
                                                                        strokeLinecap="round"
                                                                    />
                                                                </svg>

                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M5 12.5 9.5 17 19 7"
                                                                    />
                                                                </svg>

                                                                Save Message
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}

                                            {isMaintenance && (
                                                <div className="mt-3 rounded-lg border border-orange-100 bg-orange-50 px-3 py-2.5">
                                                    <p className="text-xs leading-5 text-orange-800">
                                                        Maintenance mode is active. You can update this message
                                                        without disabling maintenance mode.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Notice */}
                                <div
                                    className={`mt-6 rounded-xl border p-5 ${isMaintenance
                                        ? "border-orange-200 bg-linear-to-r from-orange-50 to-amber-50"
                                        : "border-green-200 bg-linear-to-r from-green-50 to-emerald-50"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">

                                        <div
                                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isMaintenance
                                                ? "bg-orange-100"
                                                : "bg-green-100"
                                                }`}
                                        >
                                            {isMaintenance ? (
                                                <svg
                                                    className="h-4 w-4 text-orange-600"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 9v4m0 4h.01"
                                                    />

                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M10.3 3.6 2.8 17a1.5 1.5 0 0 0 1.3 2.25h15.8a1.5 1.5 0 0 0-1.3 2.25L13.7 3.6a2 2 0 0 0-3.4 0Z"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="h-4 w-4 text-green-600"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m5 12 4 4L19 6"
                                                    />
                                                </svg>
                                            )}
                                        </div>

                                        <div>
                                            <p
                                                className={`text-sm font-semibold ${isMaintenance
                                                    ? "text-orange-900"
                                                    : "text-green-900"
                                                    }`}
                                            >
                                                {isMaintenance
                                                    ? "Maintenance is currently in progress"
                                                    : "Your application is operating normally"}
                                            </p>

                                            <p
                                                className={`mt-1 text-sm leading-6 ${isMaintenance
                                                    ? "text-orange-800/80"
                                                    : "text-green-800/80"
                                                    }`}
                                            >
                                                {settings.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="mt-8 border-t border-slate-100 pt-6">
                                    <button
                                        type="button"
                                        onClick={handleToggle}
                                        disabled={updating}
                                        className={`group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${isMaintenance
                                            ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                            : "bg-orange-500 hover:bg-orange-600 focus:ring-orange-400"
                                            }`}
                                    >
                                        <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0" />

                                        {updating ? (
                                            <>
                                                <svg
                                                    className="h-5 w-5 animate-spin"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="9"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                    />

                                                    <path
                                                        className="opacity-90"
                                                        d="M21 12a9 9 0 0 1-9 9"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>

                                                Updating system status...
                                            </>
                                        ) : (
                                            <>
                                                {isMaintenance ? (
                                                    <svg
                                                        className="h-5 w-5"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M9 12.75 11.25 15 15.5 10.5"
                                                        />

                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="8.25"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        className="h-5 w-5"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 3.75 4.6 17a1.5 1.5 0 0 0 1.31 2.25h12.18A1.5 1.5 0 0 0 19.4 17L12 3.75Z"
                                                        />

                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 9v4"
                                                        />

                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 16.5h.01"
                                                        />
                                                    </svg>
                                                )}

                                                {isMaintenance
                                                    ? "Disable Maintenance Mode"
                                                    : "Enable Maintenance Mode"}
                                            </>
                                        )}
                                    </button>

                                    <p className="mt-3 text-center text-xs text-slate-400">
                                        {isMaintenance
                                            ? "Disabling maintenance will immediately restore normal user access."
                                            : "Enabling maintenance will restrict regular users from accessing the application."}
                                    </p>
                                </div>
                            </div>

                            {/* Audit footer */}
                            {settings.updatedBy && (
                                <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-8">
                                    <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">

                                        <div className="flex items-center gap-2 text-slate-500">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                                                <svg
                                                    className="h-3.5 w-3.5 text-slate-500"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M20 21a8 8 0 0 0-16 0"
                                                    />

                                                    <circle
                                                        cx="12"
                                                        cy="7"
                                                        r="4"
                                                    />
                                                </svg>
                                            </div>

                                            <span>
                                                Last updated by{" "}
                                                <span className="font-semibold text-slate-700">
                                                    {settings.updatedBy.name ||
                                                        settings.updatedBy.email ||
                                                        "Unknown user"}
                                                </span>
                                            </span>
                                        </div>

                                        <span className="text-slate-400">
                                            {new Date(
                                                settings.updatedAt
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div >
    );
}