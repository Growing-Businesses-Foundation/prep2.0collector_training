"use client";

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
    const handleExport = () => {
        const params =
            new URLSearchParams();

        if (search) {
            params.set(
                "search",
                search
            );
        }

        if (gender) {
            params.set(
                "gender",
                gender
            );
        }

        if (recruited) {
            params.set(
                "recruited",
                recruited
            );
        }

        if (fieldOfficer) {
            params.set(
                "fieldOfficer",
                fieldOfficer
            );
        }

        if (lga) {
            params.set(
                "lga",
                lga
            );
        }

        if (cluster) {
            params.set(
                "cluster",
                cluster
            );
        }

        if (fromDate) {
            params.set(
                "fromDate",
                fromDate
            );
        }

        if (toDate) {
            params.set(
                "toDate",
                toDate
            );
        }

        const downloadUrl =
            `/api/collectors/export?${params.toString()}`;

        const link =
            document.createElement(
                "a"
            );

        link.href = downloadUrl;
        link.download = "";

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );
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
