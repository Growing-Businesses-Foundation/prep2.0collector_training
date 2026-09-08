"use client";

import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";

interface TrainingFiltersProps {
    fieldOfficers: string[];
    lgas: string[];
}

export default function TrainingFilters({
    fieldOfficers,
    lgas,
}: TrainingFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSearch =
        searchParams.get("search") || "";

    const currentFieldOfficer =
        searchParams.get("fieldOfficer") || "";

    const currentLga =
        searchParams.get("lga") || "";

    const currentStatus =
        searchParams.get("status") || "";

    const currentFromDate =
        searchParams.get("fromDate") || "";

    const currentToDate =
        searchParams.get("toDate") || "";

    function updateFilter(
        key: string,
        value: string
    ) {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        router.push(
            `${pathname}?${params.toString()}`
        );
    }

    function clearFilters() {
        router.push(pathname);
    }

    const hasFilters =
        currentSearch ||
        currentFieldOfficer ||
        currentLga ||
        currentStatus ||
        currentFromDate ||
        currentToDate;

    return (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4">

                {/* Search */}
                <div>
                    <label
                        htmlFor="training-search"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                        Search Cluster
                    </label>

                    <div className="relative">
                        <svg
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle
                                cx="11"
                                cy="11"
                                r="7"
                            />
                            <path d="m20 20-4-4" />
                        </svg>

                        <input
                            id="training-search"
                            type="text"
                            defaultValue={currentSearch}
                            placeholder="Search by cluster name..."
                            onKeyDown={(event) => {
                                if (
                                    event.key ===
                                    "Enter"
                                ) {
                                    updateFilter(
                                        "search",
                                        event.currentTarget.value.trim()
                                    );
                                }
                            }}
                            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                        />
                    </div>
                </div>

                {/* Dropdown filters */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Field Officer */}
                    <div>
                        <label
                            htmlFor="field-officer-filter"
                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                            Field Officer
                        </label>

                        <select
                            id="field-officer-filter"
                            value={
                                currentFieldOfficer
                            }
                            onChange={(event) =>
                                updateFilter(
                                    "fieldOfficer",
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                        >
                            <option value="">
                                All Field Officers
                            </option>

                            {fieldOfficers.map(
                                (fieldOfficer) => (
                                    <option
                                        key={
                                            fieldOfficer
                                        }
                                        value={
                                            fieldOfficer
                                        }
                                    >
                                        {
                                            fieldOfficer
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {/* LGA */}
                    <div>
                        <label
                            htmlFor="lga-filter"
                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                            LGA
                        </label>

                        <select
                            id="lga-filter"
                            value={currentLga}
                            onChange={(event) =>
                                updateFilter(
                                    "lga",
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                        >
                            <option value="">
                                All LGAs
                            </option>

                            {lgas.map((lga) => (
                                <option
                                    key={lga}
                                    value={lga}
                                >
                                    {lga}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label
                            htmlFor="status-filter"
                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                            Status
                        </label>

                        <select
                            id="status-filter"
                            value={
                                currentStatus
                            }
                            onChange={(event) =>
                                updateFilter(
                                    "status",
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                        >
                            <option value="">
                                All Statuses
                            </option>

                            <option value="Not Started">
                                Not Started
                            </option>

                            <option value="In Progress">
                                In Progress
                            </option>

                            <option value="Completed">
                                Completed
                            </option>
                        </select>
                    </div>

                    {/* From Date */}
                    <div>
                        <label
                            htmlFor="from-date-filter"
                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                            From Date
                        </label>

                        <input
                            id="from-date-filter"
                            type="date"
                            value={
                                currentFromDate
                            }
                            onChange={(event) =>
                                updateFilter(
                                    "fromDate",
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                        />
                    </div>

                    {/* To Date */}
                    <div>
                        <label
                            htmlFor="to-date-filter"
                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                            To Date
                        </label>

                        <input
                            id="to-date-filter"
                            type="date"
                            value={currentToDate}
                            onChange={(event) =>
                                updateFilter(
                                    "toDate",
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                        />
                    </div>
                </div>

                {/* Bottom controls */}
                <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-gray-500">
                        Use the filters to narrow down
                        training sessions.
                    </p>

                    {hasFilters ? (
                        <button
                            type="button"
                            onClick={
                                clearFilters
                            }
                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                            Clear Filters
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
