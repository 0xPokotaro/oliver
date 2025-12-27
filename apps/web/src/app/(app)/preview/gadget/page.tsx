"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Balance, Purchase } from "@/lib/types";

const GadgetPreviewPage = () => {
  const [userId, setUserId] = useState("user_12345");
  const [inputValue, setInputValue] = useState("user_12345");

  const { user, isLoading, error } = useUser({
    userId,
    includeHistory: true,
    historyLimit: 10,
  });

  const handleSearch = () => {
    setUserId(inputValue);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "shipped":
        return "secondary";
      case "processing":
        return "outline";
      case "cancelled":
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      processing: "処理中",
      shipped: "発送済み",
      delivered: "配達済み",
      cancelled: "キャンセル",
      failed: "失敗",
    };
    return labels[status] || status;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">ユーザー情報</h1>

      {/* 検索フォーム */}
      <div className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="ユーザーIDを入力"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="max-w-md"
        />
        <Button onClick={handleSearch}>検索</Button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          <p className="font-semibold">エラーが発生しました</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* ローディング状態 */}
      {isLoading && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      )}

      {/* ユーザー情報表示 */}
      {!isLoading && user && (
        <div className="space-y-6">
          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ユーザーID</p>
                <p className="font-mono font-semibold">{user.userId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ウォレットID</p>
                <p className="font-mono font-semibold">{user.walletId}</p>
              </div>
            </div>
          </div>

          {/* 残高情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">残高</h2>
            {user.balances.length === 0 ? (
              <p className="text-gray-500">残高情報がありません</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.balances.map((balance: Balance) => (
                  <div
                    key={balance.currency}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm text-gray-600 mb-1">
                      {balance.currencyName}
                    </p>
                    <p className="text-2xl font-bold">
                      {(
                        Number(balance.balance) / Math.pow(10, balance.decimals)
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {balance.currency}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 購入履歴 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">購入履歴</h2>
            {user.purchaseHistory.length === 0 ? (
              <p className="text-gray-500">購入履歴がありません</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>注文ID</TableHead>
                      <TableHead>商品名</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>金額</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>購入日時</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.purchaseHistory.map((purchase: Purchase) => (
                      <TableRow key={purchase.orderId}>
                        <TableCell className="font-mono text-sm">
                          {purchase.orderId}
                        </TableCell>
                        <TableCell>{purchase.productName}</TableCell>
                        <TableCell>{purchase.quantity}</TableCell>
                        <TableCell className="font-mono">
                          {Number(purchase.amount).toLocaleString()}{" "}
                          {purchase.currency}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(purchase.status)}
                          >
                            {getStatusLabel(purchase.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(purchase.purchasedAt).toLocaleString(
                            "ja-JP",
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* データがない場合 */}
      {!isLoading && !user && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">ユーザーIDを入力して検索してください</p>
        </div>
      )}
    </div>
  );
};

export default GadgetPreviewPage;
