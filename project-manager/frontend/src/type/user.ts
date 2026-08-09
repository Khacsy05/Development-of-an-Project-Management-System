export interface User {
    user_id: string;
    usercode: string;
    username: string;
    fullname: string;
    email: string;
    gender: string | null;
    phone_number: string | null;
    is_active: boolean;
    faculty_id: string | null;
    role_id: string;
    role?: {
        role_id: string;
        role_name: string;
    };
}
