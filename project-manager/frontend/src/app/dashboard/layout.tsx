'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Toaster } from 'sonner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    // Xóa cookie token
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = '/auth/login';
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <Toaster richColors position="top-right" />

      {/* 1. HEADER COMPONENT */}
      <Header onLogout={handleLogout} />

      <div className="flex flex-1">
        {/* 2. SIDEBAR COMPONENT */}
        <Sidebar onLogout={handleLogout} />

        {/* 3. MAIN CONTENT AREA */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 4. FOOTER COMPONENT */}
      <Footer />
    </div>
  );
}
