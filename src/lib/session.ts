import "server-only"

import { Role } from "@/generated/prisma/enums"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import { prisma } from "./prisma"
import { AppError } from "./server/errors"

type AccessTokenPayload = {
    userId: string
    roles: Role[]
    type: "access"
}

type RefreshTokenPayload = {
    tokenId: string
    userId: string
    type: "refresh"
}

const accessTokenEncodedKey = new TextEncoder().encode(process.env.AUTH_ACCESS_TOKEN_SECRET)
const refreshTokenEncodedKey = new TextEncoder().encode(process.env.AUTH_REFRESH_TOKEN_SECRET)
const accessTokenExpireMinutes = Number(process.env.NEXT_PUBLIC_AUTH_ACCESS_TOKEN_EXPIRATION_MINUTES)
const refreshTokenExpireDays = Number(process.env.AUTH_REFRESH_TOKEN_EXPIRATION_DAYS)
const passwordSaltRounds = Number(process.env.AUTH_PASSWORD_SALT_ROUNDS)

const isProduction = process.env.NODE_ENV === "production"

/**
 * Access token oluştur ve döndür
 * createSession ve refreshAccessToken içinde kullanılır
 */
export async function createAccessToken(userId: string, roles: Role[]): Promise<string> {
    return await new SignJWT({
        userId,
        roles,
        type: "access"
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${accessTokenExpireMinutes}m`)
        .sign(accessTokenEncodedKey)
}

/**
 * Refresh token oluştur, veritabanına kaydet ve döndür
 * createSession esnasında çağrılır
 */
export async function createRefreshToken(userId: string): Promise<string> {
    const expiresAt = new Date(Date.now() + refreshTokenExpireDays * 24 * 60 * 60 * 1000)

    const tokenString = crypto.randomBytes(32).toString("hex")
    const hashedToken = await bcrypt.hash(tokenString, passwordSaltRounds)

    const refreshToken = await prisma.refreshToken.create({
        data: {
            token: hashedToken,
            userId,
            expiresAt
        }
    })

    return await new SignJWT({
        tokenId: refreshToken.id,
        userId,
        type: "refresh"
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${refreshTokenExpireDays}d`)
        .sign(refreshTokenEncodedKey)
}

/**
 * Access ve refresh token oluştur ve cookies'e kaydet
 * Login endpointinde çağrılır
 */
export async function createSession(userId: string, roles: Role[]): Promise<void> {
    const accessToken = await createAccessToken(userId, roles)
    const refreshToken = await createRefreshToken(userId)

    const cookieStore = await cookies()

    cookieStore.set("access_token", accessToken, {
        httpOnly: true,
        secure: isProduction,
        maxAge: accessTokenExpireMinutes * 60,
        sameSite: "lax",
        path: "/"
    })

    cookieStore.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        maxAge: refreshTokenExpireDays * 24 * 60 * 60,
        sameSite: "lax",
        path: "/"
    })
}

/**
 * Access token'ı doğrula ve payload döndür
 * Token geçersizse null döndürür
 */
export async function verifyAccessToken(token: string | undefined): Promise<AccessTokenPayload | null> {
    if (!token) return null

    try {
        const { payload } = await jwtVerify(token, accessTokenEncodedKey, { algorithms: ["HS256"] })
        if (payload.type !== "access") return null

        return payload as AccessTokenPayload
    }
    catch {
        return null
    }
}

/**
 * Refresh token'ı doğrula ve payload döndür
 * Token geçersizse null döndürür
 */
export async function verifyRefreshToken(token: string | undefined): Promise<RefreshTokenPayload | null> {
    if (!token) return null

    try {
        const { payload } = await jwtVerify(token, refreshTokenEncodedKey, { algorithms: ["HS256"] })
        if (payload.type !== "refresh") return null

        return payload as RefreshTokenPayload
    }
    catch {
        return null
    }
}

/**
 * Refresh token kullanarak yeni access token oluştur
 * Cookie'ye kaydeder ve döndürür
 * getCurrentUser() ve API endpoint'lerinde çağrılır
 * 
 * 1. Cookie'den refresh token al
 * 2. Refresh token var mı kontrol et (yoksa REFRESH_TOKEN_NOT_FOUND 401)
 * 3. Refresh token JWT geçerli mi doğrula (geçersizse INVALID_REFRESH_TOKEN 401)
 * 4. Veritabanında refresh token kaydı var mı kontrol et (yoksa TOKEN_NOT_FOUND 401)
 * 5. Token süresi dolmuş mu kontrol et (dolmuşsa sil ve TOKEN_EXPIRED 401)
 * 6. Yeni access token oluştur
 * 7. Yeni access token'ı cookie'ye kaydet
 * 8. Yeni access token'ı döndür
 */
