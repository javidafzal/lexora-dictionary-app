import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Explore", to: "/explore" },
  { label: "Words", to: "/words" },
  { label: "Origins", to: "/origins" },
  { label: "Saved", to: "/saved" },
  { label: "About", to: "/about" },
];

export const NavBar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2 text-white">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <path d="M20 5L5 20L20 35L35 20L20 5Z" stroke="white" strokeWidth="2" />
            </svg>
            <span className="font-serif tracking-tight">Lexora</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6 ml-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="hidden md:block text-sm text-gray-300">Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={handleSignOut}
                className="hidden md:block px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/login" className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm rounded-full border border-white/15 text-white/90 hover:text-white hover:border-white/30 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
          <button
            onClick={() => navigate("/explore")}
            className="px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-full text-sm hover:bg-gray-700/80 transition-colors text-white"
          >
            Look up a word
          </button>
          <button
            className="md:hidden p-2 rounded-md text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-t border-white/10">
          <div className="flex flex-col items-center py-6 space-y-4 text-lg">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="text-white" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <button className="text-white" onClick={handleSignOut}>
                Sign out ({user.name.split(" ")[0]})
              </button>
            ) : (
              <>
                <Link to="/login" className="text-white" onClick={() => setMobileMenuOpen(false)}>
                  Sign in
                </Link>
                <Link to="/signup" className="text-amber-300" onClick={() => setMobileMenuOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
