
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
  CANCEL_REQUESTED = 'CANCEL_REQUESTED',
  CANCEL = 'CANCEL',

}

export enum CapstoneRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface GetCapstonesQueryDto {
  status?: CapstoneStatus;   // Lọc theo trạng thái
  lecturer_id?: string;      // Lọc theo giảng viên hướng dẫn
  page?: number;             // Phân trang
  limit?: number;            // Số lượng trên 1 trang
}

export interface GetCapstoneRequestQueryDto {
  status?: CapstoneRequestStatus;
  target_id?: string;
  request_type?: string;
  page?: number;
  limit?: number;
}

export interface GetCapstonesRequestUpdateDto {
  status: CapstoneRequestStatus;
  feedback?: string;
}

export interface Submission {
  submission_id: string;
  milestone_id: string;
  file_path: string | null;
  student_note: string | null;
  grade: number | null;
  lecturer_note: string | null;
  status: 'PENDING' | 'PASSED' | 'FAILED';
}

export interface Capstone {
  capstone_id: string;
  status: string;
  topic_id?: string | null;
  lecturer_id?: string | null;
  topic?: {
    title: string;
    expertise?: {
      name: string;
    };
  } | null;
  lecturer?: {
    fullname: string;
  } | null;
  submission: Submission[];
  requests?: any[];
  council?: {
    name: string;
    members?: Array<{
      lecturer?: {
        fullname: string;
      } | null;
    }> | null;
  } | null;
  instructor_grade?: number | null;
  council_grade?: number | null;
}

export interface GetCapstoneRequestDto {
  request_id: string;
  request_type: string;
  status: CapstoneRequestStatus;
  target_id: string;
  topic_title?: string | null;
  topic_description?: string[] | null;
  topic_technologies?: string[] | null;
  feedback?: string | null;
  message?: string | null;
  file_path?: string | null;
  created_at: string;
  updated_at: string;
  student: {
    user_id: string;
    student_code: string;
    name: string;
    email: string;
    class_name: string;
  };
}