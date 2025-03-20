import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config.js';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  // Persist theme state across page reloads
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDark(savedTheme === 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();
    setLoading(false);

    if (data.success) {
      navigate('/');
    } else {
      setError(data.message);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
      isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className={`w-full max-w-md p-8 space-y-8 backdrop-blur-sm rounded-2xl shadow-2xl transition-all duration-500 ${
        isDark ? 'bg-gray-800/95 text-gray-100' : 'bg-white/95 text-gray-900'
      }`}>
        {/* Theme Toggle Button */}
        <button
        onClick={() => setIsDark(!isDark)}
        className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
            : 'bg-gray-200 hover:bg-gray-300 text-blue-600'
        }`}
        >
        {isDark ? (
          // Moon icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        ) : (
          // Sun icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
        )}
        </button>

        <div className="text-center">
          <h2 onClick={() => navigate('/')} className={`text-4xl cursor-pointer font-extrabold mb-2 transition-colors duration-500 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Billionoillid CTF
          </h2>
          <p className={`transition-colors duration-500 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Please sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 transition-colors duration-500 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400/30' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                } focus:ring-2 outline-none`}
                
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 transition-colors duration-500 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400/30' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                } focus:ring-2 outline-none`}
              
              />
            </div>
          </div>

          {error && (
            <div className={`animate-shake p-3 rounded-lg text-sm flex items-center space-x-2 transition-colors duration-500 ${
              isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'
            }`}>
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 font-semibold cursor-pointer rounded-lg transition-all text-white duration-500 transform hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center ${
              isDark
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center text-sm">
          <p className={`transition-colors duration-500 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Don't have an account?{' '}
            <a 
              href="https://www.google.com" 
              className={`font-medium transition-colors duration-500 ${
                isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
              }`}
              target="_blank" 
              rel="noopener noreferrer"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;