import Elysia from "elysia";
import { createBlogSchema, updateBlogSchema } from "./blog.schema";
import { createBlog, deleteBlog, getAdminBlogs, getBlogForUpdate, getPublicBlogDetail, getPublicBlogs, updateBlog } from "./blog.service";

export const adminBlogRoutes = new Elysia({ prefix: "/admin/blogs" })
    // .onBeforeHandle(async () => {
    //     await authorizeUser(["ADMIN"])
    // })
    .get(
        "/",
        async ({ query }) => {
            const data = await getAdminBlogs(query.page, 10)
            return { success: true, data }
        }
    )
    .post(
        "/",
        async ({ body }) => {
            await createBlog(body)
            return { success: true }
        },
        { body: createBlogSchema }
    )
    .get(
        "/:id/edit",
        async ({ params: { id } }) => {
            const data = await getBlogForUpdate(id)
            return { success: true, data }
        }
    )
    .put(
        "/:id",
        async ({ params: { id }, body }) => {
            await updateBlog(id, body)
            return { success: true }
        },
        { body: updateBlogSchema }
    )
    .delete(
        "/:id",
        async ({ params: { id } }) => {
            await deleteBlog(id)
            return { success: true }
        }
    )

export const publicBlogRoutes = new Elysia({ prefix: "/blogs" })
    .get(
        "/",
        async () => {
            const data = await getPublicBlogs()
            return { success: true, data }
        }
    )
    .get(
        "/:id",
        async ({ params: { id } }) => {
            const data = await getPublicBlogDetail(id)
            return { success: true, data }
        }
    )