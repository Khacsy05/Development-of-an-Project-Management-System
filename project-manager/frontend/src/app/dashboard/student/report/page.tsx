"use client"

import React, { useEffect, useState } from 'react';
import { getCapstoneByUser, updateCapstoneSubmission } from '@/services/capstone.service';
import { getMilestoneList } from '@/services/milestone.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useCapstoneStore } from '@/store/useCapstoneStore';
import { toast } from 'sonner';
import { Capstone, Submission } from '@/type/capstone';
import { Milestone } from '@/type/milestone';


export default function ReportPage() {
  const { capstone, fetchCapstone, milestones, fetchMilestones } = useCapstoneStore();
  // Khởi tạo là false nếu đã có sẵn dữ liệu trong bộ nhớ cache
  const [isLoading, setIsLoading] = useState(!capstone || milestones.length === 0);
  const userId = useAuthStore((state) => state.userId);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  // States cho modal nộp bài
  const [activeSubmitMilestone, setActiveSubmitMilestone] = useState<Milestone | null>(null);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [studentNote, setStudentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States cho modal xem chi tiết
  const [activeDetailMilestone, setActiveDetailMilestone] = useState<Milestone | null>(null);
  const [activeDetailSubmission, setActiveDetailSubmission] = useState<Submission | null>(null);

  const fetchData = async () => {
    if (!userId) return;
    try {
      if (!capstone || milestones.length === 0) {
        setIsLoading(true);
      }
      await Promise.all([
        fetchCapstone(userId),
        fetchMilestones()
      ]);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu báo cáo:', error);
      toast.error('Không thể tải dữ liệu báo cáo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitializing && userId) {
      fetchData();
    }
  }, [userId, isInitializing]);

  const formatDate = (dateStr: string | Date) => {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const getStartDate = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const startDate = new Date(deadline.getTime() - 3 * 24 * 60 * 60 * 1000);
    startDate.setHours(10, 0, 0, 0);
    return startDate;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 10MB');
        e.target.value = '';
        return;
      }
      setSubmitFile(file);
    }
  };

  const handleUploadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmissionId) return;
    if (!submitFile) {
      toast.error('Vui lòng chọn file báo cáo trước khi nộp');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', submitFile);
      formData.append('student_note', studentNote);

      await updateCapstoneSubmission(activeSubmissionId, formData as any);
      toast.success('Nộp báo cáo thành công!');
      setActiveSubmitMilestone(null);
      setSubmitFile(null);
      setStudentNote('');
      fetchData();
    } catch (error: any) {
      console.error('Lỗi khi nộp báo cáo:', error);
      const errorMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi nộp báo cáo';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Lấy ra milestone đầu tiên chưa hoàn thành làm mốc hoạt động hiển thị ở Banner phụ
  const activeMilestone = milestones.find((m) => {
    const sub = capstone?.submission?.find((s) => String(s.milestone_id) === String(m.milestone_id));
    return !sub || sub.status !== 'PASSED';
  }) || milestones[0];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto animate-fadeIn">
      {/* TIÊU ĐỀ CHÍNH */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">
          Báo cáo đồ án
        </h1>
      </div>

      {/* 1. KHỐI THÔNG TIN ĐỀ TÀI */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#5865f2] px-6 py-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Thông tin đề tài
          </h2>
        </div>
        <div className="p-6 flex flex-col gap-4 text-sm text-gray-700">
          <div>
            <span className="font-semibold text-gray-500 w-44 inline-block">Tên đề tài:</span>
            <span className="font-bold text-gray-900">{capstone?.topic?.title || 'Chưa đăng ký đề tài'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 w-44 inline-block">Lĩnh vực:</span>
            <span className="font-semibold text-gray-800">{capstone?.topic?.expertise?.name || 'Chưa cập nhật'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 w-44 inline-block">Giảng viên hướng dẫn:</span>
            <span className="font-bold text-[#2e7d32]">{capstone?.lecturer?.fullname || 'Chưa phân công'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 w-44 inline-block">Giảng viên phản biện:</span>
            <span className="font-medium text-gray-800">
              {capstone?.council?.members && capstone.council.members.length > 0
                ? capstone.council.members.map((m) => m.lecturer?.fullname).filter(Boolean).join(' / ')
                : 'Chưa phân công'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 w-44 inline-block">Hội đồng bảo vệ:</span>
            <span className="font-semibold text-gray-900">{capstone?.council?.name || 'Chưa phân công'}</span>
          </div>
        </div>
      </div>

      {/* 2. KHỐI NỘP BÁO CÁO ĐỒ ÁN */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col gap-6">

        {/* Header khối nộp báo cáo & hiển thị hạn của mốc hiện tại */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <h2 className="text-lg font-bold text-gray-800 uppercase flex items-center gap-2">
            <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
            Nộp báo cáo đồ án
          </h2>
          {activeMilestone && (
            <div className="text-right text-xs text-gray-500 font-semibold bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
              <div>Ngày bắt đầu: <span className="text-gray-900">{formatDate(getStartDate(activeMilestone.deadline))}</span></div>
              <div className="mt-1">Ngày kết thúc: <span className="text-red-600">{formatDate(activeMilestone.deadline)}</span></div>
            </div>
          )}
        </div>

        {/* Bảng báo cáo */}
        <div className="overflow-x-auto border border-gray-100 rounded-2xl">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-bold">
                <th className="px-6 py-4">Báo cáo</th>
                <th className="px-6 py-4">Thời hạn nộp</th>
                <th className="px-6 py-4">Hạn chót</th>
                <th className="px-6 py-4 w-32">Trạng thái</th>
                <th className="px-6 py-4 text-center w-52">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {milestones.map((milestone, index) => {
                const submission = capstone?.submission?.find(
                  (s) => String(s.milestone_id) === String(milestone.milestone_id)
                );

                const startDate = getStartDate(milestone.deadline);
                const deadlineDate = new Date(milestone.deadline);
                const now = new Date();

                // Kiểm tra mốc trước đã được chấm Đạt (PASSED) hay chưa
                let isPreviousPassed = true;
                if (index > 0) {
                  const prevMilestone = milestones[index - 1];
                  const prevSubmission = capstone?.submission?.find(
                    (s) => String(s.milestone_id) === String(prevMilestone.milestone_id)
                  );
                  isPreviousPassed = !!(prevSubmission && prevSubmission.status === 'PASSED');
                }

                // Xác định trạng thái nộp bài
                let statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    Chưa nộp
                  </span>
                );

                if (submission) {
                  if (submission.status === 'PASSED') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        Đã hoàn thành
                      </span>
                    );
                  } else if (submission.status === 'FAILED') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Không đạt
                      </span>
                    );
                  } else if (submission.file_path) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Chờ duyệt
                      </span>
                    );
                  }
                }

                // Điều kiện kích hoạt nút nộp bài
                const isInSubmitPeriod = now >= startDate && now <= deadlineDate;
                const isDeadlinePassed = now > deadlineDate;
                const isDoing = capstone?.status === 'DOING';

                return (
                  <tr key={milestone.milestone_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{milestone.phase_name}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(startDate)}</td>
                    <td className="px-6 py-4 text-red-600 font-bold">{formatDate(milestone.deadline)}</td>
                    <td className="px-6 py-4">{statusBadge}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2.5">

                        {/* Nút Xem chi tiết */}
                        <button
                          onClick={() => {
                            setActiveDetailMilestone(milestone);
                            setActiveDetailSubmission(submission || null);
                          }}
                          disabled={!submission}
                          className="px-3 py-1.5 bg-[#5865f2] hover:bg-[#4652c7] text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Xem chi tiết
                        </button>

                        {/* Nút Nộp */}
                        <div className="relative group">
                          {isDeadlinePassed && (!submission || submission.status !== 'PASSED') && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              Đã quá hạn
                            </span>
                          )}
                          {!isPreviousPassed && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              Chờ mốc trước Đạt
                            </span>
                          )}
                          {!isDoing && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              Đồ án không ở trạng thái thực hiện
                            </span>
                          )}
                          <button
                            onClick={() => {
                              if (submission) {
                                setActiveSubmitMilestone(milestone);
                                setActiveSubmissionId(submission.submission_id);
                                setStudentNote(submission.student_note || '');
                              }
                            }}
                            disabled={!submission || submission.status === 'PASSED' || isDeadlinePassed || !isPreviousPassed || !isDoing}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${submission && submission.status !== 'PASSED' && !isDeadlinePassed && isPreviousPassed && isDoing
                              ? 'bg-[#2e7d32] hover:bg-[#205723] text-white shadow-sm'
                              : 'bg-gray-400 text-gray-100 cursor-not-allowed'
                              }`}
                          >
                            Nộp
                          </button>
                        </div>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MODAL NỘP BÁO CÁO */}
      {activeSubmitMilestone && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <form
            onSubmit={handleUploadReport}
            className="bg-[#f7f8fc] rounded-[32px] shadow-2xl overflow-hidden max-w-lg w-full border border-gray-100 flex flex-col"
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between bg-[#5865f2] text-white">
              <h3 className="text-[16px] font-bold uppercase tracking-wider pl-8 py-5">
                Nộp báo cáo đồ án
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActiveSubmitMilestone(null);
                  setSubmitFile(null);
                  setStudentNote('');
                }}
                className="w-16 h-16 flex items-center justify-center bg-red-600 hover:bg-red-700 transition-colors font-bold text-2xl text-white"
              >
                &times;
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-8 flex flex-col gap-6">

              <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm">
                <h4 className="text-[10px] font-bold text-[#8d9299] tracking-wider uppercase mb-1">
                  Báo cáo / Giai đoạn
                </h4>
                <p className="text-sm font-bold text-gray-900">{activeSubmitMilestone.phase_name}</p>

                <h4 className="text-[10px] font-bold text-[#8d9299] tracking-wider uppercase mt-4 mb-1">
                  Hạn chót nộp bài
                </h4>
                <p className="text-sm font-bold text-red-600">{formatDate(activeSubmitMilestone.deadline)}</p>
              </div>

              {/* Tải lên file */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700">
                  Chọn file báo cáo (PDF, ZIP, RAR, tối đa 10MB):
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.zip,.rar"
                  required
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-200 rounded-xl p-2 bg-white"
                />
              </div>

              {/* Lời nhắn */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700">
                  Lời nhắn của sinh viên:
                </label>
                <textarea
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Nhập ghi chú hoặc lời nhắn gửi giảng viên..."
                  rows={3}
                  className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-sm text-gray-800 placeholder-gray-400"
                />
              </div>

            </div>

            {/* Footer Modal */}
            <div className="px-8 py-5 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveSubmitMilestone(null);
                  setSubmitFile(null);
                  setStudentNote('');
                }}
                className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-2xl font-bold text-xs text-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#2e7d32] hover:bg-[#205723] disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md transition-colors"
              >
                {isSubmitting ? 'Đang nộp...' : 'Nộp báo cáo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. MODAL XEM CHI TIẾT BÁO CÁO */}
      {activeDetailMilestone && activeDetailSubmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#f7f8fc] rounded-[32px] shadow-2xl overflow-hidden max-w-lg w-full border border-gray-100 flex flex-col">

            {/* Header Modal */}
            <div className="flex items-center justify-between bg-[#5865f2] text-white">
              <h3 className="text-[16px] font-bold uppercase tracking-wider pl-8 py-5">
                Chi tiết báo cáo đồ án
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActiveDetailMilestone(null);
                  setActiveDetailSubmission(null);
                }}
                className="w-16 h-16 flex items-center justify-center bg-red-600 hover:bg-red-700 transition-colors font-bold text-2xl text-white"
              >
                &times;
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-8 flex flex-col gap-5 overflow-y-auto max-h-[60vh]">

              <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col gap-4">
                <div>
                  <h4 className="text-[10px] font-bold text-[#8d9299] tracking-wider uppercase mb-0.5">Báo cáo / Giai đoạn</h4>
                  <p className="text-sm font-bold text-gray-900">{activeDetailMilestone.phase_name}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-[#8d9299] tracking-wider uppercase mb-0.5">Trạng thái</h4>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${activeDetailSubmission.status === 'PASSED'
                    ? 'bg-purple-50 text-purple-600 border border-purple-100'
                    : activeDetailSubmission.status === 'FAILED'
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                    {activeDetailSubmission.status === 'PASSED'
                      ? 'Đã hoàn thành'
                      : activeDetailSubmission.status === 'FAILED'
                        ? 'Không đạt'
                        : 'Chờ duyệt'}
                  </span>
                </div>
                {activeDetailSubmission.file_path && (
                  <div>
                    <h4 className="text-[10px] font-bold text-[#8d9299] tracking-wider uppercase mb-1">File đã nộp</h4>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${activeDetailSubmission.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl w-fit transition-colors border border-blue-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Tải file báo cáo về máy
                    </a>
                  </div>
                )}
                <div>
                  <h4 className="text-[10px] font-bold text-[#8d9299] tracking-wider uppercase mb-0.5">Lời nhắn của bạn</h4>
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100 whitespace-pre-wrap">
                    {activeDetailSubmission.student_note || 'Không có ghi chú.'}
                  </p>
                </div>
              </div>

              {/* Phần kết quả đánh giá của Giảng viên & Hội đồng */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-bold text-blue-600 border-b border-gray-100 pb-2 uppercase tracking-wide">
                  Đánh giá từ giảng viên & Hội đồng
                </h3>
                <div className="">


                  {/* Hiển thị Điểm Hội đồng nếu đây là đợt báo cáo cuối cùng */}
                  {milestones.length > 0 && activeDetailMilestone?.milestone_id === milestones[milestones.length - 1].milestone_id && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[10px] font-bold text-[#8d9299] tracking-wider uppercase mb-0.5">Điểm hướng dẫn</h4>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {activeDetailSubmission.grade !== null && activeDetailSubmission.grade !== undefined
                            ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#5865f2]/10 text-[#5865f2] border border-[#5865f2]/20">
                                {activeDetailSubmission.grade} / 10
                              </span>)
                            : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">
                                Chưa chấm điểm
                              </span>
                            )}
                        </p>
                      </div>

                      <div className="">
                        <h4 className="text-[10px] font-bold text-[#8d9299] tracking-wider uppercase mb-0.5">Điểm Hội đồng</h4>
                        {capstone?.council_grade !== null && capstone?.council_grade !== undefined ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#5865f2]/10 text-[#5865f2] border border-[#5865f2]/20">
                            Điểm Hội đồng: {capstone.council_grade} / 10
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">
                            Hội đồng đang chấm điểm...
                          </span>
                        )}

                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-[#8d9299] tracking-wider uppercase mb-0.5">Nhận xét của GVHD</h4>
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100 whitespace-pre-wrap">
                    {activeDetailSubmission.lecturer_note || 'Chưa có nhận xét nào.'}
                  </p>
                </div>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="px-8 py-5 bg-white border-t border-gray-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setActiveDetailMilestone(null);
                  setActiveDetailSubmission(null);
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-2xl font-bold text-xs transition-colors"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}