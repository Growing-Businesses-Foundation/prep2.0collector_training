"use client";

import Link from "next/link";

function SearchIcon() {
    return (
        <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
        </svg>
    );
}

function HomeIcon() {
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
            <path d="m3 10 9-7 9 7" />
            <path d="M5 9v11h14V9" />
            <path d="M9 20v-6h6v6" />
        </svg>
    );
}

function ArrowLeftIcon() {
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

export default function NotFound() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-green-50 via-white to-orange-50 px-5 py-10">
            {/* Background decorations */}
            <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-green-200/30 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />

            <div className="relative z-10 w-full max-w-lg text-center">
                {/* Brand mark */}
                <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-600/20">
                    <SearchIcon />
                </div>

                {/* 404 */}
                <p className="text-8xl font-black tracking-tight text-green-600 sm:text-9xl">
                    404
                </p>

                {/* Orange accent */}
                <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-orange-500" />

                {/* Message */}
                <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                    Page not found
                </h1>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                    The page you are looking for doesn&apos;t exist,
                    may have been moved, or is no longer available.
                </p>

                {/* Actions */}
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 hover:shadow-md"
                    >
                        <HomeIcon />
                        Go to Dashboard
                    </Link>

                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950"
                    >
                        <ArrowLeftIcon />
                        Go Back
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-12">
                    <div className="mx-auto mb-3 h-px w-16 bg-gray-200" />

                    <p className="text-xs font-medium text-gray-400">
                        Collector Training Management System
                    </p>
                </div>
            </div>
        </main>
    );
}
