import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
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
      return Response.json(
        { error: errorData.error || `Logout failed: ${response.statusText}` },
        { status: response.status },
      );
    }

    // Cookieを転送
    const setCookieHeader = response.headers.get("set-cookie");
    const headers = new Headers();
    if (setCookieHeader) {
      headers.set("set-cookie", setCookieHeader);
    }

    const data = await response.json();
    return Response.json(data, { headers });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

