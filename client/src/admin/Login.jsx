import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const store = remember ? localStorage : sessionStorage;
      store.setItem("token", data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080B] text-bone font-body grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display font-extrabold text-3xl tracking-tight">
            Admin
          </h1>
          <p className="text-bone/45 text-sm mt-2">
            Sign in to manage the portfolio
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-white/5 backdrop-blur-sm p-6 space-y-5"
        >
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-bone/45 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 rounded-xl border border-line px-4 py-3 outline-none focus:border-violet text-bone"
              placeholder="admin@youcef.dev"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-bone/45 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 rounded-xl border border-line px-4 py-3 outline-none focus:border-violet text-bone"
              placeholder="••••••••"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-bone/55">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-violet"
            />
            Stay signed in
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-violet text-ink font-medium hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
