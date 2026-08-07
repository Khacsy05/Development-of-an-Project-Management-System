"use client"

import React, { useEffect, useState } from 'react';
import { getCouncilList, createCouncil, updateCouncil, deleteCouncil, assignCouncilMembers, getCounciMember } from '@/services/council.service';
import { getSemesterList } from '@/services/semester.service';
import { getLecturerList } from '@/services/lecturer.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useFacultyCacheStore } from '@/store/useFacultyCacheStore';
import { toast } from 'sonner';

export default function FacultyCouncilsManagePage() {
    const facultyId = useAuthStore((state) => state.faculty_id);
    const isInitializing = useAuthStore((state) => state.isInitializing);
    const { councilsList, setCouncilsList } = useFacultyCacheStore();

    const [councils, setCouncils] = useState<any[]>([]);
    const [semesters, setSemesters] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(!councilsList);

    // Modal UI states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selectedCouncil, setSelectedCouncil] = useState<any | null>(null);

    // Member Assignment states
    const [lecturers, setLecturers] = useState<any[]>([]);
    const [chairmanId, setChairmanId] = useState('');
    const [secretaryId, setSecretaryId] = useState('');
    const [member1Id, setMember1Id] = useState('');
    const [member2Id, setMember2Id] = useState('');
    const [member3Id, setMember3Id] = useState('');

    // Form states
    const [formName, setFormName] = useState('');
    const [formSemesterId, setFormSemesterId] = useState('');
    const [formRooms, setFormRooms] = useState('');
    const [formBuildings, setFormBuildings] = useState('');
    const [formStartDate, setFormStartDate] = useState('');
    const [formEndDate, setFormEndDate] = useState('');

    const fetchCouncils = async () => {
        if (!facultyId) return;
        if (councilsList) {
            setCouncils(councilsList);
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
        try {
            const data = await getCouncilList();
            const list = Array.isArray(data) ? data : (data?.data || []);
            setCouncils(list);
            setCouncilsList(list);
        } catch (error: any) {
            console.error('Lỗi khi tải danh sách hội đồng:', error);
            toast.error('Không thể tải danh sách hội đồng.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSemesters = async () => {
        try {
            const data = await getSemesterList();
            setSemesters(Array.isArray(data) ? data : (data?.data || []));
        } catch (error) {
            console.error('Lỗi khi tải danh sách học kỳ:', error);
        }
    };

    const fetchLecturers = async () => {
        try {
            const data = await getLecturerList({ limit: 100 });
            setLecturers(Array.isArray(data) ? data : (data?.data || []));
        } catch (error) {
            console.error('Lỗi khi tải danh sách giảng viên:', error);
        }
    };

    useEffect(() => {
        if (!isInitializing && facultyId) {
            fetchCouncils();
            fetchSemesters();
            fetchLecturers();
        }
    }, [facultyId, isInitializing]);

    // Helpers to format datetime string for datetime-local input (YYYY-MM-DDTHH:MM)
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

    // Helper to format date for backend (replace T with space and append :00)
    const formatForBackend = (datetimeLocalStr: string) => {
        if (!datetimeLocalStr) return '';
        return datetimeLocalStr.replace('T', ' ') + ':00';
    };

    const handleOpenCreate = () => {
        setFormName('');
        setFormSemesterId(semesters[0]?.semester_id ? String(semesters[0].semester_id) : '');
        setFormRooms('');
        setFormBuildings('');
        setFormStartDate('');
        setFormEndDate('');
        setIsCreateOpen(true);
    };

    const handleOpenEdit = (council: any) => {
        setSelectedCouncil(council);
        setFormName(council.name);
        setFormSemesterId(String(council.semester_id));
        setFormRooms(council.rooms);
        setFormBuildings(council.buildings);
        setFormStartDate(formatToDatetimeLocal(council.start_date));
        setFormEndDate(formatToDatetimeLocal(council.end_date));
        setIsEditOpen(true);
    };

    const handleOpenDelete = (council: any) => {
        setSelectedCouncil(council);
        setIsDeleteOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!facultyId) return;
            await createCouncil({
                name: formName,
                semester_id: formSemesterId,
                rooms: formRooms,
                buildings: formBuildings,
                start_date: formatForBackend(formStartDate),
                end_date: formatForBackend(formEndDate),
            });
            toast.success('Thêm hội đồng mới thành công!');
            setIsCreateOpen(false);
            setCouncilsList(null);
            fetchCouncils();
        } catch (error: any) {
            console.error('Lỗi khi tạo hội đồng:', error);
            toast.error(typeof error === 'string' ? error : 'Không thể tạo hội đồng mới.');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!selectedCouncil) return;
            await updateCouncil(selectedCouncil.council_id, {
                name: formName,
                semester_id: formSemesterId,
                rooms: formRooms,
                buildings: formBuildings,
                start_date: formatForBackend(formStartDate),
                end_date: formatForBackend(formEndDate),
            });
            toast.success('Cập nhật hội đồng thành công!');
            setIsEditOpen(false);
            setCouncilsList(null);
            fetchCouncils();
        } catch (error: any) {
            console.error('Lỗi khi cập nhật hội đồng:', error);
            toast.error(typeof error === 'string' ? error : 'Không thể cập nhật hội đồng.');
        }
    };

    const handleDelete = async () => {
        try {
            if (!selectedCouncil) return;
            await deleteCouncil(selectedCouncil.council_id);
            toast.success('Xóa hội đồng thành công!');
            setIsDeleteOpen(false);
            setCouncilsList(null);
            fetchCouncils();
        } catch (error: any) {
            console.error('Lỗi khi xóa hội đồng:', error);
            toast.error(typeof error === 'string' ? error : 'Không thể xóa hội đồng.');
        }
    };

    const handleOpenAssign = (council: any) => {
        setSelectedCouncil(council);

        // Reset selections
        setChairmanId('');
        setSecretaryId('');
        setMember1Id('');
        setMember2Id('');
        setMember3Id('');

        // Find existing members
        if (Array.isArray(council.members)) {
            const chairman = council.members.find((m: any) => m.position === 'CHAIRMAN');
            const secretary = council.members.find((m: any) => m.position === 'SECRETARY');
            const members = council.members.filter((m: any) => m.position === 'REVIEWER');

            if (chairman) setChairmanId(String(chairman.lecturer_id));
            if (secretary) setSecretaryId(String(secretary.lecturer_id));
            if (members[0]) setMember1Id(String(members[0].lecturer_id));
            if (members[1]) setMember2Id(String(members[1].lecturer_id));
            if (members[2]) setMember3Id(String(members[2].lecturer_id));
        }

        setIsAssignOpen(true);
    };

    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!selectedCouncil) return;

            const payload: any[] = [];
            if (chairmanId) payload.push({ lecturer_id: chairmanId, position: 'CHAIRMAN' });
            if (secretaryId) payload.push({ lecturer_id: secretaryId, position: 'SECRETARY' });
            if (member1Id) payload.push({ lecturer_id: member1Id, position: 'REVIEWER' });
            if (member2Id) payload.push({ lecturer_id: member2Id, position: 'REVIEWER' });
            if (member3Id) payload.push({ lecturer_id: member3Id, position: 'REVIEWER' });

            if (payload.length === 0) {
                toast.error('Vui lòng chọn ít nhất một thành viên!WSL: Connect to WSL');
                return;
            }

            // Check for duplicate lecturers
            const lecturerIds = payload.map(p => p.lecturer_id);
            const hasDuplicates = new Set(lecturerIds).size !== lecturerIds.length;
            if (hasDuplicates) {
                toast.error('Một giảng viên không thể đảm nhiệm nhiều vị trí trong cùng một hội đồng!');
                return;
            }

            await assignCouncilMembers({
                council_id: selectedCouncil.council_id,
                members: payload
            });
            toast.success('Phân công thành viên hội đồng thành công!');
            setIsAssignOpen(false);
            setCouncilsList(null);
            fetchCouncils();
        } catch (error: any) {
            console.error('Lỗi khi phân công thành viên:', error);
            toast.error(typeof error === 'string' ? error : 'Không thể phân công thành viên.');
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto p-2 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Quản lý Hội đồng Bảo vệ</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Thêm, sửa, xóa và cấu hình các hội đồng chấm điểm đồ án tốt nghiệp của khoa.</p>
                </div>
                <div>
                    <button
                        onClick={handleOpenCreate}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Thành lập hội đồng mới
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-[#3b4c80] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 font-semibold">Đang tải danh sách hội đồng...</p>
                </div>
            ) : councils.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm max-w-xl mx-auto mt-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Chưa có hội đồng nào</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">Khoa hiện tại chưa thành lập hội đồng chấm bảo vệ nào trong học kỳ này.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                                    <th className="px-4 py-3.5 w-[25%]">Tên Hội đồng</th>
                                    <th className="px-4 py-3.5 w-[20%]">Học kỳ</th>
                                    <th className="px-4 py-3.5 w-[20%]">Địa điểm</th>
                                    <th className="px-4 py-3.5 w-[20%]">Thời gian bảo vệ</th>
                                    <th className="px-4 py-3.5 w-[15%] text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-gray-700 text-xs">
                                {councils.map((council: any) => (
                                    <tr key={council.council_id} className="hover:bg-slate-50/50 transition-colors align-middle">
                                        <td className="px-4 py-4 font-bold text-gray-900 text-sm">
                                            {council.name}
                                        </td>
                                        <td className="px-4 py-4 text-gray-600">
                                            {council.semester?.semester_name}
                                        </td>
                                        <td className="px-4 py-4 text-gray-600 font-medium">
                                            Phòng {council.rooms} - Nhà {council.buildings}
                                        </td>
                                        <td className="px-4 py-4 text-gray-500">
                                            <div>Bắt đầu: <span className="font-semibold text-gray-700">{new Date(council.start_date).toLocaleString('vi-VN')}</span></div>
                                            <div className="mt-0.5">Kết thúc: <span className="font-semibold text-gray-700">{new Date(council.end_date).toLocaleString('vi-VN')}</span></div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex gap-1.5 items-center justify-center">
                                                <button
                                                    onClick={() => handleOpenEdit(council)}
                                                    className="inline-flex items-center justify-center h-6 px-2 rounded-md text-[10px] font-semibold border border-indigo-100 bg-indigo-50 text-indigo-700 hover:border-indigo-200 hover:bg-indigo-100 transition-all"
                                                    title="Chỉnh sửa"
                                                >
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleOpenAssign(council)}
                                                    className="inline-flex items-center justify-center h-6 px-2 rounded-md text-[10px] font-semibold border border-green-100 bg-green-50 text-green-700 hover:border-green-200 hover:bg-green-100 transition-all"
                                                    title="Phân công thành viên"
                                                >
                                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    Thành viên
                                                </button>

                                                <button
                                                    onClick={() => handleOpenDelete(council)}
                                                    className="inline-flex items-center justify-center h-6 px-2 rounded-md text-[10px] font-semibold border border-red-100 bg-red-50 text-red-700 hover:border-red-200 hover:bg-red-100 transition-all"
                                                    title="Xóa"
                                                >
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL: THÊM HỘI ĐỒNG */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100 flex flex-col gap-4 mx-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="text-sm font-bold text-gray-900">Thành lập Hội đồng mới</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="flex flex-col gap-3.5 text-xs text-gray-700">
                            <div>
                                <label className="block font-bold mb-1">Tên Hội đồng <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Ví dụ: Hội đồng bảo vệ CNTT Số 1..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1">Học kỳ <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        value={formSemesterId}
                                        onChange={(e) => setFormSemesterId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white"
                                    >
                                        <option value="">-- Chọn học kỳ --</option>
                                        {semesters.map((sem) => (
                                            <option key={String(sem.semester_id)} value={String(sem.semester_id)}>
                                                {sem.semester_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block font-bold mb-1">Nhà <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="C1"
                                            value={formBuildings}
                                            onChange={(e) => setFormBuildings(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Phòng <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="402"
                                            value={formRooms}
                                            onChange={(e) => setFormRooms(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1">Thời gian bắt đầu <span className="text-red-500">*</span></label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formStartDate}
                                        onChange={(e) => setFormStartDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Thời gian kết thúc <span className="text-red-500">*</span></label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formEndDate}
                                        onChange={(e) => setFormEndDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold transition-all text-gray-600">
                                    Hủy
                                </button>
                                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-sm">
                                    Thành lập
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: SỬA HỘI ĐỒNG */}
            {isEditOpen && selectedCouncil && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100 flex flex-col gap-4 mx-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="text-sm font-bold text-gray-900">Chỉnh sửa thông tin Hội đồng</h3>
                            <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="flex flex-col gap-3.5 text-xs text-gray-700">
                            <div>
                                <label className="block font-bold mb-1">Tên Hội đồng <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1">Học kỳ <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        value={formSemesterId}
                                        onChange={(e) => setFormSemesterId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white"
                                    >
                                        <option value="">-- Chọn học kỳ --</option>
                                        {semesters.map((sem) => (
                                            <option key={String(sem.semester_id)} value={String(sem.semester_id)}>
                                                {sem.semester_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block font-bold mb-1">Nhà <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formBuildings}
                                            onChange={(e) => setFormBuildings(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Phòng <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formRooms}
                                            onChange={(e) => setFormRooms(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1">Thời gian bắt đầu <span className="text-red-500">*</span></label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formStartDate}
                                        onChange={(e) => setFormStartDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Thời gian kết thúc <span className="text-red-500">*</span></label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formEndDate}
                                        onChange={(e) => setFormEndDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white"
                                    />
                                </div>
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

            {/* MODAL: XÁC NHẬN XÓA */}
            {isDeleteOpen && selectedCouncil && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100 flex flex-col gap-4 mx-4">
                        <div className="flex items-center gap-3 text-red-600">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Giải tán Hội đồng</h3>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Bạn có chắc chắn muốn giải tán hội đồng <span className="font-bold text-gray-800">"{selectedCouncil.name}"</span> không? Hành động này sẽ xóa vĩnh viễn hội đồng và các phân công liên quan.
                        </p>
                        <div className="flex justify-end gap-2 border-t border-gray-100 pt-3 mt-1">
                            <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold transition-all text-xs text-gray-600">
                                Hủy bỏ
                            </button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-xs shadow-sm">
                                Xác nhận giải tán
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: PHÂN CÔNG THÀNH VIÊN HỘI ĐỒNG */}
            {isAssignOpen && selectedCouncil && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100 flex flex-col gap-4 mx-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Phân công thành viên Hội đồng</h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">{selectedCouncil.name}</p>
                            </div>
                            <button onClick={() => setIsAssignOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAssignSubmit} className="flex flex-col gap-3.5 text-xs text-gray-700">
                            <div>
                                <label className="block font-bold mb-1">Chủ tịch Hội đồng <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={chairmanId}
                                    onChange={(e) => setChairmanId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white"
                                >
                                    <option value="">-- Chọn giảng viên làm Chủ tịch --</option>
                                    {lecturers.map((lec) => (
                                        <option key={String(lec.user_id)} value={String(lec.user_id)}>
                                            {lec.fullname} ({lec.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Thư ký Hội đồng <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={secretaryId}
                                    onChange={(e) => setSecretaryId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white"
                                >
                                    <option value="">-- Chọn giảng viên làm Thư ký --</option>
                                    {lecturers.map((lec) => (
                                        <option key={String(lec.user_id)} value={String(lec.user_id)}>
                                            {lec.fullname} ({lec.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Ủy viên phản biện <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={member1Id}
                                    onChange={(e) => setMember1Id(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white"
                                >
                                    <option value="">-- Chọn giảng viên làm Ủy viên phản biện --</option>
                                    {lecturers.map((lec) => (
                                        <option key={String(lec.user_id)} value={String(lec.user_id)}>
                                            {lec.fullname} ({lec.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1">Ủy viên 2 (Tùy chọn)</label>
                                    <select
                                        value={member2Id}
                                        onChange={(e) => setMember2Id(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white"
                                    >
                                        <option value="">-- Trống --</option>
                                        {lecturers.map((lec) => (
                                            <option key={String(lec.user_id)} value={String(lec.user_id)}>
                                                {lec.fullname}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Ủy viên 3 (Tùy chọn)</label>
                                    <select
                                        value={member3Id}
                                        onChange={(e) => setMember3Id(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white"
                                    >
                                        <option value="">-- Trống --</option>
                                        {lecturers.map((lec) => (
                                            <option key={String(lec.user_id)} value={String(lec.user_id)}>
                                                {lec.fullname}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
                                <button type="button" onClick={() => setIsAssignOpen(false)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold transition-all text-gray-600">
                                    Hủy
                                </button>
                                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-sm">
                                    Lưu phân công
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}