import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get("walletAddress");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (walletAddress) {
      // 特定のウォレットアドレスで検索
      const user = await prisma.user.findUnique({
        where: {
          walletAddress: walletAddress,
        },
        include: {
          payments: {
            include: {
              product: {
                include: {
                  merchant: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 10, // 最新10件の決済履歴
          },
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(user);
    }

    // ユーザー一覧取得
    const where: any = {};
    const users = await prisma.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.user.count({ where });

    return NextResponse.json({
      users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, name, email, avatar, metadata } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 },
      );
    }

    // 既存のユーザーを確認
    const existingUser = await prisma.user.findUnique({
      where: {
        walletAddress: walletAddress,
      },
    });

    if (existingUser) {
      // 既存ユーザーの場合は更新
      const updatedUser = await prisma.user.update({
        where: {
          walletAddress: walletAddress,
        },
        data: {
          name,
          email,
          avatar,
          metadata,
        },
      });

      return NextResponse.json(updatedUser);
    }

    // 新規ユーザーを作成
    const newUser = await prisma.user.create({
      data: {
        walletAddress,
        name,
        email,
        avatar,
        metadata,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json(
      { error: "Failed to create/update user" },
      { status: 500 },
    );
  }
}

