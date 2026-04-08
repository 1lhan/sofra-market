import { authorizeUser } from "@/lib/session";
import Elysia from "elysia";
import { createAddressSchema, updateAddressSchema } from "./address.schema";
import { createAddress, deleteAddress, getUserAddresses, updateAddress } from "./address.service";

export const authenticatedAddressRoutes = new Elysia({ prefix: "/addresses" })
    .derive(async () => {
        const userId = await authorizeUser()
        return { userId }
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