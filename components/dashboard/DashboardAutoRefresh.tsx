"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL = 5 * 1000; // 5 seconds

export default function DashboardAutoRefresh() {
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, REFRESH_INTERVAL);

        return () => {
            clearInterval(interval);
        };
    }, [router]);

    return null;
}
