import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2, LayoutDashboard, LogOut, LogIn, UserPlus, Menu, X, Home, Link as LinkIcon, BarChart3, QrCode, Activity, ShieldAlert, Settings } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Links', path: '/my-links', icon: LinkIcon },
    { name: 'Insights', path: '/insights', icon: BarChart3 },
    { name: 'QR Center', path: '/qr-center', icon: QrCode },
    { name: 'Activity', path: '/activity', icon: Activity },
    { name: 'Safety', path: '/safety-center', icon: ShieldAlert },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-200 bg-white/90 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group hover:opacity-90 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-surface-950 flex items-center justify-center overflow-hidden shadow-sm">
              <img src="/logo.png" alt="LinkIQ Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-surface-900 leading-none tracking-tight">LinkIQ</span>
              <span className="text-[10px] text-surface-400 font-semibold tracking-[0.2em] uppercase mt-1">Platform</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-1 mr-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
                        ${isActive(item.path)
                          ? 'bg-blue-50 text-blue-600 shadow-sm'
                          : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                        }`}
                      title={item.name}
                    >
                      <item.icon size={16} className={isActive(item.path) ? 'text-blue-600' : 'text-surface-400'} />
                      <span className="hidden xl:inline">{item.name}</span>
                    </Link>
                  ))}
                </div>
                <div className="w-px h-6 bg-surface-200 mx-2" />
                <div className="flex items-center gap-3 group cursor-pointer hover:bg-surface-50 p-2 rounded-lg transition-colors">
                  <div className="w-9 h-9 rounded-full bg-surface-100 border border-surface-200 flex items-center justify-center text-surface-900 text-sm font-bold shadow-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-surface-900 font-bold leading-none">{user.name}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 ml-2 rounded-lg text-sm font-medium text-surface-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-all duration-200"
                >
                  <LogIn size={18} />
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary flex items-center gap-2 !px-6 !py-2.5 shadow-sm hover:shadow-md"
                >
                  <UserPlus size={16} />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-900 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 animate-slide-down border-t border-surface-100">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-9 h-9 rounded-full bg-surface-100 border border-surface-200 flex items-center justify-center text-surface-900 font-bold text-sm shadow-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-900">{user.name}</p>
                    <p className="text-xs text-surface-500">{user.email}</p>
                  </div>
                </div>
                <div className="py-2 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                        isActive(item.path) ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-surface-700 hover:bg-surface-50'
                      }`}
                    >
                      <item.icon size={18} className={isActive(item.path) ? 'text-blue-600' : 'text-surface-400'} />
                      {item.name}
                    </Link>
                  ))}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-surface-600 hover:bg-surface-50"
                >
                  <LogIn size={18} />
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 mt-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                >
                  <UserPlus size={18} />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
