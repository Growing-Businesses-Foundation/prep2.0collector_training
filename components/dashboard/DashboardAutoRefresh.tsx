"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL = 60 * 1000; // 60 seconds

export default function DashboardAutoRefresh() {
    const router = useRouter();

    useEffect(() => {
        const refresh = () => {
            if (document.visibilityState === "visible") {
                router.refresh();
            }
        };

        const interval = setInterval(refresh, REFRESH_INTERVAL);

        return () => {
            clearInterval(interval);
        };
    }, [router]);

    return null;
}
