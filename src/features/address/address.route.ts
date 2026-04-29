import { auth } from "@/lib/auth";
import { AppError } from "@/lib/server/errors";
import Elysia from "elysia";
import { headers } from "next/headers";
import { createAddressSchema, updateAddressSchema } from "./address.schema";
import { createAddress, deleteAddress, getUserAddresses, setDefaultAddress, updateAddress } from "./address.service";

export const authenticatedAddressRoutes = new Elysia({ prefix: "/addresses" })
    .derive(async () => {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session) throw new AppError("UNAUTHORIZED", 401)
        return { userId: session.user.id }
    })
    .get(
        "/",
        async ({ userId }) => {
            const data = await getUserAddresses(userId)
            return { success: true, data }
        }
    )
    .post(
        "/",
        async ({ body, userId }) => {
            await createAddress(body, userId)
            return { success: true }
        },
        { body: createAddressSchema }
    )
    .put(
        "/:addressId",
        async ({ params: { addressId }, body, userId }) => {
            const data = await updateAddress(addressId, body, userId)
            return { success: true, data }
        },
        { body: updateAddressSchema }
    )
    .delete(
        "/:addressId",
        async ({ params: { addressId }, userId }) => {
            await deleteAddress(addressId, userId)
            return { success: true }
        }
    )
    .patch(
        "/:addressId/default",
        async ({ params: { addressId }, userId }) => {
            await setDefaultAddress(addressId, userId)
            return { success: true }
        }
    )