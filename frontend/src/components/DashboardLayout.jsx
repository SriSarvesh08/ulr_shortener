import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import BulkUploadModal from './BulkUploadModal';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import React from 'react';

const DashboardLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  const handleBulkUpload = async (urls) => {
    try {
      const response = await api.post('/urls/bulk-create', { urls });
      toast.success(`Successfully uploaded ${response.data.results.length} URLs!`);
      window.dispatchEvent(new Event('urlCreated'));
    } catch (err) {
      toast.error('Failed to process bulk upload.');
      throw err;
    }
  };

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { searchTerm });
    }
    return child;
  });

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden text-surface-900 font-sans">
      
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
        onOpenBulkUpload={() => setIsBulkUploadOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-50">
        {/* Stronger blue SaaS background accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[100px]" />
          <div className="absolute top-[40%] -left-[5%] w-[30%] h-[40%] rounded-full bg-indigo-500/15 blur-[100px]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[40%] rounded-full bg-sky-400/20 blur-[100px]" />
        </div>

        <TopNav searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        <main className="flex-1 overflow-y-auto scrollbar-hide relative z-10">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-10 py-8">
            {childrenWithProps}
          </div>
        </main>
      </div>

      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onUpload={handleBulkUpload}
      />
    </div>
  );
};

export default DashboardLayout;
