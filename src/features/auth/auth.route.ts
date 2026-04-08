import { refreshAccessToken } from "@/lib/session";
import Elysia from "elysia";
import { loginSchema, registerSchema } from "./auth.schema";
import { getCurrentUser, login, logout, logoutFromAllDevices, register } from "./auth.service";

export const authRoutes = new Elysia({ prefix: "/auth" })
    .get(
        "/me",
        async () => {
            return { data: await getCurrentUser() }
        }
    )
    .post(
        "/register",
        async ({ body }) => {
            await register(body)
            return { success: true, message: "Account created successfully" }
        },
        { body: registerSchema }
    )
    .post(
        "/login",
        async ({ body }) => {
            const data = await login(body)
            return { success: true, data }
        },
        { body: loginSchema }
    )
    .post(
        "/logout",
        async () => {
            await logout()
            return { success: true, message: "Logged out successfully" }
        }
    )
    .post(
        "/logout-from-all-devices",
        async () => {
            await logoutFromAllDevices()
            return { success: true, message: "Logged out from all devices" }
        }
    )
    .post(
        "/refresh",
        async () => {
            await refreshAccessToken()
            return { success: true }
        }
    )