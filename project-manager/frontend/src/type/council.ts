export enum CouncilPosition {
    CHAIRMAN = 'CHAIRMAN',
    SECRETARY = 'SECRETARY',
    MEMBER = 'MEMBER',
}

export interface GetCouncilEvaluationsQueryDto {
    lecturer_id?: string;      // Lọc theo giảng viên hướng dẫn
    page?: number;             // Phân trang
    limit?: number;            // Số lượng trên 1 trang
}

export interface GetCouncilMembersQueryDto {
    lecturer_id?: string;
    council_id?: string;
    page?: number;
    limit?: number;
}

export interface assignCouncilMembersDto {
    council_id: string;
    members: Array<{
        lecturer_id: string;
        position: CouncilPosition;
    }>;
}