// // components/auth/LoginForm.tsx

// "use client";

// import { FormEvent, useState } from "react";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";

// export default function LoginForm() {
//     const router = useRouter();

//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);


//     async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//         event.preventDefault();

//         setError("");
//         setLoading(true);

//         const result = await signIn("credentials", {
//             email,
//             password,
//             redirect: false,
//         });

//         if (result?.error) {
//             setError("Invalid email or password.");
//             setLoading(false);
//             return;
//         }

//         router.push("/dashboard");
//         router.refresh();
//     }

//     return (
//         <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-green-900/10">

//             {/* Top accent */}
//             <div className="h-2 bg-linear-to-r from-green-700 via-green-500 to-orange-400" />

//             <div className="p-8 sm:p-10">

//                 {/* Logo / Brand */}
//                 <div className="mb-8 text-center">

//                     <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-r from-green-700 to-green-500 shadow-lg shadow-green-700/20">
//                         <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             viewBox="0 0 24 24"
//                             fill="none"
//                             stroke="currentColor"
//                             strokeWidth="1.8"
//                             className="h-8 w-8 text-white"
//                         >
//                             <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 d="M12 3v18M5 8h14M6.5 8C6.5 5.8 8.96 4 12 4s5.5 1.8 5.5 4M6 8c0 3.5 2.5 5 6 5s6-1.5 6-5M7 13l-2 5h14l-2-5M4 18h16"
//                             />
//                         </svg>
//                     </div>

//                     <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
//                         Collector Training
//                     </h1>

//                     <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-orange-400" />

//                     <p className="mt-4 text-sm leading-6 text-gray-500">
//                         Sign in to access the collector training
//                         management platform.
//                     </p>
//                 </div>

//                 {/* Login Form */}
//                 <form onSubmit={handleSubmit} className="space-y-5">

//                     {/* Email */}
//                     <div>
//                         <label
//                             htmlFor="email"
//                             className="mb-2 block text-sm font-semibold text-gray-700"
//                         >
//                             Email Address
//                         </label>

//                         <div className="relative">
//                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
//                                 <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     viewBox="0 0 24 24"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     strokeWidth="1.8"
//                                     className="h-5 w-5 text-gray-400"
//                                 >
//                                     <path
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 16.5v-9z"
//                                     />
//                                     <path
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         d="m4 7 8 6 8-6"
//                                     />
//                                 </svg>
//                             </div>

//                             <input
//                                 id="email"
//                                 type="email"
//                                 value={email}
//                                 onChange={(event) =>
//                                     setEmail(event.target.value)
//                                 }
//                                 placeholder="you@example.com"
//                                 required
//                                 autoComplete="email"
//                                 className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10"
//                             />
//                         </div>
//                     </div>

//                     {/* Password */}
//                     <div>
//                         <label
//                             htmlFor="password"
//                             className="mb-2 block text-sm font-semibold text-gray-700"
//                         >
//                             Password
//                         </label>

//                         <div className="relative">
//                             {/* Lock icon */}
//                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
//                                 <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     viewBox="0 0 24 24"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     strokeWidth="1.8"
//                                     className="h-5 w-5 text-gray-400"
//                                 >
//                                     <rect
//                                         width="16"
//                                         height="12"
//                                         x="4"
//                                         y="10"
//                                         rx="2"
//                                     />
//                                     <path
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         d="M8 10V7a4 4 0 018 0v3M12 14v4"
//                                     />
//                                 </svg>
//                             </div>

//                             {/* Password input */}
//                             <input
//                                 id="password"
//                                 type={showPassword ? "text" : "password"}
//                                 value={password}
//                                 onChange={(event) =>
//                                     setPassword(event.target.value)
//                                 }
//                                 placeholder="Enter your password"
//                                 required
//                                 autoComplete="current-password"
//                                 className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10"
//                             />

