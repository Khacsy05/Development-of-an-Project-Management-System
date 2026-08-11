import { User } from './user';

export interface ClassQueryDto {
    class_name?: string;
    page?: number;
    limit?: number;
    faculty_id?: number;
}

export interface Major {
    major_id: string;
    major_name: string;
    faculty_id: string;
}

export interface Class {
    class_id: string;
    class_name: string;
    major_id: string;
    faculty_id: string | null;
    lecturer_id: string;
    created_at?: string;
    updated_at?: string;
    major?: Major;
    lecturer?: User;
}

export interface ClassCreatePayload {
    class_name: string;
    major_id: number;
    faculty_id?: number | null;
    lecturer_id: number;
}

export interface ClassUpdatePayload {
    class_name?: string;
    major_id?: number;
    faculty_id?: number | null;
    lecturer_id?: number;
}
