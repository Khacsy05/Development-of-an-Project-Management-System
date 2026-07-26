'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#3b4c80] text-gray-200 text-center py-6 text-sm border-t border-[#2d3a63] shadow-inner mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        <p className="font-bold text-white uppercase tracking-wide">
          TRƯỜNG ĐẠI HỌC THỦY LỢI - KHOA CÔNG NGHỆ THÔNG TIN
        </p>
        <p className="text-gray-300 text-xs">
          Địa chỉ: Nhà C1, số 175 Tây Sơn, Đống Đa, Hà Nội.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-300 mt-1">
          <span>📞 Liên hệ: (+84)-024 3 5632211</span>
          <span>|</span>
          <span>✉️ Email: <a href="mailto:vpkcntt@tlu.edu.vn" className="hover:underline text-blue-300">vpkcntt@tlu.edu.vn</a></span>
        </div>
      </div>
    </footer>
  );
}
