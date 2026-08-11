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
    student?: {
        class_id?: string | null;
        class?: {
            class_id: string;
            class_name: string;
        } | null;
    } | null;
}

export interface UserCreatePayload {
    username: string;
    password?: string;
    fullname: string;
    email: string;
    usercode: string;
    gender?: string;
    phone_number?: string;
    role_id: string;
    faculty_id?: string | null;
    class_id?: string;
}

export interface UserUpdatePayload {
    fullname?: string;
    email?: string;
    gender?: string;
    phone_number?: string;
    role_id?: string;
    faculty_id?: string | null;
    class_id?: string;
    is_active?: boolean;
}

export interface UserQuery {
    role?: string;
    fullname?: string;
    page?: number;
    limit?: number;
}

export interface UserResponse {
    data: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}