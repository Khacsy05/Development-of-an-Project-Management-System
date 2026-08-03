export interface GetCouncilEvaluationsQueryDto {
    lecturer_id?: string;      // Lọc theo giảng viên hướng dẫn
    page?: number;             // Phân trang
    limit?: number;            // Số lượng trên 1 trang
}
