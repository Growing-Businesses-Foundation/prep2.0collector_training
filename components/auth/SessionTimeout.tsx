// "use client";

// import { useEffect, useRef } from "react";
// import { signOut } from "next-auth/react";

// const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

// const ACTIVITY_EVENTS = [
//     "mousedown",
//     "keydown",
//     "scroll",
//     "touchstart",
//     "click",
// ];

// export default function SessionTimeout() {
//     const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//     const lastActivityRef = useRef(0);

//     useEffect(() => {
//         const resetTimer = () => {
//             const now = Date.now();

//             // Prevent excessive timer resets from frequent events
//             if (now - lastActivityRef.current < 1000) {
//                 return;
//             }

//             lastActivityRef.current = now;

//             if (timeoutRef.current) {
//                 clearTimeout(timeoutRef.current);
//             }

//             timeoutRef.current = setTimeout(() => {
//                 signOut({
//                     callbackUrl: "/login?reason=idle",
//                 });
//             }, IDLE_TIMEOUT);
//         };

//         ACTIVITY_EVENTS.forEach((event) => {
//             window.addEventListener(event, resetTimer, {
//                 passive: true,
//             });
//         });

//         // Start the timer when the component mounts
//         resetTimer();

//         return () => {
//             if (timeoutRef.current) {
//                 clearTimeout(timeoutRef.current);
//             }

//             ACTIVITY_EVENTS.forEach((event) => {
//                 window.removeEventListener(event, resetTimer);
//             });
//         };
//     }, []);

//     return null;
// }


"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const STATUS_CHECK_INTERVAL = 10 * 1000; // 10 seconds

const ACTIVITY_EVENTS = [
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
    "click",
];

export default function SessionTimeout() {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    const statusIntervalRef =
        useRef<ReturnType<typeof setInterval> | null>(null);

    const lastActivityRef = useRef(0);

    useEffect(() => {
        /*
         * -------------------------------
         * IDLE TIMEOUT
         * -------------------------------
         */
        const resetTimer = () => {
            const now = Date.now();

            // Prevent excessive timer resets
            // from frequent browser events.
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

        /*
         * -------------------------------
         * ACCOUNT STATUS CHECK
         * -------------------------------
         *
         * Check MongoDB-backed account status
         * every 5 seconds.
         */
        const checkAccountStatus = async () => {
            try {
                const response = await fetch(
                    "/api/auth/status",
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                /*
                 * 401 means the account is no longer
                 * authenticated/active.
                 */
                if (response.status === 401) {
                    if (statusIntervalRef.current) {
                        clearInterval(
                            statusIntervalRef.current
                        );
                    }

                    await signOut({
                        callbackUrl:
                            "/login?reason=deactivated",
                    });
                }
            } catch (error) {
                /*
                 * Do NOT log the user out just because
                 * the network temporarily failed.
                 */
                console.error(
                    "Account status check failed:",
                    error
                );
            }
        };

        /*
         * Register activity listeners.
         */
        ACTIVITY_EVENTS.forEach((event) => {
            window.addEventListener(
                event,
                resetTimer,
                {
                    passive: true,
                }
            );
        });

        /*
         * Start idle timer.
         */
        resetTimer();

        /*
         * Check account status immediately.
         */
        checkAccountStatus();

        /*
         * Continue checking every 5 seconds.
         */
        statusIntervalRef.current =
            setInterval(
                checkAccountStatus,
                STATUS_CHECK_INTERVAL
            );

        return () => {
            if (timeoutRef.current) {
                clearTimeout(
                    timeoutRef.current
                );
            }

            if (statusIntervalRef.current) {
                clearInterval(
                    statusIntervalRef.current
                );
            }

            ACTIVITY_EVENTS.forEach((event) => {
                window.removeEventListener(
                    event,
                    resetTimer
                );
            });
        };
    }, []);

    return null;
}
