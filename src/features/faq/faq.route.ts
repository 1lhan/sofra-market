import { auth } from "@/lib/auth";
import { AppError } from "@/lib/server/errors";
import Elysia from "elysia";
import { headers } from "next/headers";
import { createFaqSchema, updateFaqSchema } from "./faq.schema";
import { createFaq, deleteFaq, getAdminFaqs, updateFaq } from "./faq.service";

export const adminFaqRoutes = new Elysia({ prefix: "/admin/faqs" })
    .derive(async () => {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user.roles.includes("ADMIN")) throw new AppError("UNAUTHORIZED", 401)
    })
    .get(
        "/",
        async () => {
            const data = await getAdminFaqs()
            return { success: true, data }
        }
    )
    .post(
        "/",
        async ({ body }) => {
            await createFaq(body)
            return { success: true }
        },
        { body: createFaqSchema }
    )
    .put(
        "/:id",
        async ({ params: { id }, body }) => {
            await updateFaq(id, body)
            return { success: true }
        },
        { body: updateFaqSchema }
    )
    .delete(
        "/:id",
        async ({ params: { id } }) => {
            await deleteFaq(id)
            return { success: true }
        }
    )