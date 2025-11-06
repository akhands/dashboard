import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple demo: accept any non-empty username/password
    if (username.trim() && password.trim()) {
      setError("");
      onLogin(username);
    } else {
      setError("Please enter both username and password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2341] via-[#2e3c5d] to-[#1a2341]">
      <div className="bg-white/95 rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          {/* Generative AI Logo SVG */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-2">
            <circle cx="24" cy="24" r="24" fill="#6c63ff"/>
            <path d="M24 12a12 12 0 1 1 0 24 12 12 0 0 1 0-24zm0 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zm0 3a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z" fill="#fff"/>
            <circle cx="24" cy="24" r="3" fill="#43e97b"/>
          </svg>
          <h2 className="text-2xl font-bold text-[#1a2341] mb-1">Sign in to FutureOps</h2>
          <p className="text-sm text-gray-500">PLDT Smart Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6c63ff] bg-gray-50"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6c63ff] bg-gray-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm font-semibold">{error}</div>
          )}
          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-[#6c63ff] to-[#43e97b] text-white font-bold rounded-lg shadow-lg hover:from-[#43e97b] hover:to-[#6c63ff] transition-all"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Enterprise Infra Monitoring
        </div>
      </div>
    </div>
  );
}
