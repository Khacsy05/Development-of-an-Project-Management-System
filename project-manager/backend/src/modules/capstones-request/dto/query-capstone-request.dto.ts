import { CapstoneStatus } from "@prisma/client"

export class CapstoneRequestQuery {
    status?: CapstoneStatus
    target_id?: number
    request_type?: 'REGISTER_LECTURER' | 'REGISTER_TOPIC'
    page?: number
    limit?: number
}