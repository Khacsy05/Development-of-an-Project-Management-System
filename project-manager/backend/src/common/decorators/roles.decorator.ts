import { SetMetadata } from '@nestjs/common';

// Key dùng để định danh nhãn metadata này trong hệ thống
export const ROLES_KEY = 'roles';

// Decorator nhận vào danh sách các quyền (ví dụ: 'ADMIN', 'LECTURER')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);