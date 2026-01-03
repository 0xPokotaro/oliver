"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useTransactionList } from "@/hooks/use-transaction-list";
import { getHashUrl } from "@/lib/transaction";
import Link from "next/link";

export function TransactionHistory() {
  const { data: transactions, isLoading, error } = useTransactionList();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Hash</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-red-500">
                  An error occurred
                </TableCell>
              </TableRow>
            )}
            {transactions && transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No transactions
                </TableCell>
              </TableRow>
            )}
            {transactions &&
              transactions.map((transaction) => {
                const hashUrl = getHashUrl(transaction.type, transaction.hash);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell>
                      {hashUrl ? (
                        <Link
                          href={hashUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {transaction.hash}
                        </Link>
                      ) : (
                        transaction.hash
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{transaction.type}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

