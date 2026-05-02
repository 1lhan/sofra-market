import { Role } from "@/generated/prisma/enums";
import Elysia from "elysia";
import { headers } from "next/headers";
import { auth } from "../auth";
import { AppError } from "./errors";

// false ise session olsa da olur olmasa da, var ise userId döner
// eğer [] ise her rol istekte bulunabilir ama auth zorunlu auth yok ise UNAUTHORIZED döner
// eğer array ise ve length 0 dan büyük ise gerekli roller karşılanmalı
export const authMiddleware = (requiredRoles: Role[] | false = false) => new Elysia()
    .derive(async () => {
        const session = await auth.api.getSession({ headers: await headers() })

        if (Array.isArray(requiredRoles)) {
            if (!session || (requiredRoles.length > 0 && requiredRoles.some(r => session.user.roles.includes(r)))) {
                throw new AppError("UNAUTHORIZED", 401)
            }
        }

        return { userId: session?.user.id }
    })