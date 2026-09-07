"use client";

import { FormEvent, useState } from "react";

interface TrainingFormProps {
    role: "ADMIN" | "WRITE" | "READ_ONLY";
    foId?: string;
    foName?: string;
}

function CalendarIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <circle cx="9" cy="8" r="3" />
            <path d="M3 20c.6-3.2 2.6-5 6-5s5.4 1.8 6 5" />
            <path d="M16 5.2a3 3 0 010 5.6M18 15c1.8.4 3 2 3.5 5" />
        </svg>
    );
}

function LocationIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1116 0z" />
            <circle cx="12" cy="10" r="2.5" />
        </svg>
    );
}

function CameraIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M4 7h4l1.5-2h5L16 7h4a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" />
            <circle cx="12" cy="13" r="3.5" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
        >
            <path d="M5 12l4 4L19 6" />
        </svg>
    );
}

function MapPinIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1116 0z" />
            <circle cx="12" cy="10" r="2.5" />
        </svg>
    );
}

function UploadIcon() {
    return (
        <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M12 16V4" />
            <path d="M7 9l5-5 5 5" />
            <path d="M5 20h14" />
        </svg>
    );
}

function SaveIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M5 3h12l3 3v15H5z" />
            <path d="M8 3v6h8V3M8 21v-7h8v7" />
        </svg>
    );
}

