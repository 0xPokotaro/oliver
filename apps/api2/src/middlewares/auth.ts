import type { MiddlewareHandler } from "hono";
import { PrivyClient } from '@privy-io/node';
import { getPrismaClient } from '../lib/prisma';
import { getPrivyConfig } from '../config';

const privyConfig = getPrivyConfig();
const privy = new PrivyClient({
  appId: privyConfig.appId,
  appSecret: privyConfig.appSecret,
});

export type AuthUser = {
  id: string;
};

export const requireAuthMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization')

    if (!authHeader) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const authToken = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader

    // verify privy token
    const verifiedClaims = await privy.utils().auth().verifyAuthToken(authToken);
    console.log("verifiedClaims: ", verifiedClaims.user_id);
    const userId = verifiedClaims.user_id;

    // get or create user
    const prisma = getPrismaClient();
    const user = await prisma.user.upsert({
      where: { privyUserId: userId },
      update: {},
      create: {
        privyUserId: userId,
      },
    });

    // set user to context
    c.set('user', {
      id: user.id,
    } as AuthUser);

    await next();
  } catch (error) {
    console.error("error: ", error);
    return c.json({ error: "Unauthorized" }, 401);
  }
}

