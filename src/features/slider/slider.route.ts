import Elysia from "elysia";
import { createSliderSchema, updateSliderSchema } from "./slider.schema";
import { createSlider, deleteSlider, getAdminSliders, getPublicSliders, updateSlider } from "./slider.service";

export const adminSliderRoutes = new Elysia({ prefix: "/admin/sliders" })
    // .onBeforeHandle(async () => {
    //     await authorizeUser(["ADMIN"])
    // })
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

export const publicSliderRoutes = new Elysia({ prefix: "/sliders" })
    .get(
        "/",
        async () => {
            const data = await getPublicSliders()
            return { success: true, data }
        }
    )