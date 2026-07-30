import { CapstoneStatus } from "@prisma/client"

export class CapstoneQuery {
    status?: CapstoneStatus
    lecturer_id?: string
    page?: number
    limit?: number
}