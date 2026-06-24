import React, { useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import MobileSidebar from "@/components/layout/MobileSidebar";

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--bg-color)] text-[var(--text-color)] overflow-hidden font-sans transition-colors duration-300">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      <MobileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 no-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
