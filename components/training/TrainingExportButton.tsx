"use client";

import { useNotification } from "@/context/NotificationContext";

interface TrainingExportButtonProps {
    search?: string;
    fieldOfficer?: string;
    lga?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}

export default function TrainingExportButton({
    search = "",
    fieldOfficer = "",
    lga = "",
    status = "",
    fromDate = "",
    toDate = "",
}: TrainingExportButtonProps) {
    const { notify } = useNotification();

    const handleExport = async () => {
        const params = new URLSearchParams();

        if (search) {
            params.set("search", search);
        }

        if (fieldOfficer) {
            params.set("fieldOfficer", fieldOfficer);
        }

        if (lga) {
            params.set("lga", lga);
        }

        if (status) {
            params.set("status", status);
        }

        if (fromDate) {
            params.set("fromDate", fromDate);
        }

        if (toDate) {
            params.set("toDate", toDate);
        }

        const downloadUrl =
            `/api/training-sessions/export?${params.toString()}`;

        try {
            const response = await fetch(downloadUrl);

            if (!response.ok) {
                let message =
                    "The training CSV could not be exported.";

                try {
                    const data = await response.json();

                    if (data.message) {
                        message = data.message;
                    }
                } catch {
                    // Ignore JSON parsing errors.
                }

                notify.error({
                    title: "Training Export Failed",
                    message,
                });

                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = "training-sessions.csv";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

            notify.success({
                title: "Training Export Complete",
                message:
                    "The training CSV has been downloaded successfully.",
            });
        } catch {
            notify.error({
                title: "Training Export Failed",
                message:
                    "The training CSV could not be downloaded. Please try again.",
            });
        }
    };

    return (
        <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:cursor-pointer hover:bg-gray-700 hover:text-gray-50"
        >
            Export CSV
        </button>
    );
}
