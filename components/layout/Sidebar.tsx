"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { UserRole } from "@/lib/models/user";

interface SidebarProps {
    role: UserRole;
    mobileOpen: boolean;
    onClose: () => void;
}

function DashboardIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
    );
}

function TrainingIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6.5A2.5 2.5 0 016.5 4H20v15H6.5A2.5 2.5 0 014 16.5v-10z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 8h8M8 12h6"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16.5A2.5 2.5 0 016.5 14H20"
            />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 5v14M5 12h14"
            />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
            />
            <circle cx="9" cy="7" r="4" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
            />
        </svg>
    );
}

function UserPlusIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
            />
            <circle cx="8.5" cy="7" r="4" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 8v6M16 11h6"
            />
        </svg>
    );
}

function KeyIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <circle cx="8" cy="15" r="4" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 12l8-8m0 0h-3m3 0v3"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 9l2 2"
            />
        </svg>
    );
}

function LogOutIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 17l5-5-5-5"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12H3"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 19V5a2 2 0 00-2-2h-6"
            />
        </svg>
    );
}

function XIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
            />
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3l8 4v5c0 4.8-3.2 8.2-8 9-4.8-.8-8-4.2-8-9V7l8-4z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4"
            />
        </svg>
    );
}

interface NavItemProps {
    href: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
    badge?: string;
}

function NavItem({
    href,
    label,
    icon,
    active,
    onClick,
    badge,
}: NavItemProps) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`group relative flex items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200 ${active
                    ? "bg-green-50 text-green-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
        >
            {active && (
                <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-green-600" />
            )}

            <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${active
                        ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                        : "bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-600"
                    }`}
            >
                {icon}
            </span>

            <span className="flex-1">{label}</span>

            {badge && (
                <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                >
                    {badge}
                </span>
            )}
        </Link>
    );
}

export default function Sidebar({
    role,
    mobileOpen,
    onClose,
}: SidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    const handleNavigation = () => {
        onClose();
    };

    /*
     * Only ADMIN and WRITE users can create/manage
     * training sessions and collectors.
     *
     * This explicit check is intentional.
     *
     * Do NOT use:
     * role !== "READ_ONLY"
     *
     * because that would incorrectly grant access to
     * RESTRICTED_READ_ONLY users.
     */
    const canManageTraining =
        role === "ADMIN" ||
        role === "WRITE";

    const canManageCollectors =
        role === "ADMIN" ||
        role === "WRITE";

    const roleLabel = role.replaceAll("_", " ");

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-gray-950/50 backdrop-blur-sm lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white shadow-xl shadow-gray-900/5 transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }`}
            >
                {/* Brand */}
                <div className="relative border-b border-gray-100 px-5 py-5">
                    <div className="absolute left-0 right-0 top-0 h-1 bg-linear-to-r from-green-700 via-green-500 to-orange-400" />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-green-700 to-green-500 shadow-lg shadow-green-700/20">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-6 w-6 text-white"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 3v18M5 8h14M6.5 8C6.5 5.8 8.96 4 12 4s5.5 1.8 5.5 4M6 8c0 3.5 2.5 5 6 5s6-1.5 6-5M7 13l-2 5h14l-2-5M4 18h16"
                                    />
                                </svg>
                            </div>

                            <div className="min-w-0">
                                <h1 className="truncate text-base font-bold tracking-tight text-gray-900">
                                    Collector Training
                                </h1>

                                <p className="mt-0.5 text-[11px] font-medium text-gray-400">
                                    Data Collection System
                                </p>
                            </div>
                        </div>

                        {/* Mobile close */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 lg:hidden"
                            aria-label="Close navigation"
                        >
                            <XIcon />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6">
                    {/* Main */}
                    <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                        Main
                    </p>

                    <div className="space-y-1">
                        <NavItem
                            href="/dashboard"
                            label="Dashboard"
                            icon={<DashboardIcon />}
                            active={isActive("/dashboard")}
                            onClick={handleNavigation}
                        />
                    </div>

                    {/* Training */}
                    <p className="mb-3 mt-8 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                        Training
                    </p>

                    <div className="space-y-1">
                        <NavItem
                            href="/training"
                            label="Training Sessions"
                            icon={<TrainingIcon />}
                            active={isActive("/training")}
                            onClick={handleNavigation}
                        />

                        {canManageTraining && (
                            <NavItem
                                href="/training/new"
                                label="New Training"
                                icon={<PlusIcon />}
                                active={isActive("/training/new")}
                                onClick={handleNavigation}
                            />
                        )}
                    </div>

                    {/* Collectors */}
                    <p className="mb-3 mt-8 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                        Collectors
                    </p>

                    <div className="space-y-1">
                        <NavItem
                            href="/collectors"
                            label="Collectors"
                            icon={<UsersIcon />}
                            active={isActive("/collectors")}
                            onClick={handleNavigation}
                        />

                        {canManageCollectors && (
                            <NavItem
                                href="/collectors/new"
                                label="Add Collector"
                                icon={<UserPlusIcon />}
                                active={isActive("/collectors/new")}
                                onClick={handleNavigation}
                            />
                        )}
                    </div>
                </nav>

                {/* Bottom section */}
                <div className="border-t border-gray-100 bg-gray-50/70 p-4">
                    {/* Role card */}
                    <div className="mb-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                                <ShieldIcon />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Access Level
                                </p>

                                <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                                    {roleLabel}
                                </p>
                            </div>

                            <span className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                        </div>
                    </div>

                    {/* Change Password */}
                    <Link
                        href="/account/change-password"
                        onClick={handleNavigation}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-all duration-200 ${isActive("/account/change-password")
                                ? "bg-green-50 text-green-700"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                    >
                        <span
                            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${isActive("/account/change-password")
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-600"
                                }`}
                        >
                            <KeyIcon />
                        </span>

                        <span className="flex-1">Change Password</span>
                    </Link>

                    {/* Logout */}
                    <button
                        type="button"
                        onClick={() =>
                            signOut({ callbackUrl: "/login" })
                        }
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition group-hover:bg-red-100 group-hover:text-red-600">
                            <LogOutIcon />
                        </span>

                        <span>Logout</span>
                    </button>

                    <div className="mt-4 text-center">
                        <p className="text-[10px] font-medium text-gray-400">
                            Collector Training Platform
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
