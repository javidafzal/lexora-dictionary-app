import { useEffect, useState, FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SmokeyBackground } from "@/components/ui/smokey-background";

type Mode = "login" | "signup";

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup, error, clearError } = useAuth();

  const [mode, setMode] = useState<Mode>(location.pathname === "/signup" ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/saved";

  // Keep the tab in sync if the user navigates directly to /login or /signup
  useEffect(() => {
    setMode(location.pathname === "/signup" ? "signup" : "login");
  }, [location.pathname]);

  const switchMode = (next: Mode) => {
    clearError();
    setMode(next);
    navigate(next === "login" ? "/login" : "/signup", { replace: true, state: location.state });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    const ok =
      mode === "login" ? await login(email, password) : await signup(name, email, password);
    setSubmitting(false);
    if (ok) navigate(from, { replace: true });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center px-4">
      <div className="absolute inset-0">
        <SmokeyBackground color="#C9A24B" opacity={0.55} />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative z-10 w-full max-w-sm p-8 space-y-6 bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/15 shadow-2xl">
        <div className="text-center">
          <Link to="/" className="flex items-center gap-2 justify-center mb-6">
            <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
              <path d="M20 5L5 20L20 35L35 20L20 5Z" stroke="white" strokeWidth="2" />
            </svg>
            <span className="font-serif text-lg tracking-tight">Lexora</span>
          </Link>

          {/* Tabs */}
          <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`px-5 py-1.5 text-sm rounded-full transition-colors ${
                mode === "login" ? "bg-amber-400 text-black font-medium" : "text-white/60 hover:text-white"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`px-5 py-1.5 text-sm rounded-full transition-colors ${
                mode === "signup" ? "bg-amber-400 text-black font-medium" : "text-white/60 hover:text-white"
              }`}
            >
              Create account
            </button>
          </div>

          <h1 className="font-serif text-3xl mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-white/50 text-sm mb-2">
            {mode === "login" ? "Sign in to see your saved words." : "Free — save words as you explore."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "signup" && (
            <div className="relative z-0">
              <input
                type="text"
                id="floating_name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-amber-400 peer"
                placeholder=" "
              />
              <label
                htmlFor="floating_name"
                className="absolute text-sm text-white/50 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-amber-300 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                <User className="inline-block mr-2 -mt-1" size={16} />
                Full name
              </label>
            </div>
          )}

          <div className="relative z-0">
            <input
              type="email"
              id="floating_email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-amber-400 peer"
              placeholder=" "
            />
            <label
              htmlFor="floating_email"
              className="absolute text-sm text-white/50 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-amber-300 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              <Mail className="inline-block mr-2 -mt-1" size={16} />
              Email address
            </label>
          </div>

          <div className="relative z-0">
            <input
              type="password"
              id="floating_password"
              required
              minLength={mode === "signup" ? 6 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-amber-400 peer"
              placeholder=" "
            />
            <label
              htmlFor="floating_password"
              className="absolute text-sm text-white/50 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-amber-300 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              <Lock className="inline-block mr-2 -mt-1" size={16} />
              Password {mode === "signup" && <span className="text-white/30">(6+ characters)</span>}
            </label>
          </div>

          {mode === "login" && (
            <div className="flex items-center justify-end -mt-2">
              <span className="text-xs text-white/40">Forgot password isn't wired up in this demo</span>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="group w-full flex items-center justify-center py-3 px-4 bg-amber-400/90 hover:bg-amber-400 rounded-lg text-black font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-amber-400 transition-all duration-300 disabled:opacity-60"
          >
            {submitting
              ? mode === "login"
                ? "Signing in…"
                : "Creating account…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
            <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-sm text-white/50">
          {mode === "login" ? (
            <>
              New to Lexora?{" "}
              <button className="text-amber-300 hover:underline" onClick={() => switchMode("signup")}>
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="text-amber-300 hover:underline" onClick={() => switchMode("login")}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
