import { Faculty } from './faculty';

export interface CreateMajorDto {
    major_name: string;
    faculty_id: string;
}

export interface Major {
    major_id: string;
    major_name: string;
    faculty_id: string;
    faculty?: Faculty;
    created_at?: string;
    updated_at?: string;
}
