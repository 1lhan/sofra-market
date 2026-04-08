import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/server/errors";
import { createSession, deleteSession, refreshAccessToken, verifyAccessToken } from "@/lib/session";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { UserContext, userContextSelect } from "../user/user.types";
import { LoginFormInput, RegisterFormInput } from "./auth.schema";

const passwordSaltRounds = Number(process.env.AUTH_PASSWORD_SALT_ROUNDS)

export async function register(data: RegisterFormInput): Promise<{ email: string }> {
    const { email, firstName, lastName, password, passwordConfirm } = data

    if (password !== passwordConfirm) throw new AppError("Passwords do not match", 400)

    const existingUser = await prisma.user.findFirst({
        where: { email },
        select: { email: true }
    })

    if (existingUser) throw new AppError("Email already exists", 400)

    const passwordHash = await bcrypt.hash(password, passwordSaltRounds)

    return await prisma.user.create({
        data: { email, firstName, lastName, passwordHash },
        select: { email: true }
    })
}

export async function login(data: LoginFormInput): Promise<UserContext> {
    const { email, password } = data

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            ...userContextSelect,
            passwordHash: true
        }
    })

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new AppError("Invalid credentials", 401)
    }

    await createSession(user.id, user.roles)

    const { passwordHash, ...rest } = user

    return rest
}

export async function logout(): Promise<void> {
    await deleteSession()
}

export async function logoutFromAllDevices(): Promise<void> {
    const cookieStore = await cookies()
    let accessToken = cookieStore.get("access_token")?.value
    let accessTokenPayload = await verifyAccessToken(accessToken)

    if (!accessTokenPayload) {
        accessToken = await refreshAccessToken()
        accessTokenPayload = await verifyAccessToken(accessToken)
    }

    if (!accessTokenPayload) {
        throw new AppError("UNAUTHORIZED", 401)
    }

    await prisma.refreshToken.deleteMany({
        where: { userId: accessTokenPayload.userId }
    })

    await deleteSession()
}

/**
 * Mevcut kimliği doğrulanmış kullanıcıyı al
 * Access token geçersizse refresh token ile yenile
 * Sadece layout dosyalarında çağrılır (API endpoint'lerinde değil)
 */
export async function getCurrentUser(): Promise<UserContext | null> {
    try {
        const cookieStore = await cookies()
        let accessToken = cookieStore.get("access_token")?.value
        let accessTokenPayload = await verifyAccessToken(accessToken)

        if (!accessTokenPayload) {
            accessToken = await refreshAccessToken()
            accessTokenPayload = await verifyAccessToken(accessToken)
        }

        if (!accessTokenPayload) return null

        const user = await prisma.user.findUnique({
            where: { id: accessTokenPayload.userId },
            select: userContextSelect
        })

        return user || null
    }
    catch {
        return null
    }
}