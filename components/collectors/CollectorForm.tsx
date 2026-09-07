"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CollectorFormProps } from "@/types/collector";

interface TrainingSession {
    id: string;
    trainingDate: string;
    fieldOfficerId: string;
    fieldOfficerName: string;
    clusterName: string;
    lga: string;
    community: string;
    venue: string;
    expectedCollectors: number;
    recordedCollectors: number;
    trainingStatus: string;
}

/* =========================================================
   Icons
========================================================= */

function UsersIcon({ className = "h-5 w-5" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
    );
}

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
        </svg>
    );
}

function CalendarIcon({ className = "h-5 w-5" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

function MapPinIcon({ className = "h-5 w-5" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
        </svg>
    );
}

function ChevronLeftIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m15 18-6-6 6-6" />
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

function ClockIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    );
}

function ChevronDownIcon() {
    return (
        <svg
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

/* =========================================================
   Input Label
========================================================= */

function FieldLabel({
    icon,
    children,
    required = false,
}: {
    icon?: React.ReactNode;
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
            {icon && <span className="text-gray-400">{icon}</span>}

            <span>{children}</span>

            {required && (
                <span className="text-orange-500">*</span>
            )}
        </label>
    );
}

/* =========================================================
   Main Component
========================================================= */

export default function CollectorForm({ }: CollectorFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const trainingSessionId =
        searchParams.get("trainingSessionId");

    const fromTrainingPage = Boolean(trainingSessionId);

    const [sessions, setSessions] = useState<TrainingSession[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);

    const [error, setError] = useState("");
    const [selectedSessionId, setSelectedSessionId] = useState("");

    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [fullName, setFullName] = useState("");
    const [gender, setGender] = useState<
        "Male" | "Female" | ""
    >("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [newlyRecruited, setNewlyRecruited] = useState<
        "Yes" | "No" | ""
    >("");

    /* =====================================================
       Fetch Training Sessions
    ===================================================== */

    useEffect(() => {
        async function fetchSessions() {
            try {
                setError("");

                const response = await fetch(
                    "/api/training-sessions"
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to load training sessions."
                    );
                }

                const loadedSessions = data.sessions || [];

                setSessions(loadedSessions);

                if (trainingSessionId) {
                    const matchingSession =
                        loadedSessions.find(
                            (session: TrainingSession) =>
                                session.id === trainingSessionId
                        );

                    if (matchingSession) {
                        setSelectedSessionId(
                            matchingSession.id
                        );
                    }
                }
            } catch (error) {
                console.error(
                    "Training sessions error:",
                    error
                );

                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load training sessions."
                );
            } finally {
                setLoadingSessions(false);
            }
        }

        fetchSessions();
    }, [trainingSessionId]);

    /* =====================================================
       Selected Session
    ===================================================== */

    const selectedSession = sessions.find(
        (session) => session.id === selectedSessionId
    );

    const recordedCollectors = Number(
        selectedSession?.recordedCollectors || 0
    );

    const expectedCollectors = Number(
        selectedSession?.expectedCollectors || 0
    );

    const isTrainingComplete =
        !!selectedSession &&
        expectedCollectors > 0 &&
        recordedCollectors >= expectedCollectors;

    const progress =
        expectedCollectors > 0
            ? Math.min(
                (recordedCollectors /
                    expectedCollectors) *
                100,
                100
            )
            : 0;

    const remainingCollectors = Math.max(
        expectedCollectors - recordedCollectors,
        0
    );

    /* =====================================================
       Helpers
    ===================================================== */

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }

    function clearCollectorForm() {
        setFullName("");
        setGender("");
        setPhoneNumber("");
        setNewlyRecruited("");
    }

    /* =====================================================
       Submit
    ===================================================== */

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setSuccessMessage("");

        if (!selectedSessionId) {
            alert("Please select a training session.");
            return;
        }

        if (isTrainingComplete) {
            alert(
                "All expected collectors have already been recorded."
            );
            return;
        }

        const phoneRegex = /^0[789][01]\d{8}$/;

        if (!phoneRegex.test(phoneNumber)) {
            alert(
                "Enter a valid Nigerian mobile number."
            );
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                "/api/collectors",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        trainingSessionId:
                            selectedSessionId,
                        fullName,
                        gender,
                        phoneNumber,
                        newlyRecruited,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to record collector."
                );
                return;
            }

            const newRecordedCollectors =
                recordedCollectors + 1;

            setSessions((currentSessions) =>
                currentSessions.map((session) =>
                    session.id === selectedSessionId
                        ? {
                            ...session,
                            recordedCollectors:
                                newRecordedCollectors,
                            trainingStatus:
                                data.trainingStatus ||
                                session.trainingStatus,
                        }
                        : session
                )
            );

            clearCollectorForm();

            if (
                newRecordedCollectors >=
                expectedCollectors
            ) {
                setSuccessMessage(
                    "Collector recorded successfully. All expected collectors have now been recorded."
                );
            } else {
                setSuccessMessage(
                    `Collector recorded successfully. ${newRecordedCollectors} of ${expectedCollectors} collectors recorded.`
                );
            }
        } catch (error) {
            console.error(
                "Collector submission error:",
                error
            );

            alert(
                "Something went wrong. Please try again."
            );
        } finally {
            setSaving(false);
        }
    }

    /* =====================================================
       Render
    ===================================================== */

    return (
        <div className="mx-auto w-full max-w-5xl">
            {/* =================================================
                Back Navigation
            ================================================= */}

            {fromTrainingPage && selectedSession && (
                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            `/training/${selectedSession.id}/collectors`
                        )
                    }
                    className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-950"
                >
                    <ChevronLeftIcon />
                    Back to Training
                </button>
            )}

            {/* =================================================
                Page Header
            ================================================= */}

            <div className="mb-7">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white shadow-sm">
                        <UsersIcon className="h-6 w-6" />
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-950">
                                Record Collector
                            </h1>

                            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
                                Training
                            </span>
                        </div>

                        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-500">
                            Record the details of a collector
                            attending the selected training
                            session.
                        </p>
                    </div>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
                {/* =================================================
                    Training Session
                ================================================= */}

                <section className="p-5 sm:p-7">
                    <div className="mb-6 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <CalendarIcon />
                        </div>

                        <div>
                            <h2 className="text-base font-bold text-gray-950">
                                Training Session
                            </h2>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Select the training session this
                                collector attended.
                            </p>
                        </div>
                    </div>

                    <FieldLabel required>
                        Training Session
                    </FieldLabel>

                    {loadingSessions ? (
                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />

                            <p className="text-sm font-medium text-gray-600">
                                Loading training sessions...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
                            <p className="text-sm font-semibold text-red-700">
                                {error}
                            </p>
                        </div>
                    ) : fromTrainingPage &&
                        selectedSession ? (
                        <div className="rounded-2xl border border-green-200 bg-linear-to-br from-green-50 to-white p-5">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="rounded-md bg-green-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-green-700">
                                            Selected Session
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-950">
                                        {
                                            selectedSession.clusterName
                                        }
                                    </h3>

                                    <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                                        <div className="flex items-center gap-2">
                                            <MapPinIcon className="h-4 w-4 text-gray-400" />
                                            <span>
                                                {
                                                    selectedSession.community
                                                }
                                                {" · "}
                                                {
                                                    selectedSession.lga
                                                }
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                                            <span>
                                                Training Date:{" "}
                                                {formatDate(
                                                    selectedSession.trainingDate
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                        Field Officer
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-gray-900">
                                        {
                                            selectedSession.fieldOfficerId
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <select
                                value={selectedSessionId}
                                onChange={(event) =>
                                    setSelectedSessionId(
                                        event.target.value
                                    )
                                }
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-10 text-sm font-medium text-gray-900 outline-none transition hover:border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                                required
                            >
                                <option value="">
                                    Select a training session
                                </option>

                                {sessions.map((session) => (
                                    <option
                                        key={session.id}
                                        value={session.id}
                                    >
                                        {
                                            session.clusterName
                                        }{" "}
                                        —{" "}
                                        {
                                            session.community
                                        }{" "}
                                        — {session.lga} —{" "}
                                        {formatDate(
                                            session.trainingDate
                                        )}
                                    </option>
                                ))}
                            </select>

                            <ChevronDownIcon />
                        </div>
                    )}
                </section>

                {/* =================================================
                    Progress
                ================================================= */}

                {selectedSession && (
                    <section className="border-y border-gray-100 bg-gray-50/70 px-5 py-6 sm:px-7">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${isTrainingComplete
                                                ? "bg-green-100 text-green-600"
                                                : "bg-orange-100 text-orange-600"
                                            }`}
                                    >
                                        {isTrainingComplete ? (
                                            <CheckIcon />
                                        ) : (
                                            <ClockIcon />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-gray-950">
                                            Training Progress
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {isTrainingComplete
                                                ? "All expected collectors recorded"
                                                : "Collectors recorded for this session"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-left sm:text-right">
                                <p className="text-2xl font-bold tracking-tight text-gray-950">
                                    {recordedCollectors}
                                    <span className="text-gray-400">
                                        {" "}
                                        /{" "}
                                        {expectedCollectors}
                                    </span>
                                </p>

                                <p className="text-xs font-semibold text-gray-500">
                                    {Math.round(progress)}%
                                    complete
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isTrainingComplete
                                        ? "bg-green-500"
                                        : "bg-orange-500"
                                    }`}
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-500">
                                {remainingCollectors > 0
                                    ? `${remainingCollectors} collector${remainingCollectors ===
                                        1
                                        ? ""
                                        : "s"
                                    } remaining`
                                    : "Target reached"}
                            </p>

                            <p className="text-xs font-bold text-gray-700">
                                Target:{" "}
                                {expectedCollectors}
                            </p>
                        </div>

                        {isTrainingComplete && (
                            <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5">
                                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                                    <CheckIcon />
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-green-800">
                                        Training complete
                                    </p>

                                    <p className="mt-0.5 text-xs leading-5 text-green-700">
                                        All expected collectors
                                        have been recorded for
                                        this training session.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* =================================================
                    Collector Information
                ================================================= */}

                <section
                    className={`p-5 sm:p-7 ${isTrainingComplete
                            ? "opacity-60"
                            : ""
                        }`}
                >
                    <div className="mb-6 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                            <UserIcon />
                        </div>

                        <div>
                            <h2 className="text-base font-bold text-gray-950">
                                Collector Information
                            </h2>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Enter the personal details of the
                                collector.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* Full Name */}

                        <div className="sm:col-span-2">
                            <FieldLabel
                                icon={<UserIcon className="h-4 w-4" />}
                                required
                            >
                                Collector Full Name
                            </FieldLabel>

                            <input
                                type="text"
                                value={fullName}
                                onChange={(event) =>
                                    setFullName(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                                placeholder="Enter collector full name"
                                required
                                disabled={
                                    isTrainingComplete ||
                                    saving
                                }
                            />
                        </div>

                        {/* Gender */}

                        <div>
                            <FieldLabel
                                icon={<UserIcon className="h-4 w-4" />}
                                required
                            >
                                Gender
                            </FieldLabel>

                            <div className="relative">
                                <select
                                    value={gender}
                                    onChange={(event) =>
                                        setGender(
                                            event.target
                                                .value as
                                            | "Male"
                                            | "Female"
                                        )
                                    }
                                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-10 text-sm font-medium text-gray-900 outline-none transition hover:border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                                    required
                                    disabled={
                                        isTrainingComplete ||
                                        saving
                                    }
                                >
                                    <option value="">
                                        Select gender
                                    </option>

                                    <option value="Female">
                                        Female
                                    </option>

                                    <option value="Male">
                                        Male
                                    </option>
                                </select>

                                <ChevronDownIcon />
                            </div>
                        </div>

                        {/* Phone Number */}

                        <div>
                            <FieldLabel
                                icon={
                                    <PhoneIcon className="h-4 w-4" />
                                }
                                required
                            >
                                Phone Number
                            </FieldLabel>

                            <p className="mb-2 text-xs leading-5 text-gray-500">
                                Nigerian mobile number, e.g.
                                08012345678
                            </p>

                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(event) =>
                                    setPhoneNumber(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                                placeholder="08012345678"
                                inputMode="numeric"
                                required
                                disabled={
                                    isTrainingComplete ||
                                    saving
                                }
                            />
                        </div>

                        {/* Newly Recruited */}

                        <div className="sm:col-span-2">
                            <FieldLabel required>
                                Newly Recruited?
                            </FieldLabel>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    disabled={
                                        isTrainingComplete ||
                                        saving
                                    }
                                    onClick={() =>
                                        setNewlyRecruited(
                                            "Yes"
                                        )
                                    }
                                    className={`rounded-xl border px-4 py-3.5 text-left transition ${newlyRecruited ===
                                            "Yes"
                                            ? "border-green-500 bg-green-50 ring-4 ring-green-500/10"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                        } disabled:cursor-not-allowed disabled:bg-gray-50`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p
                                                className={`text-sm font-bold ${newlyRecruited ===
                                                        "Yes"
                                                        ? "text-green-700"
                                                        : "text-gray-800"
                                                    }`}
                                            >
                                                Yes
                                            </p>

                                            <p className="mt-0.5 text-xs text-gray-500">
                                                Newly recruited
                                                collector
                                            </p>
                                        </div>

                                        {newlyRecruited ===
                                            "Yes" && (
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white">
                                                    <CheckIcon />
                                                </span>
                                            )}
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        isTrainingComplete ||
                                        saving
                                    }
                                    onClick={() =>
                                        setNewlyRecruited(
                                            "No"
                                        )
                                    }
                                    className={`rounded-xl border px-4 py-3.5 text-left transition ${newlyRecruited ===
                                            "No"
                                            ? "border-orange-400 bg-orange-50 ring-4 ring-orange-400/10"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                        } disabled:cursor-not-allowed disabled:bg-gray-50`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p
                                                className={`text-sm font-bold ${newlyRecruited ===
                                                        "No"
                                                        ? "text-orange-600"
                                                        : "text-gray-800"
                                                    }`}
                                            >
                                                No
                                            </p>

                                            <p className="mt-0.5 text-xs text-gray-500">
                                                Existing collector
                                            </p>
                                        </div>

                                        {newlyRecruited ===
                                            "No" && (
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white">
                                                    <CheckIcon />
                                                </span>
                                            )}
                                    </div>
                                </button>
                            </div>

                            {/* Hidden required input keeps
                                browser validation for the
                                button-style selection. */}

                            <input
                                type="text"
                                value={newlyRecruited}
                                onChange={() => undefined}
                                required
                                tabIndex={-1}
                                aria-hidden="true"
                                className="pointer-events-none absolute h-0 w-0 opacity-0"
                                disabled={
                                    isTrainingComplete ||
                                    saving
                                }
                            />
                        </div>
                    </div>
                </section>

                {/* =================================================
                    Success Message
                ================================================= */}

                {successMessage && (
                    <div className="mx-5 mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 sm:mx-7">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                            <CheckIcon />
                        </div>

                        <div>
                            <p className="text-sm font-bold text-green-800">
                                Collector saved
                            </p>

                            <p className="mt-0.5 text-xs leading-5 text-green-700">
                                {successMessage}
                            </p>
                        </div>
                    </div>
                )}

                {/* =================================================
                    Submit Area
                ================================================= */}

                <div className="border-t border-gray-100 bg-gray-50/60 p-5 sm:p-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                Ready to save?
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                                Make sure all collector details
                                are correct before submitting.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={
                                isTrainingComplete || saving
                            }
                            className="inline-flex min-w-48 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
                        >
                            {saving ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    Saving Collector...
                                </>
                            ) : isTrainingComplete ? (
                                <>
                                    <CheckIcon />
                                    Training Complete
                                </>
                            ) : (
                                <>
                                    <CheckIcon />
                                    Save Collector
                                </>
                            )}
                        </button>
                    </div>

                    {fromTrainingPage &&
                        selectedSession && (
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        `/training/${selectedSession.id}/collectors`
                                    )
                                }
                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950"
                            >
                                <ChevronLeftIcon />
                                Back to Training
                            </button>
                        )}
                </div>
            </form>
        </div>
    );
}
