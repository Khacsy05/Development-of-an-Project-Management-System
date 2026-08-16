'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Toaster, toast } from 'sonner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import apiClient from '@/lib/apiClient';

import { useCacheStore } from '@/store/useCacheStore';
import { useFacultyCacheStore } from '@/store/useFacultyCacheStore';

import { updatePassword } from '@/services/auth.service';
import { updateUserProfile, getUserById } from '@/services/user.service';
import { getExpertiseList } from '@/services/expertise.service';
import { getMyExpertises, saveMyExpertises } from '@/services/lecturer-expertise.service';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, isFirstLogin, username, setIsFirstLogin, userId, updateUserDetail, role: authRole, userName, userEmail } = useAuthStore();
  const { clearCache } = useCacheStore();
  const { clearFacultyCache } = useFacultyCacheStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // States for password change modal
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // States for manual modals
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);

  // Profile editing states
  const [profileMode, setProfileMode] = React.useState<'view' | 'edit'>('view');
  const [profileForm, setProfileForm] = React.useState({
    fullname: '',
    email: '',
    phone_number: '',
    gender: '',
  });
  const [allExpertises, setAllExpertises] = React.useState<any[]>([]);
  const [myExpertiseIds, setMyExpertiseIds] = React.useState<string[]>([]);
  const [isProfileLoading, setIsProfileLoading] = React.useState(false);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  const loadProfileData = async () => {
    if (!userId) return;
    setIsProfileLoading(true);
    try {
      // 1. Fetch user detailed profile info
      const userRes = await getUserById(userId);
      const user = userRes || {};
      setProfileForm({
        fullname: user.fullname || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        gender: user.gender || '',
      });

      // 2. If user is a Lecturer, fetch expertises
      if (authRole === 'Lecturer') {
        const [allExp, myExp] = await Promise.all([
          getExpertiseList(),
          getMyExpertises(),
        ]);
        setAllExpertises(allExp || []);
        // Convert BigInt IDs to string for checkboxes matching
        setMyExpertiseIds((myExp || []).map((e: any) => String(e.expertise_id)));
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin hồ sơ:', error);
      toast.error('Không thể tải thông tin cá nhân.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  React.useEffect(() => {
    if (isProfileOpen) {
      setProfileMode('view');
      // Giữ lại số điện thoại và giới tính đã tải từ trước để hiển thị tức thì, không xóa trắng
      setProfileForm((prev) => ({
        fullname: prev.fullname || userName || '',
        email: prev.email || userEmail || '',
        phone_number: prev.phone_number || '',
        gender: prev.gender || '',
      }));
      loadProfileData();
    }
  }, [isProfileOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // 1. Hiển thị Loading Toast lập tức để phản hồi người dùng
    const toastId = toast.loading('Đang đăng xuất...');

    // 2. Xóa trạng thái đăng nhập ở RAM ngay để giao diện đổi sang trạng thái Loading
    logout();
    clearCache();
    clearFacultyCache();

    try {
      // 3. Gọi API xóa HttpOnly Cookie phía Backend
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Lỗi khi gọi API đăng xuất:', error);
    } finally {
      toast.dismiss(toastId);
      // 4. Chuyển hướng về trang đăng nhập
      window.location.href = '/auth/login';
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent, isManual = false) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ tất cả các trường!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không trùng khớp!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword({
        username: username || '',
        oldPassword,
        newPassword,
        confirmPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      if (isManual) {
        setIsChangePasswordOpen(false);
      } else {
        setIsFirstLogin(false);
      }
      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Kiểm tra Họ tên
    if (!profileForm.fullname.trim()) {
      toast.error('Họ và tên không được để trống!');
      return;
    }

    // 2. Validate định dạng Email
    if (!profileForm.email.trim()) {
      toast.error('Email không được để trống!');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileForm.email.trim())) {
      toast.error('Định dạng Email không hợp lệ (Ví dụ: abc@tlu.edu.vn)!');
      return;
    }

    // 3. Validate định dạng Số điện thoại Việt Nam (nếu nhập)
    const phoneVal = profileForm.phone_number.trim();
    if (phoneVal) {
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(phoneVal)) {
        toast.error('Số điện thoại không hợp lệ! Vui lòng nhập SĐT Việt Nam gồm 10 chữ số (bắt đầu bằng 03, 05, 07, 08, 09).');
        return;
      }
    }

    setIsSavingProfile(true);
    try {
      // 1. Save user profile fields
      await updateUserProfile({
        fullname: profileForm.fullname.trim(),
        email: profileForm.email.trim(),
        phone_number: phoneVal || undefined,
        gender: profileForm.gender || undefined,
      });

      // 2. If lecturer, save expertises
      if (authRole === 'Lecturer') {
        await saveMyExpertises(myExpertiseIds);
      }

      // 3. Update Zustand AuthStore details
      updateUserDetail(profileForm.fullname.trim(), profileForm.email.trim());

      toast.success('Cập nhật thông tin cá nhân thành công!');
      setProfileMode('view');
      // Reload profile to ensure UI has latest data
      loadProfileData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Cập nhật thông tin thất bại!';
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleExpertiseCheck = (expId: string, checked: boolean) => {
    if (checked) {
      setMyExpertiseIds((prev) => [...prev, expId]);
    } else {
      setMyExpertiseIds((prev) => prev.filter((id) => id !== expId));
    }
  };

  if (isLoggingOut) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-800">
        <Toaster richColors position="top-right" />
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-sm font-semibold text-gray-600">Đang đăng xuất khỏi hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 overflow-hidden relative">
      <Toaster richColors position="top-right" />

      {/* 1. HEADER COMPONENT */}
      <Header
        onProfileClick={() => setIsProfileOpen(true)}
        onChangePasswordClick={() => {
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setIsChangePasswordOpen(true);
        }}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* 2. SIDEBAR COMPONENT */}
        <Sidebar
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* 3. MAIN CONTENT AREA */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* 4. FOOTER COMPONENT */}
      <Footer />

      {/* 5. MANDATORY CHANGE PASSWORD MODAL */}
      {isFirstLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md select-none">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-gray-100 flex flex-col gap-5 animate-scaleUp">
            <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
              <h2 className="text-base font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block"></span>
                Đổi mật khẩu bắt buộc
              </h2>
              <p className="text-[11px] font-semibold text-gray-400">
                Đây là lần đăng nhập đầu tiên của bạn. Hãy đổi mật khẩu để bảo vệ tài khoản.
              </p>
            </div>
            <form onSubmit={(e) => handlePasswordSubmit(e, false)} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-bold mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu cũ"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-bold mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-bold mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end mt-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Đăng xuất
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. PROFILE MODAL */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-xl border border-gray-100 flex flex-col gap-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-tight">Hồ sơ cá nhân</h2>
              <button onClick={() => setIsProfileOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {profileMode === 'view' ? (
              /* VIEW MODE */
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col items-center justify-center gap-2 mb-2">
                  <div className="w-16 h-16 bg-teal-600 text-white font-extrabold text-2xl rounded-full flex items-center justify-center shadow-md">
                    {username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-base text-gray-900">{userName || profileForm.fullname || username}</span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase px-2 py-0.5 bg-blue-50 rounded-full">
                    {authRole === 'Lecturer' ? 'Giảng Viên' : authRole === 'Student' ? 'Sinh Viên' : 'Quản trị viên'}
                  </span>
                </div>

                <div className="space-y-2 text-xs border-t border-gray-50 pt-3">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-400 font-bold">Mã số tài khoản:</span>
                    <span className="col-span-2 text-gray-800 font-bold">{username}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-400 font-bold">Địa chỉ Email:</span>
                    <span className="col-span-2 text-gray-800 font-bold">{userEmail || profileForm.email}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <span className="text-gray-400 font-bold">Số điện thoại:</span>
                    <span className="col-span-2 text-gray-800 font-bold">
                      {isProfileLoading && !profileForm.phone_number ? (
                        <span className="inline-block w-24 h-4 bg-gray-100 rounded animate-pulse"></span>
                      ) : (
                        profileForm.phone_number || 'Chưa cập nhật'
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <span className="text-gray-400 font-bold">Giới tính:</span>
                    <span className="col-span-2 text-gray-800 font-bold">
                      {isProfileLoading && !profileForm.gender ? (
                        <span className="inline-block w-16 h-4 bg-gray-100 rounded animate-pulse"></span>
                      ) : (
                        profileForm.gender || 'Chưa cập nhật'
                      )}
                    </span>
                  </div>
                </div>

                {/* Danh sách chuyên môn nếu là giảng viên */}
                {authRole === 'Lecturer' && (
                  <div className="border-t border-gray-50 pt-3 flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-400">Lĩnh vực chuyên môn:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {isProfileLoading && myExpertiseIds.length === 0 ? (
                        <div className="flex gap-2">
                          <span className="w-16 h-6 bg-gray-100 rounded-lg animate-pulse inline-block"></span>
                          <span className="w-20 h-6 bg-gray-100 rounded-lg animate-pulse inline-block"></span>
                        </div>
                      ) : allExpertises.filter(exp => myExpertiseIds.includes(String(exp.expertise_id))).length === 0 ? (
                        <span className="text-xs text-gray-400 italic">Chưa đăng ký chuyên môn</span>
                      ) : (
                        allExpertises
                          .filter(exp => myExpertiseIds.includes(String(exp.expertise_id)))
                          .map(exp => (
                            <span key={exp.expertise_id} className="px-2 py-1 bg-teal-50 text-teal-700 text-[10px] rounded-lg font-bold border border-teal-100">
                              {exp.name}
                            </span>
                          ))
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => setProfileMode('edit')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            ) : (
              /* EDIT MODE */
              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 py-2">
                <div>
                  <label className="block text-xs text-gray-500 font-bold mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={profileForm.fullname}
                    onChange={(e) => setProfileForm({ ...profileForm, fullname: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-bold mb-1">Địa chỉ Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 font-bold mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      placeholder="Nhập SĐT"
                      value={profileForm.phone_number}
                      onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-bold mb-1">Giới tính</label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                    >
                      <option value="">Chưa chọn</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                {/* Đăng ký chuyên môn cho giảng viên */}
                {authRole === 'Lecturer' && (
                  <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-500 mb-1">Đăng ký lĩnh vực chuyên môn:</span>
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-gray-100 p-3 rounded-xl bg-gray-50/50">
                      {allExpertises.map((exp) => {
                        const isChecked = myExpertiseIds.includes(String(exp.expertise_id));
                        return (
                          <label key={exp.expertise_id} className="flex items-center gap-2 text-[11px] font-semibold text-gray-700 cursor-pointer hover:text-gray-900">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleExpertiseCheck(String(exp.expertise_id), e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                            />
                            {exp.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setProfileMode('view')}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 7. MANUAL CHANGE PASSWORD MODAL */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-100 flex flex-col gap-4 animate-scaleUp">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-tight">Đổi mật khẩu tài khoản</h2>
              <button onClick={() => setIsChangePasswordOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => handlePasswordSubmit(e, true)} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-bold mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu cũ"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-bold mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-bold mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end mt-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
