"use client";

import { useRouter } from "next/navigation";

function ArrowLeftIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
        </svg>
    );
}

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex justify-center items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-2.5 text-sm font-medium text-gray-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 hover:cursor-pointer"
        >
            <ArrowLeftIcon />
            <span>Back</span>
        </button>
    );
}