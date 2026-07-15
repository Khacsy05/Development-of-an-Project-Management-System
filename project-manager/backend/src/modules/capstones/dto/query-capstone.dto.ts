import { CapstoneStatus } from "@prisma/client"

export class CapstoneQuery{
    status? :CapstoneStatus
    page? : number
    limit? : number
}