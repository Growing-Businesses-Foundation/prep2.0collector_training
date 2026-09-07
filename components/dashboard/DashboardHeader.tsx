interface DashboardHeaderProps {
    name: string;
    foId?: string;
    role: string;
}

export default function DashboardHeader({
    name,
    foId,
    role,
}: DashboardHeaderProps) {
    return (
        <div className="mb-8">
            <p className="text-sm text-gray-500">Welcome back</p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
                {name}
            </h1>

            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                {foId && <span>{foId}</span>}
                <span>•</span>
                <span>{role.replace("_", " ")}</span>
            </div>
        </div>
    );
}