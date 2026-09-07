import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentTrainings from "@/components/dashboard/RecentTrainings";
import DashboardActions from "@/components/dashboard/DashboardActions";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const dashboardData = await getDashboardData(
        session.user.role,
        session.user.foId
    );

    return (
        <AppShell role={session.user.role}>
            <div className="px-4 py-6 sm:px-6 sm:py-8">
                <div className="mx-auto max-w-7xl">

                    {/* Header */}
                    <div className="mb-8">
                        <p className="text-sm font-medium text-gray-500">
                            Collector Training
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            Dashboard
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Welcome back, {session.user.name}.
                        </p>
                    </div>

                    {/* Statistics */}
                    <DashboardStats
                        stats={dashboardData.stats}
                    />

                    <DashboardActions
                        canWrite={session.user.role !== "READ_ONLY"}
                    />
                    
                    {/* Recent Trainings */}
                    <RecentTrainings
                        trainings={dashboardData.recentTrainings}
                    />

                </div>
            </div>
        </AppShell>
    );
}