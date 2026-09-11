"use client";

import { useEffect } from "react";

export type NotificationType =
    | "success"
    | "error"
    | "warning"
    | "info";

export interface NotificationData {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number;
    onClose: (id: string) => void;
}

const notificationStyles: Record<
    NotificationType,
    {
        icon: string;
        iconClass: string;
        borderClass: string;
    }
> = {
    success: {
        icon: "✓",
        iconClass: "bg-green-100 text-green-700",
        borderClass: "border-green-200",
    },
    error: {
        icon: "!",
        iconClass: "bg-red-100 text-red-700",
        borderClass: "border-red-200",
    },
    warning: {
        icon: "!",
        iconClass: "bg-amber-100 text-amber-700",
        borderClass: "border-amber-200",
    },
    info: {
        icon: "i",
        iconClass: "bg-blue-100 text-blue-700",
        borderClass: "border-blue-200",
    },
};

export default function Notification({
    id,
    type,
    title,
    message,
    duration = 5000,
    onClose,
}: NotificationData) {
    const style = notificationStyles[type];

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    return (
        <div
            role="alert"
            className={`pointer-events-auto w-full max-w-lg overflow-hidden rounded-2xl border bg-white shadow-2xl ${style.borderClass}`}
        >
            <div className="flex items-start gap-5 p-7">
                <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold shadow-sm ${style.iconClass}`}
                >
                    {style.icon}
                </div>

                <div className="min-w-0 flex-1 pt-1">
                    <p className="text-base font-bold text-gray-900">
                        {title}
                    </p>

                    {message && (
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            {message}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onClose(id)}
                    aria-label="Close notification"
                    className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                    ×
                </button>
            </div>
        </div>

    );
}
