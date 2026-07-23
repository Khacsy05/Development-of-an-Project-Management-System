export enum CapstoneStatus {
  PENDING = 'PENDING',
  PENDING_LECTURER = 'PENDING_LECTURER',   // Đang chờ Giảng viên hướng dẫn duyệt
  REJECTED_LECTURER = 'REJECTED_LECTURER', // Bị Giảng viên từ chối (Được chọn lại GV)
  PENDING_FACULTY = 'PENDING_FACULTY',     // Đang chờ Khoa duyệt đề tài
  REJECTED_FACULTY = 'REJECTED_FACULTY',   // Bị Khoa từ chối đề tài (Được chọn lại đề tài)
  DOING = 'DOING',                         // Khoa và GVHD đều đã duyệt -> Chính thức thực hiện
  SUBMITTED_FINAL = 'SUBMITTED_FINAL',     // Sinh viên đã nộp báo cáo cuối kỳ
  DEFENSE_ELIGIBLE = 'DEFENSE_ELIGIBLE',   // Đủ điều kiện ra hội đồng bảo vệ
  COMPLETED = 'COMPLETED',                 // Đã bảo vệ và có điểm cuối cùng
  FAILED = 'FAILED',                       // Bị trượt
}

export interface GetCapstonesQueryDto {
  status?: CapstoneStatus;   // Lọc theo trạng thái
  page?: number;             // Phân trang
  limit?: number;            // Số lượng trên 1 trang
}