"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

const ACTIVITY_EVENTS = [
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
    "click",
];

export default function SessionTimeout() {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastActivityRef = useRef(0);

    useEffect(() => {
        const resetTimer = () => {
            const now = Date.now();

            // Prevent excessive timer resets from frequent events
            if (now - lastActivityRef.current < 1000) {
                return;
            }

            lastActivityRef.current = now;

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                signOut({
                    callbackUrl: "/login?reason=idle",
                });
            }, IDLE_TIMEOUT);
        };

        ACTIVITY_EVENTS.forEach((event) => {
            window.addEventListener(event, resetTimer, {
                passive: true,
            });
        });

        // Start the timer when the component mounts
        resetTimer();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            ACTIVITY_EVENTS.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, []);

    return null;
}
