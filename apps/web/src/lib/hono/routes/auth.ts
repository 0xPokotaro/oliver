import { Hono } from "hono";
import type { LoginRequest, LoginResponse } from "@/lib/types/auth-types";

const auth = new Hono().post("/login", async (c) => {
  try {
    const body = (await c.req.json()) as LoginRequest;

    // Rust APIサーバーにプロキシ
    const apiUrl = process.env.RUST_API_URL || "http://localhost:3001";
    const url = `${apiUrl}/api/auth/login`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Unknown error",
        code: "UNKNOWN_ERROR",
      }));
      return c.json(
        { error: errorData.error || `Login failed: ${response.statusText}` },
        response.status as any,
      );
    }

    // Cookieを転送
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      c.header("set-cookie", setCookieHeader);
    }

    const data = (await response.json()) as LoginResponse;
    return c.json(data);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}).post("/logout", async (c) => {
  try {
    // Rust APIサーバーにプロキシ
    const apiUrl = process.env.RUST_API_URL || "http://localhost:3001";
    const url = `${apiUrl}/api/auth/logout`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Unknown error",
        code: "UNKNOWN_ERROR",
      }));
      return c.json(
        { error: errorData.error || `Logout failed: ${response.statusText}` },
        response.status as any,
      );
    }

    // Cookieを転送
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      c.header("set-cookie", setCookieHeader);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default auth;

