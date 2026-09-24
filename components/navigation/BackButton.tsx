"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
    label?: string;
}

export default function BackButton({
    label = "Back",
}: BackButtonProps) {
    const router = useRouter();

    return (
        <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex justify-center items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-2.5 text-sm font-medium text-gray-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 hover:cursor-pointer"
        >
            <span aria-hidden="true">←</span>
            {label}
        </button>
    );
}