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
import { Badge } from "@/components/ui/badge";
import { useTransactionList } from "@/hooks/use-transaction-list-fetch";
import { getHashUrl } from "@/lib/transaction";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const AccountHistoryPage = () => {
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
    <div>
      <div className="mb-4">
        <h1 className="mb-4 text-2xl font-bold">Transaction History</h1>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Type</TableHead>
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
                    const hashUrl = getHashUrl(
                      transaction.type,
                      transaction.hash,
                    );
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
                              className="text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                              {transaction.hash}
                              <ExternalLink className="size-3" />
                            </Link>
                          ) : (
                            transaction.hash
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge>{transaction.type}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountHistoryPage;
