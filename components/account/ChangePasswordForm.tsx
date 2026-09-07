"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

interface PasswordFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    showPassword: boolean;
    onToggle: () => void;
    placeholder?: string;
}

function PasswordField({
    label,
    value,
    onChange,
    showPassword,
    onToggle,
    placeholder,
}: PasswordFieldProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    required
                />

                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={
                        showPassword
                            ? `Hide ${label}`
                            : `Show ${label}`
                    }
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>
        </div>
    );
}

export default function ChangePasswordForm() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "/api/account/change-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword,
                        confirmPassword,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "Unable to change your password."
                );
                return;
            }

            setSuccess(
                data.message ||
                "Your password has been changed successfully."
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch {
            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-xl">
            <div className="mb-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                    <ShieldCheck className="h-6 w-6 text-green-700" />
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Change Password
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Update your password to keep your account secure.
                </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <PasswordField
                        label="Current Password"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        showPassword={showCurrent}
                        onToggle={() =>
                            setShowCurrent((value) => !value)
                        }
                        placeholder="Enter your current password"
                    />

                    <div className="border-t border-slate-100 pt-5">
                        <PasswordField
                            label="New Password"
                            value={newPassword}
                            onChange={setNewPassword}
                            showPassword={showNew}
                            onToggle={() =>
                                setShowNew((value) => !value)
                            }
                            placeholder="Enter your new password"
                        />

                        <div className="mt-3 rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold text-slate-700">
                                Password requirements
                            </p>

                            <ul className="mt-2 space-y-1 text-xs text-slate-500">
                                <li>• At least 8 characters</li>
                                <li>• At least one uppercase letter</li>
                                <li>• At least one lowercase letter</li>
                                <li>• At least one number</li>
                            </ul>
                        </div>
                    </div>

                    <PasswordField
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        showPassword={showConfirm}
                        onToggle={() =>
                            setShowConfirm((value) => !value)
                        }
                        placeholder="Confirm your new password"
                    />

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Changing Password..."
                            : "Change Password"}
                    </button>
                </form>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">
                Your password is securely encrypted and never stored in
                plain text.
            </p>
        </div>
    );
}
