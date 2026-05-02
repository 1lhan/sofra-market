import { authClient } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"

export function useUser() {
    const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const { data } = await authClient.getSession()
            return data?.user ?? null
        },
        staleTime: 1000 * 60 * 5
    })

    return { user, isUserLoading, userError }
}