import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import ThemeToggle from './ThemeToggle.jsx';

const navItems = [
  ['Dashboard', '/dashboard'],
  ['Upload Paper', '/upload-paper'],
  ['Analytics', '/analytics'],
  ['Profile', '/profile'],
];

function AppShell() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-container !p-4 md:!p-8">
      {/* Dynamic Background Blobs & Spheres */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        
        {/* Floating Glass Spheres */}
        <div className="sphere sphere-1"></div>
        <div className="sphere sphere-2"></div>
        <div className="sphere sphere-3"></div>
      </div>

      <div className="mx-auto flex h-full max-w-7xl flex-col gap-6">
        <header className="glass-card flex items-center justify-between px-6 py-4 md:px-8">
          <div className="flex items-center gap-10">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-3 transition-all hover:opacity-80"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="12" fill="var(--accent)" fillOpacity="0.15"/>
                <path d="M12 14C12 12.8954 12.8954 12 14 12H26C27.1046 12 28 12.8954 28 14V26C28 27.1046 27.1046 28 26 28H14C12.8954 28 12 27.1046 12 26V14Z" stroke="var(--accent)" strokeWidth="2.5"/>
                <circle cx="30" cy="10" r="3" fill="var(--accent)" />
              </svg>
              <span className="text-xl font-black tracking-tighter text-white md:text-2xl">Examify</span>
            </NavLink>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-4 lg:flex">
              {navItems.map(([label, path]) => (
                <NavLink
                  key={path}
                  to={path}
                  style={({ isActive }) => ({ color: 'white', opacity: isActive ? 1 : 0.6 })}
                  className={({ isActive }) =>
                    `rounded-full px-5 py-2 text-sm font-black transition-all ${
                      isActive ? 'bg-[#00f5ca] !text-white shadow-[0_4_15px_rgba(0,245,202,0.3)]' : 'hover:opacity-100'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <ThemeToggle />
            
            {/* Desktop User Info */}
            <div className="hidden items-center gap-4 border-l border-white/10 pl-6 md:flex">
              <button
                className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 transition-all"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/></svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h7" strokeWidth="2" strokeLinecap="round"/></svg>
              )}
            </button>
          </div>
        </header>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden animate-in fade-in slide-in-from-top-4 fixed inset-x-4 top-24 z-50 rounded-3xl border border-white/10 bg-[#0f172a]/95 p-6 backdrop-blur-xl shadow-2xl">
            <nav className="flex flex-col gap-3">
              {navItems.map(([label, path]) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center rounded-2xl px-6 py-4 text-lg font-black transition-all ${
                      isActive ? 'bg-[#00f5ca] text-white' : 'text-white/60 hover:bg-white/5'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <hr className="my-2 border-white/10" />
              <button
                className="flex items-center rounded-2xl px-6 py-4 text-lg font-black text-red-400 hover:bg-white/5 transition-all text-left"
                onClick={handleLogout}
              >
                Logout
              </button>
            </nav>
          </div>
        )}

        <main className="glass-main animate-in fade-in slide-in-from-bottom-4 duration-1000 !p-6 md:!p-12">
          <Outlet />
        </main>

        <footer className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-white/20">
          &copy; 2026 Examify Dashboard &bull; All systems operational
        </footer>
      </div>
    </div>
  );
}

export default AppShell;
