import { Hono } from "hono";
import type { UserInformation } from "@/lib/types";

const users = new Hono().get("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const includeHistory = c.req.query("includeHistory") === "true";
  const historyLimit = c.req.query("historyLimit") || "10";

  try {
    // Rust APIサーバーにプロキシ
    const apiUrl = process.env.RUST_API_URL || "http://localhost:3001";
    const url = `${apiUrl}/api/v1/users/${userId}?includeHistory=${includeHistory}&historyLimit=${historyLimit}`;

    const response = await fetch(url);

    if (!response.ok) {
      const status = response.status as 400 | 404 | 500;
      return c.json({ error: "Failed to fetch user" }, status);
    }

    const data = (await response.json()) as UserInformation;
    return c.json(data);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default users;
