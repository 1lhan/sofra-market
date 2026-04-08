import Elysia from "elysia";
import { createCampaignSchema, updateCampaignSchema } from "./campaign.schema";
import { createCampaign, deleteCampaign, getAdminCampaigns, getCampaignForUpdate, getPublicCampaignDetail, getPublicCampaigns, updateCampaign } from "./campaign.service";

export const adminCampaignRoutes = new Elysia({ prefix: "/admin/campaigns" })
    // .onBeforeHandle(async () => {
    //     await authorizeUser(["ADMIN"])
    // })
    .get(
        "/",
        async ({ query }) => {
            const data = await getAdminCampaigns(query.page, 10)
            return { success: true, data }
        }
    )
    .post(
        "/",
        async ({ body }) => {
            await createCampaign(body)
            return { success: true }
        },
        { body: createCampaignSchema }
    )
    .get(
        "/:id/edit",
        async ({ params: { id } }) => {
            const data = await getCampaignForUpdate(id)
            return { success: true, data }
        }
    )
    .put(
        "/:id",
        async ({ params: { id }, body }) => {
            await updateCampaign(id, body)
            return { success: true }
        },
        { body: updateCampaignSchema }
    )
    .delete(
        "/:id",
        async ({ params: { id } }) => {
            await deleteCampaign(id)
            return { success: true }
        }
    )

export const publicCampaignRoutes = new Elysia({ prefix: "/campaigns" })
    .get(
        "/",
        async () => {
            const data = await getPublicCampaigns()
            return { success: true, data }
        }
    )
    .get(
        "/:id",
        async ({ params: { id } }) => {
            const data = await getPublicCampaignDetail(id)
            return { success: true, data }
        }
    )