//                             {/* Eye button */}
//                             <button
//                                 type="button"
//                                 onClick={() =>
//                                     setShowPassword((current) => !current)
//                                 }
//                                 className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 transition hover:text-green-600 focus:outline-none"
//                                 aria-label={
//                                     showPassword
//                                         ? "Hide password"
//                                         : "Show password"
//                                 }
//                             >
//                                 {showPassword ? (
//                                     /* Eye off */
//                                     <svg
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         viewBox="0 0 24 24"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         strokeWidth="1.8"
//                                         className="h-5 w-5"
//                                     >
//                                         <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             d="M3 3l18 18"
//                                         />
//                                         <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             d="M10.6 10.6a2 2 0 102.8 2.8"
//                                         />
//                                         <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             d="M9.9 4.2A10.5 10.5 0 0112 4c5.5 0 9 5.5 9 8a9.8 9.8 0 01-3.1 4.5M6.1 6.1C4.1 7.4 3 9.3 3 12c0 2.5 4 8 9 8 1.3 0 2.5-.3 3.6-.8"
//                                         />
//                                     </svg>
//                                 ) : (
//                                     /* Eye */
//                                     <svg
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         viewBox="0 0 24 24"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         strokeWidth="1.8"
//                                         className="h-5 w-5"
//                                     >
//                                         <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
//                                         />
//                                         <circle
//                                             cx="12"
//                                             cy="12"
//                                             r="2.5"
//                                         />
//                                     </svg>
//                                 )}
//                             </button>
//                         </div>
//                     </div>

//                     {/* Error */}
//                     {error && (
//                         <div
//                             role="alert"
//                             className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-700"
//                         >
//                             <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 viewBox="0 0 24 24"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 strokeWidth="2"
//                                 className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
//                             >
//                                 <circle cx="12" cy="12" r="9" />
//                                 <path
//                                     strokeLinecap="round"
//                                     d="M12 8v4M12 16h.01"
//                                 />
//                             </svg>

//                             <div>
//                                 <p className="font-medium">
//                                     Sign in failed
//                                 </p>
//                                 <p className="mt-0.5 text-xs text-red-600">
//                                     {error}
//                                 </p>
//                             </div>
//                         </div>
//                     )}

//                     {/* Submit */}
//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-green-700 to-green-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-green-700/20 transition-all duration-200 hover:from-green-800 hover:to-green-700 hover:shadow-xl hover:shadow-green-700/25 focus:outline-none focus:ring-4 focus:ring-green-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                         <span className="relative flex items-center justify-center gap-2 hover:cursor-pointer">
//                             {loading ? (
//                                 <>
//                                     <svg
//                                         className="h-5 w-5 animate-spin"
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         fill="none"
//                                         viewBox="0 0 24 24"
//                                     >
//                                         <circle
//                                             className="opacity-25"
//                                             cx="12"
//                                             cy="12"
//                                             r="10"
//                                             stroke="currentColor"
//                                             strokeWidth="4"
//                                         />
//                                         <path
//                                             className="opacity-75"
//                                             fill="currentColor"
//                                             d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                                         />
//                                     </svg>

//                                     Signing in...
//                                 </>
//                             ) : (
//                                 <>
//                                     Sign In

//                                     <svg
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         viewBox="0 0 24 24"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         strokeWidth="2"
//                                         className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
//                                     >
//                                         <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             d="M5 12h14M13 6l6 6-6 6"
//                                         />
//                                     </svg>
//                                 </>
//                             )}
//                         </span>
//                     </button>
//                 </form>

//                 {/* Footer */}
//                 <div className="mt-8 border-t border-gray-100 pt-6 text-center">
//                     <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
//                         <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
//                         <span>Secure access</span>
//                         <span className="text-gray-300">•</span>
//                         <span>Collector Training Platform</span>
//                     </div>
//                 </div>
//             </div>

//             {/* Bottom accent */}
//             <div className="h-1 bg-linear-to-r from-orange-400 via-orange-300 to-green-500" />
//         </div>
//     );
// }


