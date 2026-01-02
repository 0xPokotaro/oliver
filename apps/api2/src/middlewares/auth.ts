import type { MiddlewareHandler } from "hono";
import { createRepositories } from "../repositories";
import { getPrivyClient } from "../lib/privy";
import type { AuthUser } from "../types";

export const requireAuthMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const authToken = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    // verify privy token
    const verifiedClaims = await getPrivyClient()
      .utils()
      .auth()
      .verifyAuthToken(authToken);
    const userId = verifiedClaims.user_id;

    // get or create user
    const repositories = createRepositories();
    let user = await repositories.user.findByPrivyUserId(userId);

    if (!user) {
      user = await repositories.user.create(userId);
    }

    // set user to context
    c.set("user", {
      id: user.id,
    } as AuthUser);

    await next();
  } catch (error) {
    console.error("error: ", error);
    return c.json({ error: "Unauthorized" }, 401);
  }
};
