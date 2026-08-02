'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, isDean, sidebarMode, setSidebarMode } = useAuthStore();

  const rolePrefix = role === 'Student'
    ? '/dashboard/student'
    : (role === 'Lecturer'
      ? (sidebarMode === 'dean' ? '/dashboard/faculty' : '/dashboard/lecturer')
      : '/dashboard/admin');

  // Tự động đồng bộ hóa sidebarMode dựa trên đường dẫn thực tại để tránh bị nhảy vai trò khi reload / refresh token
  React.useEffect(() => {
    if (role === 'Lecturer' && isDean) {
      if (pathname.startsWith('/dashboard/faculty')) {
        setSidebarMode('dean');
      } else if (pathname.startsWith('/dashboard/lecturer')) {
        setSidebarMode('lecturer');
      }
    }
  }, [pathname, role, isDean, setSidebarMode]);

  // 1. Menu cho Sinh Viên (Student) - Theo ảnh chụp thực tế
  const studentMenu = [
    {
      title: '',
      items: [
        {
          name: 'Trang chủ', path: rolePrefix, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          )
        },
      ]
    },
    {
      title: 'ĐỒ ÁN TỐT NGHIỆP',
      items: [
        {
          name: 'Đăng ký đề tài', path: `${rolePrefix}/register-topic`, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          )
        },
        {
          name: 'Đăng ký GVHD đồ án', path: `${rolePrefix}/register-lecturer`, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          )
        },
        {
          name: 'Báo cáo đồ án', path: `${rolePrefix}/report`, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        },
      ]
    },
  ];

  // 2. Menu cho Giảng Viên (Lecturer)
  const lecturerMenu = [
    {
      title: '',
      items: [
        {
          name: 'Trang chủ', path: rolePrefix, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          )
        },
      ]
    },
    {
      title: 'HƯỚNG DẪN ĐỒ ÁN',
      items: [
        {
          name: 'Xác nhận HDĐA', path: `${rolePrefix}/confirm`, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          name: 'Quản lý báo cáo đồ án', path: `${rolePrefix}/reports`, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        },
        {
          name: 'Chấm điểm đồ án', path: `${rolePrefix}/grades`, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          )
        },
        {
          name: 'Quản lý yêu cầu hủy', path: `${rolePrefix}/cancels`, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
      ]
    },
    {
      title: 'PHẢN BIỆN ĐỒ ÁN',
      items: [
        {
          name: 'Chấm điểm phản biện', path: `${rolePrefix}/reviews`, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          )
        },
      ]
    }
  ];

  // 3. Menu cho Trưởng Khoa (Dean - Lecturer là Trưởng khoa)
  const deanMenu = [
    {
      title: '',
      items: [
        {
          name: 'Trang chủ', path: rolePrefix, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          )
        },
      ]
    },
    {
      title: 'QUẢN LÝ KHOA (TRƯỞNG KHOA)',
      items: [
        {
          name: 'Quản lý đề tài', path: `${rolePrefix}/topics`, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )
        },
        {
          name: 'Duyệt đăng ký đề tài', path: `${rolePrefix}/topics/approve`, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          )
        },
        {
          name: 'Quản lý báo cáo đồ án', path: `${rolePrefix}/reports`, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        },
        {
          name: 'Quản lý yêu cầu hủy', path: `${rolePrefix}/cancels`, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          name: 'Phân công hội đồng', path: `${rolePrefix}/councils`, icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )
        },
      ]
    }
  ];

  // Nếu chưa có role (đang trong quá trình khởi tạo hoặc đăng xuất)
  if (!role) {
    return (
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col py-6 select-none shrink-0 shadow-sm">
        <div className="flex flex-col gap-6 px-6 flex-1 animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-1/3"></div>
            <div className="h-10 bg-gray-50 rounded-xl w-full"></div>
            <div className="h-10 bg-gray-50 rounded-xl w-full"></div>
          </div>
          <div className="space-y-3 mt-4">
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="h-10 bg-gray-50 rounded-xl w-full"></div>
            <div className="h-10 bg-gray-50 rounded-xl w-full"></div>
          </div>
        </div>
      </aside>
    );
  }

  // Quyết định danh sách hiển thị dựa vào role hiện tại và chế độ sidebarMode
  let currentMenu = lecturerMenu;
  if (role === 'Student') {
    currentMenu = studentMenu;
  } else if (role === 'Lecturer') {
    currentMenu = sidebarMode === 'dean' ? deanMenu : lecturerMenu;
  }

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col py-6 select-none shrink-0 shadow-sm">
      <div className="flex flex-col gap-6 px-4 flex-1">
        {currentMenu.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-1.5">
            {group.title && (
              <h3 className="px-3 text-[11px] font-bold text-[#8d9299] tracking-wider uppercase mb-1">
                {group.title}
              </h3>
            )}
            {group.items.map((item, itemIdx) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={itemIdx}
                  onClick={() => router.push(item.path)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                    ? 'bg-blue-50 text-[#3b4c80] shadow-sm border-l-4 border-[#3b4c80] font-bold'
                    : 'text-[#6f7482] hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <span className={isActive ? 'text-[#3b4c80]' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  {item.name}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Nút chuyển đổi vai trò (Chỉ hiển thị cho Trưởng khoa) */}
      {role === 'Lecturer' && isDean && (
        <div className="px-4 mb-2">
          <button
            onClick={() => {
              const targetMode = sidebarMode === 'lecturer' ? 'dean' : 'lecturer';
              setSidebarMode(targetMode);
              const targetPrefix = targetMode === 'dean' ? '/dashboard/faculty' : '/dashboard/lecturer';
              router.push(targetPrefix);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-[#3b4c80] hover:bg-[#2d3a63] text-white shadow-md transition-all duration-200"
          >
            {sidebarMode === 'lecturer' ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Quản lý Khoa
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Vai trò Giảng viên
              </>
            )}
          </button>
        </div>
      )}

      {/* Nút Đăng xuất ở chân Sidebar */}
      <div className="px-4 mt-auto pt-6 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất hệ thống
        </button>
      </div>
    </aside>
  );
}
