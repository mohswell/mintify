"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "../../ui/pagination";
import { Button } from "../../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { User } from "@/types";
import { formatDate } from "@/lib/helpers";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const UsersTable = ({
  users,
  isLoading,
  totalPages,
  currentPage,
  onPageChange,
}: UsersTableProps) => {
  return (
    <Card>
      <CardHeader className="p-3"> 
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <Table className="overflow-hidden">
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell">ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden sm:table-cell">Name</TableHead>
              <TableHead className="hidden lg:table-cell">Phone</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="animate-pulse">
                  <TableCell width={"40%"}>
                    <div className="p-5 bg-gray-400/30 rounded-xl"></div>
                  </TableCell>
                  <TableCell>
                    <div className="p-5 bg-gray-400/30 rounded-xl"></div>
                  </TableCell>
                  <TableCell>
                    <div className="p-5 bg-gray-400/30 rounded-xl"></div>
                  </TableCell>
                  <TableCell>
                    <div className="p-5 bg-gray-400/30 rounded-xl"></div>
                  </TableCell>
                  <TableCell>
                    <div className="p-5 bg-gray-400/30 rounded-xl"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="hidden md:table-cell">{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{user.phoneNumber}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.isInactive ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.isInactive ? 'Inactive' : 'Active'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => onPageChange(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </PaginationItem>
            )}
            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <Button 
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  onClick={() => onPageChange(index + 1)}
                >
                  {index + 1}
                </Button>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            {totalPages !== currentPage && (
              <PaginationItem>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => onPageChange(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
};

export default UsersTable;
