// app/training/[trainingSessionId]/edit/page.tsx

import { notFound, redirect } from "next/navigation";
import { ObjectId } from "mongodb";

import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import TrainingForm from "@/components/training/TrainingForm";
import BackButton from "@/components/navigation/BackButton";

interface EditTrainingPageProps {
    params: Promise<{
        trainingSessionId: string;
    }>;
}

export default async function EditTrainingPage({
    params,
}: EditTrainingPageProps) {
    const session = await getServerSession(authOptions);

    /*
     * User must be logged in.
     */
    if (!session?.user) {
        redirect("/login");
    }

    /*
     * Only ADMIN and WRITE users can edit training sessions.
     *
     * READ_ONLY:
     * - Can view
     * - Cannot edit
     *
     * RESTRICTED_READ_ONLY:
     * - Can view
     * - Cannot edit
     * - Newly recruited data is restricted
     */
    if (
        session.user.role !== "ADMIN" &&
        session.user.role !== "WRITE"
    ) {
        redirect("/training");
    }

    const { trainingSessionId } = await params;

    /*
     * Validate MongoDB ObjectId.
     */
    if (!ObjectId.isValid(trainingSessionId)) {
        notFound();
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const trainingSession =
        await db.collection("training_sessions").findOne({
            _id: new ObjectId(trainingSessionId),
        });

    /*
     * Training session does not exist.
     */
    if (!trainingSession) {
        notFound();
    }

    /*
     * WRITE users can only edit sessions belonging
     * to their assigned Field Officer.
     */
    if (
        session.user.role === "WRITE" &&
        trainingSession.fieldOfficerId !== session.user.foId
    ) {
        redirect("/training");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Back */}
                <div className="mb-6">
                    <BackButton label="Back to Training Sessions" />
                </div>

                {/* Page header */}
                <div className="mb-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                                Training Management
                            </p>

                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                Edit Training Session
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Update the details of this training
                                session.
                            </p>
                        </div>

                        <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">
                                Training Session
                            </p>

                            <p className="mt-1 text-sm font-semibold text-green-800">
                                {trainingSession.clusterName}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Training form */}
                <TrainingForm
                    role={session.user.role}
                    foId={session.user.foId}
                    foName={session.user.name ?? undefined}
                    mode="edit"
                    trainingSessionId={trainingSessionId}
                    initialData={{
                        trainingDate:
                            trainingSession.trainingDate || "",

                        fieldOfficerId:
                            trainingSession.fieldOfficerId || "",

                        fieldOfficerName:
                            trainingSession.fieldOfficerName || "",

                        clusterNumber:
                            trainingSession.clusterNumber || "",

                        lga:
                            trainingSession.lga || "",

                        community:
                            trainingSession.community || "",

                        venue:
                            trainingSession.venue || "",

                        facilitator:
                            trainingSession.facilitator || "",

                        expectedCollectors:
                            Number(
                                trainingSession.expectedCollectors || 0
                            ),

                        latitude:
                            Number(
                                trainingSession.latitude || 0
                            ),

                        longitude:
                            Number(
                                trainingSession.longitude || 0
                            ),

                        photoUrl:
                            trainingSession.photoUrl || null,
                    }}
                />
            </div>
        </div>
    );
}
