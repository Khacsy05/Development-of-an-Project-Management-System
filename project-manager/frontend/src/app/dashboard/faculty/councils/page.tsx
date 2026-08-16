"use client"

import { useAuthStore } from '@/store/useAuthStore'
import { assignCouncil, getCapstoneLists } from '@/services/capstone.service';
import { useFacultyCacheStore } from '@/store/useFacultyCacheStore';
import React, { useEffect, useState } from 'react'
import { getCouncilList } from '@/services/council.service';
import { CapstoneStatus } from '@/type/capstone';
import { toast } from 'sonner';

const Page = () => {
    const faculty_id = useAuthStore((state) => state.faculty_id)
    const isInitializing = useAuthStore((state) => state.isInitializing)
    const { councilsAssignCache, setCouncilsAssignCache, clearCouncilsAssignCache } = useFacultyCacheStore();

    const [capstones, setCapstones] = useState<any[]>([])
    const [councils, setCouncils] = useState<any[]>([])
    const [selectedCapstone, setSelectedCapstone] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(!councilsAssignCache.has('1'))
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 5;

    const fetchCapstones = async (page: number) => {
        if (!faculty_id) return
        const cacheKey = String(page);
        if (councilsAssignCache.has(cacheKey)) {
            const cached = councilsAssignCache.get(cacheKey)!;
            setCapstones(cached.data || []);
            setCurrentPage(cached.pagination.page);
            setTotalPages(cached.pagination.totalPages);
            setTotalItems(cached.pagination.total);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await getCapstoneLists({ 
                faculty_id, 
                status: CapstoneStatus.DEFENSE_ELIGIBLE,
                isUnassigned: 'true',
                page,
                limit
            })
            setCapstones(res.data || [])
            setCurrentPage(res.pagination?.page || 1);
            setTotalPages(res.pagination?.totalPages || 1);
            setTotalItems(res.pagination?.total || 0);
            setCouncilsAssignCache(cacheKey, res);
        } catch (error) {
            console.error(error)
            toast.error('Không thể tải danh sách đồ án.')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchCouncils = async () => {
        try {
            const response = await getCouncilList()
            const list = response || [];
            setCouncils(list)
        } catch (error) {
            console.error(error)
            toast.error('Không thể tải danh sách hội đồng.')
        }
    }

    useEffect(() => {
        if (!isInitializing) {
            if (faculty_id) {
                fetchCapstones(currentPage)
                fetchCouncils()
            } else {
                setIsLoading(false)
            }
        }
    }, [faculty_id, isInitializing, currentPage])

    const handleAssignCouncil = async (capstoneId: string, councilId: string) => {
        try {
            await assignCouncil(capstoneId, councilId)
            toast.success('Phân công hội đồng bảo vệ thành công!')
            setSelectedCapstone(null)
            clearCouncilsAssignCache();
            fetchCapstones(currentPage)
        } catch (error: any) {
            const backendMessage = error.response?.data?.message || 'Có lỗi xảy ra khi phân công hội đồng';
            toast.error(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage);
        }
    }

    const unassignedCapstones = capstones;

    const getPositionBadgeClass = (pos: string) => {
        switch (pos?.toLowerCase()) {
            case 'chairman':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'secretary':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'reviewer':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    }

    const getPositionText = (pos: string) => {
        switch (pos?.toLowerCase()) {
            case 'chairman':
                return 'Chủ tịch';
            case 'secretary':
                return 'Thư ký';
            case 'reviewer':
                return 'Ủy viên phản biện';
            default:
                return 'Ủy viên';
        }
    }

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto p-2">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Phân công Hội đồng Bảo vệ</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Duyệt và phân công hội đồng đánh giá cho các đồ án đủ điều kiện bảo vệ.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#3b4c80] border border-blue-100">
                        {unassignedCapstones.length} đồ án chờ phân công
                    </span>
                </div>
            </div>

            {/* Main content table */}
            {(isLoading || !faculty_id) ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-[#3b4c80] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 font-semibold">Đang tải danh sách đồ án...</p>
                </div>
            ) : unassignedCapstones.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm max-w-xl mx-auto mt-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Hoàn tất phân công!</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">Hiện tại không có đồ án nào đủ điều kiện bảo vệ đang chờ phân công hội đồng.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                                    <th className="px-4 py-3 w-[45%]">Đề tài & Mô tả</th>
                                    <th className="px-4 py-3 w-[18%]">Sinh viên</th>
                                    <th className="px-4 py-3 w-[18%]">Giảng viên hướng dẫn</th>
                                    <th className="px-4 py-3 w-[11%]">Khoa</th>
                                    <th className="px-4 py-3 w-[8%] text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-gray-700 text-xs">
                                {unassignedCapstones.map((capstone) => (
                                    <tr key={capstone.capstone_id} className="hover:bg-slate-50/50 transition-colors align-middle">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">
                                                    {capstone.topic?.title || 'Chưa đăng ký đề tài'}
                                                </span>
                                                <span className="text-[10px] text-gray-400 line-clamp-1">
                                                    {capstone.topic?.description || 'Chưa có mô tả chi tiết cho đề tài.'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-800">
                                            <div className="flex flex-col">
                                                <span>{capstone.student?.fullname || 'Chưa gán sinh viên'}</span>
                                                <span className="font-mono text-[10px] text-gray-400 mt-0.5">#{capstone.student?.user?.usercode || '---'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-800">
                                            {capstone.lecturer?.fullname || 'Chưa có GVHD'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {capstone.faculty?.name || '---'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => setSelectedCapstone(capstone)}
                                                className="bg-[#3b4c80] hover:bg-[#2d3a63] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm flex items-center justify-center gap-1 mx-auto"
                                            >
                                                Phân công
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {totalItems > 0 && (
                        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                            <div className="text-gray-400 font-semibold text-xs">
                                Hiển thị {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, totalItems)} trong tổng số {totalItems}
                            </div>
                            <nav className="inline-flex -space-x-px rounded-md shadow-sm">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-md px-3 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:pointer-events-none text-xs"
                                >
                                    Trước
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`relative inline-flex items-center px-3 py-1.5 text-xs font-bold focus:z-20 ${
                                            currentPage === pageNum
                                                ? 'z-10 bg-blue-600 text-white ring-1 ring-blue-600 focus-visible:outline focus-visible:outline-2 pointer-events-none'
                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-3 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:pointer-events-none text-xs"
                                >
                                    Sau
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            )}

            {/* Elegant Modal for Assignment */}
            {selectedCapstone && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div>
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800">
                                    CHỌN HỘI ĐỒNG BẢO VỆ
                                </span>
                                <h2 className="text-lg font-bold text-gray-900 mt-1 line-clamp-1">
                                    {selectedCapstone.topic?.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedCapstone(null)}
                                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Hội đồng khả dụng của khoa</p>

                            {councils.length === 0 ? (
                                <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
                                    <p className="text-sm text-gray-400">Không tìm thấy hội đồng nào khả dụng trong khoa của bạn.</p>
                                </div>
                            ) : (
                                councils.map((council) => (
                                    <div
                                        key={council.council_id}
                                        className="border border-gray-200 hover:border-[#3b4c80] rounded-2xl p-5 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row justify-between md:items-center gap-4 relative group"
                                    >
                                        <div className="flex-1 space-y-2.5">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-base text-gray-800 group-hover:text-[#3b4c80] transition-colors">
                                                    {council.name}
                                                </h3>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500">
                                                    {council.rooms || 'Phòng học'} - {council.buildings || 'Tòa nhà'}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAssignCouncil(selectedCapstone.capstone_id, council.council_id)}
                                            className="bg-[#3b4c80] hover:bg-[#2d3a63] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5"
                                        >
                                            Phân công
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedCapstone(null)}
                                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all"
                            >
                                Hủy bỏ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Page;