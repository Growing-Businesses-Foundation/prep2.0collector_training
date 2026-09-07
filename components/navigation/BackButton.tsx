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
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
            <span aria-hidden="true">←</span>
            {label}
        </button>
    );
}