// app/login/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
    const session = await getServerSession(authOptions);

    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-green-50 via-white to-orange-50 px-4 py-8">
            {/* Background decoration */}
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-green-200/30 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />

            <div className="relative">
                <LoginForm />
            </div>
        </main>
    );
}