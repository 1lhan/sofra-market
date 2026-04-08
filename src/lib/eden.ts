import { App } from '@/app/api/[[...slug]]/route'
import { treaty } from '@elysiajs/eden'

export const api = treaty<App>(`${process.env.NEXT_PUBLIC_API_URL}`).api