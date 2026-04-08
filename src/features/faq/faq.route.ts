import Elysia from "elysia";
import { createFaqSchema, updateFaqSchema } from "./faq.schema";
import { createFaq, deleteFaq, getAdminFaqs, getPublicFaqs, updateFaq } from "./faq.service";

export const adminFaqRoutes = new Elysia({ prefix: "/admin/faqs" })
    // .onBeforeHandle(async () => {
    //     await authorizeUser(["ADMIN"])
    // })
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

export const publicFaqRoutes = new Elysia({ prefix: "/faqs" })
    .get(
        "/",
        async () => {
            const data = await getPublicFaqs()
            return { success: true, data }
        }
    )