import { User } from './user';

export interface CreateFacultyDto {
    faculty_code: string;
    name: string;
    dean_id?: string | null;
}

export interface Faculty {
    faculty_id: string;
    faculty_code: string;
    name: string;
    dean_id: string | null;
    created_at?: string;
    updated_at?: string;
    dean?: User;
}
