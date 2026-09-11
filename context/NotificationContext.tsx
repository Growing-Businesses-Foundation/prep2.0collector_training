"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import Notification, {
    type NotificationData,
    type NotificationType,
} from "@/components/Notification";

type NotificationInput = {
    title: string;
    message?: string;
    duration?: number;
};

type NotificationContextType = {
    notify: {
        success: (input: NotificationInput) => void;
        error: (input: NotificationInput) => void;
        warning: (input: NotificationInput) => void;
        info: (input: NotificationInput) => void;
    };
};

const NotificationContext =
    createContext<NotificationContextType | null>(null);

export function NotificationProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [notifications, setNotifications] = useState<NotificationData[]>(
        []
    );

    const removeNotification = useCallback((id: string) => {
        setNotifications((current) =>
            current.filter((notification) => notification.id !== id)
        );
    }, []);

    const addNotification = useCallback(
        (type: NotificationType, input: NotificationInput) => {
            const id = crypto.randomUUID();

            setNotifications((current) => [
                ...current,
                {
                    id,
                    type,
                    title: input.title,
                    message: input.message,
                    duration: input.duration,
                    onClose: removeNotification,
                },
            ]);
        },
        [removeNotification]
    );

    const notify = useMemo(
        () => ({
            success: (input: NotificationInput) =>
                addNotification("success", input),

            error: (input: NotificationInput) =>
                addNotification("error", input),

            warning: (input: NotificationInput) =>
                addNotification("warning", input),

            info: (input: NotificationInput) =>
                addNotification("info", input),
        }),
        [addNotification]
    );

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}

            {notifications.length > 0 && (
                <div className="pointer-events-none fixed inset-0 z-9999 flex items-center justify-center p-4">
                    <div className="pointer-events-none absolute inset-0 bg-black/5 backdrop-blur-[1px]" />

                    <div className="relative flex w-full max-w-lg flex-col gap-3">
                        {notifications.map((notification) => (
                            <Notification
                                key={notification.id}
                                {...notification}
                            />
                        ))}
                    </div>
                </div>
            )}

        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error(
            "useNotification must be used inside NotificationProvider"
        );
    }

    return context;
}
