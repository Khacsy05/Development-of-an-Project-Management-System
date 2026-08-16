"use client"

import React, { useEffect, useState } from 'react';
import { getMilestoneList, updateMilestone } from '@/services/milestone.service';
import { getSemesterList } from '@/services/semester.service';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

import { useFacultyCacheStore } from '@/store/useFacultyCacheStore';

export default function FacultyMilestonesPage() {
    const facultyId = useAuthStore((state) => state.faculty_id);
    const isInitializing = useAuthStore((state) => state.isInitializing);
    const { 
        milestonesCache, 
        setMilestonesCache, 
        clearMilestonesCache,
        semestersList,
        setSemestersList,
        selectedSemesterId: cachedSemesterId,
        setSelectedSemesterId: setCachedSemesterId
    } = useFacultyCacheStore();

    const [semesters, setSemesters] = useState<any[]>(semestersList || []);
    const [selectedSemesterId, setSelectedSemesterId] = useState(cachedSemesterId || '');
    const [milestones, setMilestones] = useState<any[]>(
        selectedSemesterId ? (milestonesCache.get(selectedSemesterId) || []) : []
    );
    const [isLoading, setIsLoading] = useState(
        selectedSemesterId ? !milestonesCache.has(selectedSemesterId) : false
    );

    // Modal UI states
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);

    // Form states
    const [formPhaseName, setFormPhaseName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formDeadline, setFormDeadline] = useState('');

    const fetchSemesters = async () => {
        try {
            const data = await getSemesterList();
            const list = Array.isArray(data) ? data : (data?.data || []);
            setSemesters(list);
            setSemestersList(list);
            if (list.length > 0 && !selectedSemesterId) {
                const firstId = String(list[0].semester_id);
                setSelectedSemesterId(firstId);
                setCachedSemesterId(firstId);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách học kỳ:', error);
        }
    };

    const fetchMilestones = async (semesterId: string) => {
        if (!semesterId) return;

        if (milestonesCache.has(semesterId)) {
            // Hiển thị ngay lập tức từ cache (0ms delay) và không gọi API nữa
            setMilestones(milestonesCache.get(semesterId)!);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            const data = await getMilestoneList(semesterId);
            const list = Array.isArray(data) ? data : (data?.data || []);
            setMilestones(list);
            setMilestonesCache(semesterId, list); // Cập nhật cache
        } catch (error) {
            console.error('Lỗi khi lấy danh sách mốc thời gian:', error);
            toast.error('Không thể tải danh sách mốc thời gian.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isInitializing && facultyId) {
            fetchSemesters();
        }
    }, [facultyId, isInitializing]);

    useEffect(() => {
        if (selectedSemesterId) {
            fetchMilestones(selectedSemesterId);
        }
    }, [selectedSemesterId]);

    // Format helpers for datetime-local
    const formatToDatetimeLocal = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const formatForBackend = (datetimeLocalStr: string) => {
        if (!datetimeLocalStr) return '';
        return datetimeLocalStr.replace('T', ' ') + ':00';
    };

    const handleOpenEdit = (milestone: any) => {
        setSelectedMilestone(milestone);
        setFormPhaseName(milestone.phase_name);
        setFormDescription(milestone.description || '');
        setFormDeadline(formatToDatetimeLocal(milestone.deadline));
        setIsEditOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!selectedMilestone) return;
            await updateMilestone(selectedMilestone.milestone_id, {
                phase_name: formPhaseName,
                description: formDescription,
                deadline: formatForBackend(formDeadline)
            });
            toast.success('Cập nhật mốc kế hoạch thành công!');
            setIsEditOpen(false);
            clearMilestonesCache();
            fetchMilestones(selectedSemesterId);
        } catch (error: any) {
            console.error('Lỗi khi cập nhật mốc:', error);
            toast.error(typeof error === 'string' ? error : 'Không thể cập nhật mốc kế hoạch.');
        }
    };

    const getStepColor = (index: number) => {
        switch (index) {
            case 0: return 'bg-blue-500 border-blue-500 text-white';
            case 1: return 'bg-amber-500 border-amber-500 text-white';
            case 2: return 'bg-emerald-500 border-emerald-500 text-white';
            case 3: return 'bg-rose-500 border-rose-500 text-white';
            default: return 'bg-gray-500 border-gray-500 text-white';
        }
    };

    const getStepBadge = (index: number) => {
        switch (index) {
            case 0: return 'bg-blue-50 text-blue-700 border-blue-200';
            case 1: return 'bg-amber-50 text-amber-700 border-amber-200';
            case 2: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 3: return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto p-2 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Kế hoạch & Mốc thời gian Đồ án</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Cấu hình thời hạn nộp báo cáo cho 4 giai đoạn đồ án của học kỳ.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">Học kỳ:</span>
                    <select
                        value={selectedSemesterId}
                        onChange={(e) => {
                            setSelectedSemesterId(e.target.value);
                            setCachedSemesterId(e.target.value);
                        }}
                        className="px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white text-xs font-bold text-gray-700"
                    >
                        <option value="">-- Chọn học kỳ --</option>
                        {semesters.map((sem) => (
                            <option key={String(sem.semester_id)} value={String(sem.semester_id)}>
                                {sem.semester_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* BẢNG HIỂN THỊ DỮ LIỆU */}
            {isLoading && milestones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-[#3b4c80] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 font-semibold">Đang tải lịch trình...</p>
                </div>
            ) : milestones.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm max-w-xl mx-auto mt-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Chưa cấu hình lịch trình</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">Học kỳ được chọn hiện chưa có mốc thời gian nộp bài nào được lưu trữ.</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm">
                    <table className="w-full border-collapse text-left text-xs md:text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                                <th className="px-6 py-4 text-center w-16">Giai đoạn</th>
                                <th className="px-6 py-4 w-48">Tên giai đoạn</th>
                                <th className="px-6 py-4">Mô tả & Yêu cầu nộp bài</th>
                                <th className="px-6 py-4 w-52">Hạn chót khóa cổng</th>
                                <th className="px-6 py-4 w-32">Trạng thái</th>
                                <th className="px-6 py-4 text-center w-28">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                            {milestones.map((milestone, index) => {
                                const isExpired = new Date(milestone.deadline) < new Date();
                                return (
                                    <tr key={String(milestone.milestone_id)} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                                                index === 0 ? 'bg-blue-500' :
                                                index === 1 ? 'bg-amber-500' :
                                                index === 2 ? 'bg-emerald-500' :
                                                index === 3 ? 'bg-rose-500' : 'bg-gray-500'
                                            }`}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {milestone.phase_name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 leading-relaxed max-w-xs md:max-w-md">
                                            {milestone.description || (
                                                <span className="text-gray-400 italic">Không có mô tả chi tiết yêu cầu nộp bài.</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-semibold font-mono">
                                            {new Date(milestone.deadline).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isExpired ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-100 text-red-700 text-[10px] rounded-full font-bold uppercase tracking-wider">
                                                    Đã đóng cổng
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-100 text-green-700 text-[10px] rounded-full font-bold uppercase tracking-wider animate-pulse">
                                                    Đang mở cổng
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleOpenEdit(milestone)}
                                                className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all shadow-sm gap-1"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Sửa hạn
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL: CẤU HÌNH HẠN MỐC THỜI GIAN */}
            {isEditOpen && selectedMilestone && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100 flex flex-col gap-4 mx-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Cấu hình mốc thời gian</h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">Cập nhật hạn chót nộp bài và yêu cầu chi tiết.</p>
                            </div>
                            <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="flex flex-col gap-3.5 text-xs text-gray-700">
                            <div>
                                <label className="block font-bold mb-1">Tên giai đoạn <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formPhaseName}
                                    onChange={(e) => setFormPhaseName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Yêu cầu nộp bài (Mô tả)</label>
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Hướng dẫn sinh viên các tài liệu cần chuẩn bị..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Hạn chót khóa cổng nộp bài <span className="text-red-500">*</span></label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formDeadline}
                                    onChange={(e) => setFormDeadline(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold transition-all text-gray-600">
                                    Hủy
                                </button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-sm">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
