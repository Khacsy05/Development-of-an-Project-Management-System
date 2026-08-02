"use client"

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { getCapstoneLists, updatedCapstone } from '@/services/capstone.service'
import { toast } from 'sonner'
import { CapstoneStatus } from '@/type/capstone'

export default function LecturerCancelsPage() {
    const [capstones, setCapstones] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const userId = useAuthStore((state) => state.userId)
    const isInitializing = useAuthStore((state) => state.isInitializing)

    const fetchCancelRequests = async () => {
        if (!userId) return
        setIsLoading(true)
        try {
            // Lấy danh sách các đồ án có trạng thái CANCEL_REQUESTED của giảng viên này
            const res = await getCapstoneLists({ 
                lecturer_id: userId, 
                status: 'CANCEL_REQUESTED' as CapstoneStatus 
            })
            setCapstones(res.data || [])
        } catch (error) {
            console.error('Lỗi khi tải yêu cầu hủy:', error)
            toast.error('Không thể tải danh sách yêu cầu hủy.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!isInitializing) {
            if (userId) {
                fetchCancelRequests()
            } else {
                setIsLoading(false)
            }
        }
    }, [userId, isInitializing])

    const handleProcessCancel = async (capstoneId: string, accept: boolean) => {
        try {
            // Nếu đồng ý thì thành CANCEL, nếu không thì chuyển lại PENDING
            const nextStatus = accept ? 'CANCEL' : 'PENDING'
            await updatedCapstone(capstoneId, { status: nextStatus })
            
            toast.success(accept ? 'Đã duyệt đồng ý hủy đồ án!' : 'Đã từ chối yêu cầu hủy đồ án!')
            fetchCancelRequests()
        } catch (error: any) {
            const backendMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xử lý yêu cầu';
            toast.error(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage)
        }
    }

    if (isLoading || !userId) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-[#3b4c80] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-semibold">Đang tải yêu cầu hủy đồ án...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto p-2 animate-fadeIn">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Quản lý Yêu cầu Hủy đồ án</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Xét duyệt các yêu cầu xin hủy/rút đồ án của sinh viên do bạn hướng dẫn.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">
                        {capstones.length} yêu cầu chờ duyệt
                    </span>
                </div>
            </div>

            {/* Main content table */}
            {capstones.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm max-w-xl mx-auto mt-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Không có yêu cầu nào</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">Hiện tại chưa có sinh viên nào gửi yêu cầu xin hủy đồ án.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                                    <th className="px-4 py-3.5 w-[45%]">Đề tài & Mô tả</th>
                                    <th className="px-4 py-3.5 w-[20%]">Sinh viên</th>
                                    <th className="px-4 py-3.5 w-[15%] text-center">Trạng thái hiện tại</th>
                                    <th className="px-4 py-3.5 w-[20%] text-center">Thao tác duyệt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-gray-700 text-xs">
                                {capstones.map((capstone) => (
                                    <tr key={capstone.capstone_id} className="hover:bg-slate-50/50 transition-colors align-middle">
                                        {/* Column 1: Topic Info */}
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">
                                                    {capstone.topic?.title || 'Chưa đăng ký đề tài'}
                                                </span>
                                                <span className="text-[10px] text-gray-400 line-clamp-2">
                                                    Mô tả: {capstone.topic?.description || '---'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Column 2: Student */}
                                        <td className="px-4 py-3 font-semibold text-gray-800">
                                            <div className="flex flex-col">
                                                <span>{capstone.student?.fullname || '---'}</span>
                                                <span className="font-mono text-[10px] text-gray-400 mt-0.5">#{capstone.student?.user?.usercode || '---'}</span>
                                            </div>
                                        </td>

                                        {/* Column 3: Status Badge */}
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold bg-red-50 text-red-600 border border-red-100 animate-pulse">
                                                {capstone.status}
                                            </span>
                                        </td>

                                        {/* Column 4: Actions */}
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleProcessCancel(capstone.capstone_id, true)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm flex items-center gap-1"
                                                >
                                                    Đồng ý hủy
                                                </button>
                                                <button
                                                    onClick={() => handleProcessCancel(capstone.capstone_id, false)}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-gray-200/50 shadow-sm flex items-center gap-1"
                                                >
                                                    Từ chối
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
        </div>
    )
}