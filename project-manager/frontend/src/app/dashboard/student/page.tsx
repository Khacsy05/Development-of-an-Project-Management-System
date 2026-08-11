'use client'

import { createCapstone, updatedCapstone } from '@/services/capstone.service'
import { useAuthStore } from '@/store/useAuthStore'
import { useCapstoneStore } from '@/store/useCapstoneStore'
import React, { useEffect } from 'react'
import { toast } from 'sonner'

const studentPage = () => {
    const userId = useAuthStore((state) => state.userId);
    const isInitializing = useAuthStore((state) => state.isInitializing);
    const { capstone, isLoading, fetchCapstone, setCapstone } = useCapstoneStore();

    useEffect(() => {
        if (!isInitializing && userId) {
            fetchCapstone(userId);
        }
    }, [userId, isInitializing, fetchCapstone]);

    const handleRegisterCapstone = async () => {
        try {
            const res = await createCapstone()
            setCapstone(res)
            toast.success("Đăng ký đồ án thành công")
        } catch (error: any) {
            toast.error(error?.message)
        }
    }

    const handleCancelCapstone = async () => {
        if (!capstone?.capstone_id) {
            toast.error("Bạn chưa đăng ký đồ án nào!");
            return;
        }
        try {
            const res = await updatedCapstone(capstone.capstone_id, { status: 'CANCEL_REQUESTED' })
            setCapstone(res);
            toast.success("Gửi yêu cầu huỷ đồ án thành công!");
        } catch (error: any) {
            toast.error(error?.message || "Yêu cầu huỷ thất bại");
        }
    }

    if (isInitializing || (isLoading && !capstone)) {
        return (
            <div className="flex items-center justify-center min-h-[300px] p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className='flex gap-10 p-6'>
            {!capstone || capstone.status === 'CANCEL' ? (
                <div className="flex flex-col gap-4 w-full max-w-2xl bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-50 pb-3 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                        Đăng ký Đồ án Tốt nghiệp
                    </h2>
                    
                    {capstone?.status === 'CANCEL' ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium">
                            Đồ án trước đó của bạn đã bị hủy (ID: {capstone.capstone_id}). Bạn có thể đăng ký đề tài mới.
                        </div>
                    ) : (
                        <div className="p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 text-sm font-medium">
                            Bạn chưa đăng ký đồ án tốt nghiệp trong học kỳ này. Vui lòng nhấn nút đăng ký phía dưới để bắt đầu.
                        </div>
                    )}
                    
                    <button onClick={handleRegisterCapstone} className='cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all w-fit mt-2'>
                        Đăng ký đồ án
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-6 w-full max-w-2xl bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-50 pb-3 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                        Thông tin Đồ án hiện tại
                    </h2>

                    <div className="flex flex-col gap-4 text-sm text-gray-700">
                        <div>
                            <span className="font-semibold text-gray-500 w-44 inline-block">Mã đồ án:</span>
                            <strong className="text-gray-900">#{capstone.capstone_id}</strong>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-500 w-44 inline-block">Trạng thái:</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                {capstone.status}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-500 w-44 inline-block">Điểm hướng dẫn:</span>
                            <span className="font-bold text-gray-800">
                                {capstone.instructor_grade !== null && capstone.instructor_grade !== undefined
                                    ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#5865f2]/10 text-[#5865f2] border border-[#5865f2]/20">
                                            {capstone.instructor_grade} / 10
                                        </span>)
                                    : (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">
                                            Chưa chấm điểm
                                        </span>
                                    )}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-500 w-44 inline-block">Điểm Hội đồng:</span>
                            {capstone.council_grade !== null && capstone.council_grade !== undefined ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5865f2]/10 text-[#5865f2] border border-[#5865f2]/20">
                                    Điểm Hội đồng: {capstone.council_grade} / 10
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">
                                    Hội đồng đang chấm điểm...
                                </span>
                            )}
                        </div>
                        {capstone.instructor_grade !== null && capstone.instructor_grade !== undefined &&
                         capstone.council_grade !== null && capstone.council_grade !== undefined && (
                            <div>
                                <span className="font-semibold text-gray-500 w-44 inline-block">Điểm tổng kết (3-7):</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {(Number(capstone.instructor_grade) * 0.3 + Number(capstone.council_grade) * 0.7).toFixed(2)} / 10
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 border-t border-gray-50 pt-4 mt-2">
                        {capstone.status === 'CANCEL_REQUESTED' ? (
                            <div className="p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-sm font-medium">
                                Yêu cầu hủy đồ án đang chờ Khoa xét duyệt. Bạn không thể thực hiện thao tác khác lúc này.
                            </div>
                        ) : (
                            <button onClick={handleCancelCapstone} className='cursor-pointer bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all w-fit'>
                                Yêu cầu hủy đồ án
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default studentPage