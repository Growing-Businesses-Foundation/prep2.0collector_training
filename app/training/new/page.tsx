import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import TrainingForm from "@/components/training/TrainingForm";
import BackButton from "@/components/navigation/BackButton";

export default async function NewTrainingPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    // Only ADMIN and WRITE users can create training sessions.
    if (
        session.user.role !== "ADMIN" &&
        session.user.role !== "WRITE"
    ) {
        redirect("/training");
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6">
                    <BackButton label="Back to Training Sessions" />
                </div>

                <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                        Training Management
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                        New Training Session
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Record a new collector training session.
                    </p>
                </div>

                <TrainingForm
                    role={session.user.role}
                    foId={session.user.foId}
                    foName={session.user.name ?? undefined}
                    mode="create"
                />
            </div>
        </main>
    );
}
