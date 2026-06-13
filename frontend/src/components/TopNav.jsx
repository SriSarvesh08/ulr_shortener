import { Search, Bell, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopNav = ({ searchTerm, setSearchTerm }) => {
  const { user } = useAuth();

  const handleOpenCreateModal = () => {
    window.dispatchEvent(new Event('openCreateUrlModal'));
  };

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-surface-900 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search links..."
            className="w-full bg-surface-50 border border-transparent rounded-md pl-9 pr-4 py-1.5 text-sm text-surface-900 placeholder:text-surface-500 focus:outline-none focus:border-surface-300 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 pl-4">
        
        {/* Quick Create Link Button */}
        <button
          onClick={handleOpenCreateModal}
          className="btn-primary !py-1.5 !px-3 flex items-center gap-1.5 text-xs font-semibold"
        >
          <Plus size={14} />
          Create Link
        </button>


        {/* Notifications */}
        <button className="p-1.5 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-md transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-600"></span>
        </button>

        <div className="w-px h-4 bg-surface-200 mx-1 hidden sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded bg-surface-100 border border-surface-200 flex items-center justify-center">
            <span className="text-xs font-semibold text-surface-900">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-surface-900 leading-none">{user?.name}</span>
            <span className="text-[10px] text-surface-500 mt-1 leading-none">{user?.email}</span>
          </div>
        </div>
      </div>

    </header>
  );
};

export default TopNav;