function Spinner() {
    return (
        <svg
            className="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                className="opacity-25"
                stroke="currentColor"
                strokeWidth="3"
            />
            <path
                d="M21 12a9 9 0 00-9-9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

function SectionHeader({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="mb-6 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                {icon}
            </div>

            <div>
                <h2 className="text-lg font-bold text-gray-900">
                    {title}
                </h2>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

function InputField({
    id,
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    required = true,
    min,
    icon,
    readOnly = false,
    disabled = false,
}: {
    id: string;
    label: string;
    value: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    min?: string;
    icon?: React.ReactNode;
    readOnly?: boolean;
    disabled?: boolean;
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
                {icon && (
                    <span className="text-gray-400">
                        {icon}
                    </span>
                )}

                {label}

                {required && label && (
                    <span className="text-orange-500">*</span>
                )}
            </label>

            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                min={min}
                readOnly={readOnly}
                disabled={disabled}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 ${disabled || readOnly
                    ? "border-gray-200 bg-gray-50 text-gray-600"
                    : "border-gray-200 bg-white hover:border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                    }`}
            />
        </div>
    );
}



export default function TrainingForm({
    role,
    foId,
    foName,
}: TrainingFormProps) {
    const [trainingDate, setTrainingDate] = useState("");
    const [fieldOfficerId, setFieldOfficerId] = useState(
        foId || ""
    );
    const [clusterName, setClusterName] = useState("");
    const [lga, setLga] = useState("");
    const [community, setCommunity] = useState("");
    const [venue, setVenue] = useState("");
    const [facilitator, setFacilitator] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [expectedCollectors, setExpectedCollectors] =
        useState("");

    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [locationLoading, setLocationLoading] =
        useState(false);
    const [submitting, setSubmitting] = useState(false);

    function captureLocation() {
        if (!navigator.geolocation) {
            alert(
                "Geolocation is not supported by this device."
            );
            return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(
                    position.coords.latitude.toString()
                );

                setLongitude(
                    position.coords.longitude.toString()
                );

                setLocationLoading(false);
            },
            (error) => {
                console.error("Location error:", error);

                alert(
                    "Unable to get your location. Please allow location access and try again."
                );

                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    }

    function handlePhotoChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("Photo must be less than 10MB.");
            return;
        }

        setPhoto(file);

        const previewUrl = URL.createObjectURL(file);
        setPhotoPreview(previewUrl);
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!latitude || !longitude) {
            alert(
                "Please capture the training venue location before continuing."
            );
            return;
        }

        if (!photo) {
            alert(
                "Please take or upload a training evidence photo before continuing."
            );
            return;
        }

        try {
            setSubmitting(true);

            const formData = new FormData();

            formData.append("trainingDate", trainingDate);
            formData.append(
                "fieldOfficerId",
                fieldOfficerId
            );
            formData.append("clusterName", clusterName);
            formData.append("lga", lga);
            formData.append("community", community);
            formData.append("venue", venue);
            formData.append("facilitator", facilitator);

            formData.append(
                "expectedCollectors",
                String(Number(expectedCollectors))
            );

            formData.append(
                "latitude",
                String(Number(latitude))
            );

            formData.append(
                "longitude",
                String(Number(longitude))
            );

            formData.append("photo", photo);

            const response = await fetch(
                "/api/training-sessions",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to create training session."
                );
                return;
            }

            alert(
                `Training session created successfully.\n\nSession ID: ${data.trainingSessionId}`
            );

            setTrainingDate("");
            setClusterName("");
            setLga("");
            setCommunity("");
            setVenue("");
            setFacilitator("");
            setExpectedCollectors("");
            setLatitude("");
            setLongitude("");
            setPhoto(null);
            setPhotoPreview("");

            if (role === "ADMIN") {
                setFieldOfficerId("");
            }

            console.log("Training session:", data);
        } catch (error) {
            console.error(
                "Training submission error:",
                error
            );

            alert("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* Main Information */}
            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="h-1 bg-linear-to-r from-green-600 via-green-500 to-orange-400" />

                <div className="p-6 md:p-8">
                    <SectionHeader
                        icon={<CalendarIcon />}
                        title="Training Information"
                        description="Enter the details for this collector training session."
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                        <InputField
                            id="trainingDate"
                            label="Training Date"
                            type="date"
                            value={trainingDate}
                            onChange={(event) =>
                                setTrainingDate(
                                    event.target.value
                                )
                            }
                            icon={<CalendarIcon />}
                        />

                        {/* Field Officer */}
                        <div>
                            <label
                                htmlFor="fieldOfficer"
                                className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"
                            >
                                <span className="text-gray-400">
                                    <UserIcon />
                                </span>

                                Field Officer
                                <span className="text-orange-500">*</span>
                            </label>

                            {role === "WRITE" ? (
                                <>
                                    <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50/60 px-4 py-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                            <UserIcon />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-gray-800">
                                                {foName ||
                                                    foId ||
                                                    "Assigned Field Officer"}
                                            </p>

                                            {foName &&
                                                foId && (
                                                    <p className="mt-0.5 text-xs text-gray-500">
                                                        ID:{" "}
                                                        {
                                                            foId
                                                        }
                                                    </p>
                                                )}
                                        </div>

                                        <span className="ml-auto rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
                                            Assigned
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs text-gray-500">
                                        Automatically assigned
                                        from your account.
                                    </p>
                                </>
                            ) : (
                                <InputField
                                    id="fieldOfficer"
                                    label=""
                                    value={
                                        fieldOfficerId
                                    }
                                    onChange={(event) =>
                                        setFieldOfficerId(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Enter Field Officer ID"
                                />
                            )}
                        </div>

                        <InputField
                            id="clusterName"
                            label="Cluster Name"
                            value={clusterName}
                            onChange={(event) =>
                                setClusterName(
                                    event.target.value
                                )
                            }
                            placeholder="e.g. FO 1, C1"
                        />

                        <InputField
                            id="lga"
                            label="LGA"
                            value={lga}
                            onChange={(event) =>
                                setLga(event.target.value)
                            }
                            placeholder="Enter LGA"
                        />

                        <InputField
                            id="community"
                            label="Community"
                            value={community}
                            onChange={(event) =>
                                setCommunity(
                                    event.target.value
                                )
                            }
                            placeholder="Enter community name"
                        />

                        <InputField
                            id="venue"
                            label="Training Venue"
                            value={venue}
                            onChange={(event) =>
                                setVenue(event.target.value)
                            }
                            placeholder="Enter training venue"
                        />

                        <InputField
                            id="facilitator"
                            label="Training Facilitator"
                            value={facilitator}
                            onChange={(event) =>
                                setFacilitator(
                                    event.target.value
                                )
                            }
                            placeholder="Enter facilitator name"
                        />

                        <InputField
                            id="expectedCollectors"
                            label="Expected Collectors"
                            type="number"
                            min="1"
                            value={expectedCollectors}
                            onChange={(event) =>
                                setExpectedCollectors(
                                    event.target.value
                                )
                            }
                            placeholder="e.g. 30"
                            icon={<UsersIcon />}
                        />
                    </div>

                    <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50/60 px-4 py-3">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-orange-500">
                                <UsersIcon />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-orange-800">
                                    Training progress is automatic
                                </p>

                                <p className="mt-0.5 text-xs leading-5 text-orange-700">
                                    The training status will be
                                    calculated automatically
                                    based on the number of
                                    collectors recorded.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Evidence Photo */}
            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="p-6 md:p-8">
                    <SectionHeader
                        icon={<CameraIcon />}
                        title="Training Evidence"
                        description="Capture or upload a clear photo showing the training session and venue."
                    />

                    <label
                        htmlFor="trainingPhoto"
                        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${photo
                            ? "border-green-200 bg-green-50/40"
                            : "border-gray-200 bg-gray-50/50 hover:border-green-300 hover:bg-green-50/30"
                            }`}
                    >
                        <input
                            id="trainingPhoto"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoChange}
                            className="sr-only"
                        />

                        {!photo ? (
                            <>
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600 transition group-hover:scale-105">
                                    <UploadIcon />
                                </div>

                                <p className="text-sm font-semibold text-gray-800">
                                    Take or upload a photo
                                </p>

                                <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                                    Use your device camera to
                                    capture the training evidence
                                    or select an existing image.
                                </p>

                                <span className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200">
                                    Choose Photo
                                </span>

                                <p className="mt-3 text-[11px] text-gray-400">
                                    JPG, PNG or other image • Max
                                    10MB
                                </p>
                            </>
                        ) : (
                            <div className="w-full">
                                {photoPreview && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={photoPreview}
                                        alt="Training evidence preview"
                                        className="max-h-96 w-full rounded-xl object-cover shadow-sm"
                                    />
                                )}

                                <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-gray-100">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                            <CheckIcon />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-gray-800">
                                                {photo.name}
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                {(
                                                    photo.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(
                                                    2
                                                )}{" "}
                                                MB
                                            </p>
                                        </div>
                                    </div>

                                    <span className="shrink-0 text-xs font-semibold text-green-600">
                                        Selected
                                    </span>
                                </div>
                            </div>
                        )}
                    </label>
                </div>
            </section>

            {/* Location */}
            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="p-6 md:p-8">
                    <SectionHeader
                        icon={<LocationIcon />}
                        title="Training Location"
                        description="Capture the GPS coordinates of the training venue."
                    />

                    <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${latitude &&
                                        longitude
                                        ? "bg-green-100 text-green-600"
                                        : "bg-orange-100 text-orange-500"
                                        }`}
                                >
                                    {latitude &&
                                        longitude ? (
                                        <CheckIcon />
                                    ) : (
                                        <MapPinIcon />
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {latitude &&
                                            longitude
                                            ? "Location captured"
                                            : "Location not captured"}
                                    </p>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {latitude &&
                                            longitude
                                            ? "GPS coordinates are ready to submit."
                                            : "Capture the current venue location."}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={captureLocation}
                                disabled={
                                    locationLoading
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {locationLoading ? (
                                    <>
                                        <Spinner />
                                        Getting location...
                                    </>
                                ) : (
                                    <>
                                        <MapPinIcon />
                                        {latitude &&
                                            longitude
                                            ? "Recapture Location"
                                            : "Capture Location"}
                                    </>
                                )}
                            </button>
                        </div>

                        {(latitude || longitude) && (
                            <div className="mt-5 grid gap-4 border-t border-gray-200 pt-5 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="latitude"
                                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                                    >
                                        Latitude
                                    </label>

                                    <input
                                        id="latitude"
                                        type="text"
                                        value={
                                            latitude
                                        }
                                        readOnly
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm text-gray-700"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="longitude"
                                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                                    >
                                        Longitude
                                    </label>

                                    <input
                                        id="longitude"
                                        type="text"
                                        value={
                                            longitude
                                        }
                                        readOnly
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm text-gray-700"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Submit */}
            <div className="rounded-2xl border border-green-100 bg-linear-to-r from-green-50 to-orange-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-900">
                            Ready to save this training?
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Make sure the photo and GPS location
                            have been captured before submitting.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        {submitting ? (
                            <>
                                <Spinner />
                                Saving Training...
                            </>
                        ) : (
                            <>
                                <SaveIcon />
                                Save Training
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}