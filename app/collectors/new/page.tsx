import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import CollectorForm from "@/components/collectors/CollectorForm";
import BackButton from "@/components/navigation/BackButton";

export default async function NewCollectorPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    // Only ADMIN and WRITE users can create collectors.
    if (
        session.user.role !== "ADMIN" &&
        session.user.role !== "WRITE"
    ) {
        redirect("/dashboard");
    }

    return (
        <main className="min-h-screen bg-gray-100 px-4 py-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <div className="mb-4">
                        <BackButton label="Back to Dashboard" />
                    </div>

                    <p className="text-sm text-gray-500">
                        Collector Training
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-gray-900">
                        Add Collector
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Select a training session and record the collector&apos;s
                        information.
                    </p>
                </div>

                <CollectorForm role={session.user.role} />
            </div>
        </main>
    );
}
