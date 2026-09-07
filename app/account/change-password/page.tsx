import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";

export const metadata = {
    title: "Change Password",
    description: "Change your account password.",
};

export default async function ChangePasswordPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <main className="min-h-full bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-start justify-center">
                <ChangePasswordForm />
            </div>
        </main>
    );
}
