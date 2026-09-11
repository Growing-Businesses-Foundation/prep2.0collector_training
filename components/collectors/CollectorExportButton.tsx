"use client";

import { useNotification } from "@/context/NotificationContext";

interface CollectorExportButtonProps {
    search?: string;
    gender?: string;
    recruited?: string;
    fieldOfficer?: string;
    lga?: string;
    cluster?: string;
    fromDate?: string;
    toDate?: string;
}

export default function CollectorExportButton({
    search = "",
    gender = "",
    recruited = "",
    fieldOfficer = "",
    lga = "",
    cluster = "",
    fromDate = "",
    toDate = "",
}: CollectorExportButtonProps) {
    const { notify } = useNotification();

    const handleExport = async () => {
        const params = new URLSearchParams();

        if (search) {
            params.set("search", search);
        }

        if (gender) {
            params.set("gender", gender);
        }

        if (recruited) {
            params.set("recruited", recruited);
        }

        if (fieldOfficer) {
            params.set("fieldOfficer", fieldOfficer);
        }

        if (lga) {
            params.set("lga", lga);
        }

        if (cluster) {
            params.set("cluster", cluster);
        }

        if (fromDate) {
            params.set("fromDate", fromDate);
        }

        if (toDate) {
            params.set("toDate", toDate);
        }

        const downloadUrl =
            `/api/collectors/export?${params.toString()}`;

        try {
            const response =
                await fetch(downloadUrl);

            if (!response.ok) {
                let message =
                    "The collector CSV could not be exported.";

                try {
                    const data =
                        await response.json();

                    if (data.message) {
                        message =
                            data.message;
                    }
                } catch {
                    // Ignore JSON parsing errors.
                }

                notify.error({
                    title: "Collector Export Failed",
                    message,
                });

                return;
            }

            const blob =
                await response.blob();

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement("a");

            link.href = url;
            link.download =
                "collectors.csv";

            document.body.appendChild(
                link
            );

            link.click();

            document.body.removeChild(
                link
            );

            window.URL.revokeObjectURL(
                url
            );

            notify.success({
                title: "Collector Export Complete",
                message:
                    "The collector CSV has been downloaded successfully.",
            });
        } catch {
            notify.error({
                title: "Collector Export Failed",
                message:
                    "The collector CSV could not be downloaded. Please try again.",
            });
        }
    };

    return (
        <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-700 hover:text-gray-50 hover:cursor-pointer"
        >
            Export CSV
        </button>
    );
}