export async function refreshAccessToken(): Promise<string> {
    const cookieStore = await cookies()
    const refreshTokenJwt = cookieStore.get("refresh_token")?.value

    if (!refreshTokenJwt) {
        throw new AppError("REFRESH_TOKEN_NOT_FOUND", 401)
    }

    const refreshTokenPayload = await verifyRefreshToken(refreshTokenJwt)
    if (!refreshTokenPayload) {
        throw new AppError("INVALID_REFRESH_TOKEN", 401)
    }

    const storedRefreshToken = await prisma.refreshToken.findUnique({
        where: { id: refreshTokenPayload.tokenId },
        include: { user: { select: { id: true, roles: true } } }
    })

    if (!storedRefreshToken) {
        throw new AppError("TOKEN_NOT_FOUND", 401)
    }

    if (storedRefreshToken.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { id: storedRefreshToken.id } })
        throw new AppError("TOKEN_EXPIRED", 401)
    }

    const newAccessToken = await createAccessToken(
        storedRefreshToken.user.id,
        storedRefreshToken.user.roles
    )

    try {
        cookieStore.set("access_token", newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            maxAge: accessTokenExpireMinutes * 60,
            sameSite: "lax",
            path: "/"
        })
    }
    catch { }

    return newAccessToken
}

/**
 * Oturumu sil
 * Veritabanından refresh token'ı sil ve cookies'ten token'ları kaldır
 */
export async function deleteSession(): Promise<void> {
    const cookieStore = await cookies()
    const refreshTokenJwt = cookieStore.get("refresh_token")?.value

    if (refreshTokenJwt) {
        const refreshTokenPayload = await verifyRefreshToken(refreshTokenJwt)
        if (refreshTokenPayload) {
            await prisma.refreshToken.delete({
                where: { id: refreshTokenPayload.tokenId }
            }).catch(() => { })
        }
    }

    cookieStore.delete("access_token")
    cookieStore.delete("refresh_token")
}

/**
 * Veritabanından süresi dolan refresh token'ları sil
 * Cron job olarak periyodik çalışan background task
 */
export async function deleteExpiredTokens(): Promise<number> {
    try {
        const result = await prisma.refreshToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() }
            }
        })

        console.log(`[deleteExpiredTokens] Deleted ${result.count} expired tokens`)
        return result.count
    }
    catch (error) {
        console.error("[deleteExpiredTokens] Error:", error instanceof Error ? error.message : error)
        throw error
    }
}

/**
 * API endpoint'lerinde yetkilendirme kontrolü için kullanılır
 * 
 * 1. Access token'ı cookie'den al
 * 2. Token geçersizse refresh token ile yenile
 * 3. Token hala geçersizse UNAUTHORIZED (401) throw et
 * 4. Required role'ler belirtilmişse, kullanıcının bu role'lere sahip olup olmadığını kontrol et
 * 5. Role'e sahip değilse FORBIDDEN (403) throw et
 * 6. Tüm kontroller başarılıysa true döndür
 */
export async function authorizeUser(requiredRoles?: Role[]): Promise<string> {
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

    if (requiredRoles && !requiredRoles.every(role => accessTokenPayload.roles.includes(role))) {
        throw new AppError("FORBIDDEN", 403)
    }

    return accessTokenPayload.userId
}

/**
 * User ID'sini al
 * Token geçerliyse userId döndür, değilse null döndür
 * Hata throw etmez, graceful fallback
 */
export async function getUserId(): Promise<string | null> {
    try {
        const cookieStore = await cookies()
        let accessToken = cookieStore.get("access_token")?.value
        let accessTokenPayload = await verifyAccessToken(accessToken)

        if (!accessTokenPayload) {
            try {
                accessToken = await refreshAccessToken()
                accessTokenPayload = await verifyAccessToken(accessToken)
            }
            catch {
                return null
            }
        }

        return accessTokenPayload?.userId || null
    }
    catch {
        return null
    }
}