import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function Login({ onLogin }) {
    const navigate = useNavigate();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function login() {
        setError("");
        if (!email || !password) {
            setError("Please enter your email and password");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.status === 200) {
                localStorage.setItem("jwtToken", data.token);
                onLogin();
                navigate("/main");
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("Server is not reachable");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="p-8">
                        <div className="flex justify-center mb-6">
                            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <LogIn className="text-white w-8 h-8" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-slate-500 text-center mb-8">
                            Please enter your details to sign in
                        </p>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
                                <AlertCircle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Password
                                    </label>
                                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={login}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
                        <p className="text-slate-600 text-sm">
                            Don't have an account?{" "}
                            <button
                                onClick={() => navigate("/register")}
                                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
                            >
                                Create one
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
