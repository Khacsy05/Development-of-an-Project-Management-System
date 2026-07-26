'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const { role, userName } = useAuthStore();

  return (
    <header className="bg-[#3b4c80] text-white flex items-center justify-between px-6 py-3 shadow-md border-b border-[#2d3a63]">
      <div className="flex items-center gap-4">
        {/* Logo Trường */}
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-1.5 shadow-inner">
          <img 
            src="https://www.tlu.edu.vn/Portals/0/images/logo.png" 
            alt="TLU Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide uppercase">
            TRƯỜNG ĐẠI HỌC THỦY LỢI
          </h1>
          <p className="text-xs text-blue-200 uppercase font-medium tracking-wider">
            THUYLOI UNIVERSITY
          </p>
        </div>
      </div>

      {/* User Info & Notification */}
      <div className="flex items-center gap-6">
        {/* Nút Chuông Thông Báo */}
        <button className="relative p-2 hover:bg-white/10 rounded-full transition-all">
          <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md animate-pulse">
            99+
          </span>
        </button>

        {/* Hồ sơ Người dùng */}
        <div className="flex items-center gap-3 border-l border-white/20 pl-6">
          <div className="flex flex-col text-right">
            <span className="font-semibold text-sm tracking-wide">
              {userName || 'Nguyễn Ngọc Trà My'}
            </span>
            <span className="text-[11px] text-blue-200 font-medium px-2 py-0.5 bg-white/10 rounded-full inline-block mt-0.5 self-end">
              {role === 'Lecturer' ? 'Giảng Viên' : role === 'Student' ? 'Sinh Viên' : 'Quản Trị'}
            </span>
          </div>
          
          {/* Avatar */}
          <div className="group relative">
            <div className="w-10 h-10 bg-teal-600 border-2 border-white/40 text-white font-bold rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-all">
              {userName ? userName.charAt(0).toUpperCase() : 'N'}
            </div>

            {/* Menu Đăng xuất nhanh khi hover */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 hidden group-hover:block z-50 animate-fade-in">
              <button 
                onClick={onLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:font-semibold flex items-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
