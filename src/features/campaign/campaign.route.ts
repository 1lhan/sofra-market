import { auth } from "@/lib/auth";
import { AppError } from "@/lib/server/errors";
import Elysia, { t } from "elysia";
import { headers } from "next/headers";
import { createCampaignSchema, updateCampaignSchema } from "./campaign.schema";
import { createCampaign, deleteCampaign, getAdminCampaigns, getCampaignForUpdate, updateCampaign } from "./campaign.service";

export const adminCampaignRoutes = new Elysia({ prefix: "/admin/campaigns" })
    .derive(async () => {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user.roles.includes("ADMIN")) throw new AppError("UNAUTHORIZED", 401)
    })
    .get(
        "/",
        async ({ query }) => {
            const data = await getAdminCampaigns(query.page, 10)
            return { success: true, data }
        },
        { query: t.Object({ page: t.Optional(t.Numeric()) }) }
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