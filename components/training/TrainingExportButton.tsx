"use client";

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
    const handleExport = () => {
        const params = new URLSearchParams();

        if (search) {
            params.set("search", search);
        }

        if (fieldOfficer) {
            params.set(
                "fieldOfficer",
                fieldOfficer
            );
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

        const link =
            document.createElement("a");

        link.href = downloadUrl;
        link.download = "";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
