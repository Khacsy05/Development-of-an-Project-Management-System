"use client"
import { useAuthStore } from '@/store/useAuthStore';

const page = () => {
    const userName = useAuthStore((state) => state.userName)
    return (
        <div>Chào bạn, {userName}</div>
    )
}

export default page