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

    const response = await fetch("https://45kfpc-8080.csb.app/register", {
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
    <div className="max-w-md mx-auto mt-16 p-8 bg-orange-50 rounded-lg border border-orange-200">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-orange-600">
        Register for Todo App
      </h2>
      {signupError && (
        <div className="mb-3 text-center text-red-600 font-semibold">
          {signupError}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          signup(username, password);
        }}
      >
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-3 
          border-2 
          border-orange-300 
          rounded 
          w-full 
          mb-4 
          focus:outline-none 
          focus:ring-2 
          focus:ring-orange-400"
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 
          border-2 
          border-orange-300 
          rounded 
          w-full 
          mb-4 
          focus:outline-none 
          focus:ring-2 
          focus:ring-orange-400"
          placeholder="Password"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded w-full transition-color"
        >
          {signupLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <div className="mt-5 text-center text-gray-700">
        Already have an account?{" "}
        <Link to="/login">
          <span className="text-orange-500 hover:underline font-semibold">
            Login
          </span>
        </Link>
      </div>
    </div>
  );
}
