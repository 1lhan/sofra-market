import { auth } from "@/lib/auth";
import { AppError } from "@/lib/server/errors";
import Elysia from "elysia";
import { headers } from "next/headers";
import { createSliderSchema, updateSliderSchema } from "./slider.schema";
import { createSlider, deleteSlider, getAdminSliders, updateSlider } from "./slider.service";

export const adminSliderRoutes = new Elysia({ prefix: "/admin/sliders" })
    .derive(async () => {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user.roles.includes("ADMIN")) throw new AppError("UNAUTHORIZED", 401)
    })
    .get(
        "/",
        async () => {
            const data = await getAdminSliders()
            return { success: true, data }
        }
    )
    .post(
        "/",
        async ({ body }) => {
            await createSlider(body)
            return { success: true }
        },
        { body: createSliderSchema }
    )
    .put(
        "/:id",
        async ({ params: { id }, body }) => {
            await updateSlider(id, body)
            return { success: true }
        },
        { body: updateSliderSchema }
    )
    .delete(
        "/:id",
        async ({ params: { id } }) => {
            await deleteSlider(id)
            return { success: true }
        }
    )