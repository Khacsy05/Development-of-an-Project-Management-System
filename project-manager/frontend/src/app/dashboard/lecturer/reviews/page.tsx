"use client"

import { updateCouncilEvaluation, getCouncilEvaluations } from '@/services/council.service'
import { useAuthStore } from '@/store/useAuthStore'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useCacheStore } from '@/store/useCacheStore'

const Page = () => {
    const { reviews, setReviews } = useCacheStore()
    const [councilEvaluation, setCouncilEvaluation] = useState<any[]>(reviews || [])
    const [isLoading, setIsLoading] = useState(!reviews)
    const userId = useAuthStore((state) => state.userId)
    const isInitializing = useAuthStore((state) => state.isInitializing)

    // States cho modal nhập điểm
    const [selectedEval, setSelectedEval] = useState<any | null>(null)
    const [grade, setGrade] = useState<string>('')
    const [lecturerNote, setLecturerNote] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchCouncilEvaluation = async () => {
        try {
            if (!userId) return
            if (!reviews) {
                setIsLoading(true)
            }
            const res = await getCouncilEvaluations({ lecturer_id: userId, limit: 100 })
            const data = Array.isArray(res) ? res : (res?.data || []);
            setCouncilEvaluation(data)
            setReviews(data)
        } catch (error) {
            console.error('Error fetching council evaluation:', error)
            toast.error('Không thể tải danh sách chấm điểm hội đồng.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!isInitializing) {
            if (userId) {
                fetchCouncilEvaluation()
            } else {
                setIsLoading(false)
            }
        }
    }, [userId, isInitializing])

    const handleOpenGradeModal = (evalRecord: any) => {
        setSelectedEval(evalRecord)
        setGrade(evalRecord.grade !== null && evalRecord.grade !== undefined ? String(evalRecord.grade) : '')
        setLecturerNote(evalRecord.lecturer_note || '')
    }

    const handleSaveReview = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedEval) return

        const gradeNum = parseFloat(grade)
        if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10) {
            toast.error('Điểm số phải là một số hợp lệ từ 0 đến 10.')
            return
        }

        setIsSubmitting(true)
        try {
            await updateCouncilEvaluation(selectedEval.evalution_id, {
                grade: gradeNum,
                lecturer_note: lecturerNote
            })
            toast.success('Lưu điểm hội đồng thành công!')
            setSelectedEval(null)
            fetchCouncilEvaluation()
        } catch (error: any) {
            const backendMessage = error.response?.data?.message || 'Có lỗi xảy ra khi chấm điểm';
            toast.error(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage);
        } finally {
            setIsSubmitting(false)
        }
    }

    const myEvaluations = councilEvaluation.filter(
        (item: any) => String(item.members_id) === String(userId)
    );

    if (isLoading || !userId) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-[#3b4c80] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-semibold">Đang tải danh sách đồ án...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto p-2">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Đánh giá & Chấm điểm Hội đồng</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Nhập điểm số và nhận xét phản biện cho sinh viên bảo vệ trước hội đồng khoa.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#3b4c80] border border-blue-100">
                        {myEvaluations.length} đồ án cần đánh giá
                    </span>
                </div>
            </div>

            {/* Main content table */}
            {myEvaluations.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm max-w-xl mx-auto mt-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Không nằm trong hội đồng</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">Bạn không được phân công chấm điểm cho bất kỳ đồ án nào thuộc hội đồng bảo vệ đợt này.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                                    <th className="px-4 py-3.5 w-[38%]">Đề tài & Mô tả</th>
                                    <th className="px-4 py-3.5 w-[18%]">Sinh viên</th>
                                    <th className="px-4 py-3.5 w-[18%]">Hội đồng bảo vệ</th>
                                    <th className="px-4 py-3.5 w-[10%] text-center">Điểm số</th>
                                    <th className="px-4 py-3.5 w-[10%] text-center">Hạn nộp</th>
                                    <th className="px-4 py-3.5 w-[16%]">Ghi chú phản biện</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-gray-700 text-xs">
                                {myEvaluations.map((item: any) => {
                                    const hasGraded = item.grade !== null && item.grade !== undefined;
                                    return (
                                        <tr key={item.evalution_id} className="hover:bg-slate-50/50 transition-colors align-middle">
                                            {/* Column 1: Topic details */}
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">
                                                        {item.capstone?.topic?.title || 'Chưa đăng ký đề tài'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 line-clamp-1">
                                                        Mô tả: {item.capstone?.topic?.description || '---'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                                                        Công nghệ: <span className="font-medium text-gray-500">{item.capstone?.topic?.technologies || '---'}</span>
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Column 2: Student details */}
                                            <td className="px-4 py-3 font-semibold text-gray-800">
                                                <div className="flex flex-col">
                                                    <span>{item.capstone?.student?.fullname || '---'}</span>
                                                    <span className="font-mono text-[10px] text-gray-400 mt-0.5">#{item.capstone?.student?.usercode || '---'}</span>
                                                </div>
                                            </td>

                                            {/* Column 3: Council details */}
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-gray-800">{item.council?.name || '---'}</span>
                                                    <span className="text-[10px] text-gray-400">Phòng: {item.council?.rooms} - {item.council?.buildings}</span>
                                                </div>
                                            </td>

                                            {/* Column 4: Grade */}
                                            <td className="px-4 py-3 text-center">
                                                {hasGraded ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                                        {item.grade}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                                        Chờ chấm
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-center align-middle">
                                                <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                    {item.capstone?.council?.end_date
                                                        ? new Date(item.capstone.council.end_date).toLocaleDateString('vi-VN')
                                                        : '--/--/----'}
                                                </span>
                                            </td>


                                            {/* Column 5: Note & Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-2">
                                                    {item.lecturer_note ? (
                                                        <span className="text-gray-500 italic line-clamp-2 hover:line-clamp-none transition-all cursor-default leading-snug">
                                                            {item.lecturer_note}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Chưa có nhận xét</span>
                                                    )}
                                                    <button
                                                        onClick={() => handleOpenGradeModal(item)}
                                                        className="inline-flex items-center justify-center gap-1 py-1.5 px-3 bg-blue-50 hover:bg-[#3b4c80] text-[#3b4c80] hover:text-white rounded-lg font-bold border border-blue-100/50 hover:border-transparent transition-all shadow-sm max-w-[90px]"
                                                    >
                                                        {hasGraded ? 'Sửa điểm' : 'Nhập điểm'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* GRADE MODAL */}
            {selectedEval && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <form
                        onSubmit={handleSaveReview}
                        className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full border border-gray-100 flex flex-col animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div className="bg-[#3b4c80] p-6 text-white flex justify-between items-center">
                            <div>
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100/20 text-white">
                                    HỘI ĐỒNG CHẤM ĐIỂM
                                </span>
                                <h3 className="text-lg font-bold mt-1 line-clamp-1">
                                    {selectedEval.capstone?.topic?.title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedEval(null)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all focus:outline-none"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 flex flex-col gap-5">
                            {/* Nhập điểm */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Điểm số bảo vệ (Thang điểm 10)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="10"
                                    required
                                    placeholder="Ví dụ: 8.5"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white placeholder-gray-400 font-semibold text-gray-800"
                                />
                            </div>

                            {/* Ô Nhận xét */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Lời nhận xét / Ghi chú phản biện
                                </label>
                                <textarea
                                    placeholder="Viết đánh giá phản biện hoặc nhận xét chi tiết..."
                                    value={lecturerNote}
                                    onChange={(e) => setLecturerNote(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white placeholder-gray-400 font-medium text-gray-800"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedEval(null)}
                                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2 bg-[#2e7d32] hover:bg-[#205723] text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Đang lưu...' : 'Lưu điểm'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

export default Page;