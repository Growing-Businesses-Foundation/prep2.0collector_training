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

    const { role, foId, name } = session.user;

    if (role === "READ_ONLY") {
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
                        New Training Session
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Enter the training information before adding collectors.
                    </p>
                </div>

                <TrainingForm
                    role={role}
                    foId={foId}
                    foName={name || undefined}
                />
            </div>
        </main>
    );
}