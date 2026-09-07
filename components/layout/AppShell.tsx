"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";

interface AppShellProps {
    children: ReactNode;
    role: "ADMIN" | "WRITE" | "READ_ONLY";
}

export default function AppShell({
    children,
    role,
}: AppShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex min-h-screen">
                <Sidebar
                    role={role}
                    mobileOpen={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                />

                <div className="min-w-0 flex-1">
                    {/* Mobile header */}
                    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white px-4 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                            aria-label="Open navigation"
                        >
                            ☰
                        </button>

                        <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-900">
                                Collector Training
                            </p>

                            <p className="text-xs text-gray-500">
                                Data Collection System
                            </p>
                        </div>
                    </header>

                    <main className="min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}