"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email: email.trim().toLowerCase(),
                password,
                redirect: false,
            });

            /*
             * Authentication failed.
             */
            if (!result || result.error) {
                console.error(
                    "Login failed:",
                    result?.error
                );

                setError(
                    result?.error === "CredentialsSignin"
                        ? "Invalid email or password."
                        : "Unable to sign in. Please try again."
                );

                setLoading(false);
                return;
            }

            /*
             * Authentication succeeded.
             */
            router.replace("/dashboard");
            router.refresh();
        } catch (error) {
            console.error("Login error:", error);

            setError(
                "Unable to sign in. Please try again."
            );

            setLoading(false);
        }
    }

    const deactivated =
        searchParams.get("reason") === "deactivated";

    return (
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-green-900/10">

            {/* Top accent */}
            <div className="h-2 bg-linear-to-r from-green-700 via-green-500 to-orange-400" />

            <div className="p-8 sm:p-10">

                {/* Logo / Brand */}
                <div className="mb-8 text-center">

                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-r from-green-700 to-green-500 shadow-lg shadow-green-700/20">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-8 w-8 text-white"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 3v18M5 8h14M6.5 8C6.5 5.8 8.96 4 12 4s5.5 1.8 5.5 4M6 8c0 3.5 2.5 5 6 5s6-1.5 6-5M7 13l-2 5h14l-2-5M4 18h16"
                            />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                        Collector Training
                    </h1>

                    <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-orange-400" />

                    <p className="mt-4 text-sm leading-6 text-gray-500">
                        Sign in to access the collector training
                        management platform.
                    </p>
                </div>

                {/* Deactivated session message */}
                {deactivated && (
                    <div
                        role="alert"
                        className="mb-5 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3.5 text-sm text-orange-700"
                    >
                        <p className="font-medium">
                            Your previous session ended.
                        </p>

                        <p className="mt-0.5 text-xs text-orange-600">
                            Please sign in again to continue.
                        </p>
                    </div>
                )}

                {/* Login Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Email Address
                        </label>

                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-5 w-5 text-gray-400"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 16.5v-9z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m4 7 8 6 8-6"
                                    />
                                </svg>
                            </div>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Password
                        </label>

                        <div className="relative">

                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-5 w-5 text-gray-400"
                                >
                                    <rect
                                        width="16"
                                        height="12"
                                        x="4"
                                        y="10"
                                        rx="2"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8 10V7a4 4 0 018 0v3M12 14v4"
                                    />
                                </svg>
                            </div>

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (current) =>
                                            !current
                                    )
                                }
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 transition hover:text-green-600 focus:outline-none"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
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
                                            d="M3 3l18 18"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M10.6 10.6a2 2 0 102.8 2.8"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9.9 4.2A10.5 10.5 0 0112 4c5.5 0 9 5.5 9 8a9.8 9.8 0 01-3.1 4.5M6.1 6.1C4.1 7.4 3 9.3 3 12c0 2.5 4 8 9 8 1.3 0 2.5-.3 3.6-.8"
                                        />
                                    </svg>
                                ) : (
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
                                            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                                        />
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="2.5"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            role="alert"
                            className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-700"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                />
                                <path
                                    strokeLinecap="round"
                                    d="M12 8v4M12 16h.01"
                                />
                            </svg>

                            <div>
                                <p className="font-medium">
                                    Sign in failed
                                </p>

                                <p className="mt-0.5 text-xs text-red-600">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-green-700 to-green-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-green-700/20 transition-all duration-200 hover:from-green-800 hover:to-green-700 hover:shadow-xl hover:shadow-green-700/25 focus:outline-none focus:ring-4 focus:ring-green-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <span className="relative flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <svg
                                        className="h-5 w-5 animate-spin"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        />
                                    </svg>

                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 12h14M13 6l6 6-6 6"
                                        />
                                    </svg>
                                </>
                            )}
                        </span>
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 border-t border-gray-100 pt-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span>Secure access</span>
                        <span className="text-gray-300">
                            •
                        </span>
                        <span>
                            Collector Training Platform
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom accent */}
            <div className="h-1 bg-linear-to-r from-orange-400 via-orange-300 to-green-500" />
        </div>
    );
}