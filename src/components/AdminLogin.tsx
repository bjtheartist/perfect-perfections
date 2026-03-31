import { type FormEvent, useState } from 'react';

interface AdminLoginProps {
  onLogin: (token: string) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [token, setToken] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    sessionStorage.setItem('pp_admin_token', token);
    onLogin(token);
  };

  const handleBack = () => {
    window.location.search = '';
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
        <h1 className="font-playfair text-3xl text-center text-gray-800 mb-6">
          Admin Access
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="admin-token"
              className="block text-sm font-medium text-gray-600 mb-1.5"
            >
              Admin Token
            </label>
            <input
              id="admin-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your token"
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-700/40 focus:border-amber-700 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-700 hover:bg-amber-800 text-white font-medium py-2.5 rounded-full transition-colors"
          >
            Sign In
          </button>
        </form>

        <button
          onClick={handleBack}
          className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          &larr; Back to site
        </button>
      </div>
    </div>
  );
}
