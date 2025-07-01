import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const signup = async (username, password) => {
    setSignupLoading(true);
    setSignupError("");

    const response = await fetch("https://todobackend-shk.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    setSignupLoading(false);

    if (response.ok) {
      navigate("/login");
    } else {
      setSignupError(data.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Join Us Today
          </h2>
          <p className="text-slate-300 font-medium">Create your Todo account</p>
        </div>

        {signupError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-red-300 font-semibold">
              <span className="text-xl">⚠️</span>
              {signupError}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-slate-300 font-semibold mb-2 text-sm">
              👤 Choose Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 border-2 border-purple-300/30 rounded-2xl bg-white/10 backdrop-blur-sm text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-400/50 focus:border-purple-400 transition-all duration-300 shadow-lg"
              placeholder="Create your username"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-2 text-sm">
              🔐 Create Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border-2 border-purple-300/30 rounded-2xl bg-white/10 backdrop-blur-sm text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-400/50 focus:border-purple-400 transition-all duration-300 shadow-lg"
              placeholder="Create a secure password"
            />
          </div>

          <button
            onClick={() => signup(username, password)}
            disabled={signupLoading}
            className="w-full p-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-pink-400 disabled:to-purple-400 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl border border-pink-400/30 disabled:cursor-not-allowed"
          >
            {signupLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating account...
              </div>
            ) : (
              "🎉 Create Account"
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-300">
            Already have an account?{" "}
            <a className="text-pink-400 hover:text-pink-300 font-bold hover:underline transition-colors duration-200" href="/login">
              Sign In 🔐
            </a>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-center text-slate-400 text-sm">
            <p>🛡️ Your data is safe with us</p>
          </div>
        </div>
      </div>
    </div>
  );
}
