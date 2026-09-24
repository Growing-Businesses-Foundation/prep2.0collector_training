import { redirect } from "next/navigation";

import { getMaintenanceSettings } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
    const settings = await getMaintenanceSettings();

    if (!settings.maintenanceMode) {
        redirect("/login");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
            <div className="w-full max-w-lg text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-8 w-8 text-amber-600"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.42 3.5 4.2 16.02A1.5 1.5 0 0 0 5.5 18.25h13a1.5 1.5 0 0 0 1.3-2.23L12.58 3.5a.67.67 0 0 0-1.16 0Z"
                        />

                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v4"
                        />

                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 16h.01"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    We&apos;ll be back soon
                </h1>

                <p className="mt-4 text-base leading-7 text-slate-600">
                    {settings.message}
                </p>

                <div className="mt-8 rounded-lg border border-slate-200 bg-amber-600 px-5 py-4 text-sm text-white shadow-sm">
                    Please check back later.
                </div>
            </div>
        </main>
    );
}