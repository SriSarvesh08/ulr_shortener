import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, 
  Link as LinkIcon, 
  BarChart3, 
  Settings, 
  LogOut, 
  Upload, 
  ChevronLeft,
  ChevronRight,
  Home,
  QrCode,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, setIsCollapsed, onOpenBulkUpload }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home, exact: true },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'My Links', path: '/my-links', icon: LinkIcon, exact: true },
    { name: 'Insights', path: '/insights', icon: BarChart3, exact: true },
    { name: 'QR Center', path: '/qr-center', icon: QrCode, exact: true },
    { name: 'Activity Center', path: '/activity', icon: Activity, exact: true },
    { name: 'URL Safety Center', path: '/safety-center', icon: ShieldAlert, exact: true },
    { name: 'Bulk Upload', icon: Upload, action: onOpenBulkUpload },
    { name: 'Settings', path: '/settings', icon: Settings, exact: true },
  ];

  return (
    <aside
      className={`relative hidden md:flex flex-col bg-surface-950 border-r border-surface-800 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 border-b border-surface-800">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <div className="w-8 h-8 rounded bg-surface-900 border border-surface-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="LinkIQ Logo" className="w-full h-full object-cover" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-fade-in">
              <span className="text-sm font-semibold text-white leading-tight tracking-tight">LinkIQ</span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-surface-900 border border-surface-700 text-surface-400 hover:text-white rounded-md p-1 z-10 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-hide">
        {navItems.map((item) => {
          if (item.action) {
            return (
              <button
                key={item.name}
                onClick={item.action}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'} rounded-md text-surface-400 hover:bg-surface-800/50 hover:text-white transition-colors group`}
                title={item.name}
              >
                <item.icon
                  size={18}
                  className="flex-shrink-0 text-surface-500 group-hover:text-surface-300"
                />
                {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              </button>
            );
          }

          const isActive = item.exact 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'} rounded-md transition-colors group ${
                isActive
                  ? 'bg-surface-800 text-white font-semibold'
                  : 'text-surface-400 hover:bg-surface-800/50 hover:text-white'
              }`}
              title={item.name}
            >
              <item.icon
                size={18}
                className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-surface-500 group-hover:text-surface-300'}`}
              />
              {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Nav */}
      <div className="p-2 border-t border-surface-800">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'} rounded-md text-surface-400 hover:bg-surface-800 hover:text-white transition-colors group`}
          title="Logout"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
