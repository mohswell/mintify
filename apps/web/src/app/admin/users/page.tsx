"use client";

import React, { useEffect, useState } from "react";
import { UsersTable } from "@/components/features";
import { Input } from "@/components/ui/input";
import notification from "@/lib/notification";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_PAGE, DEFAULT_TOTAL_ITEMS } from "@/lib/constants";
import { fetchAllUsers } from "@/actions";
import { User } from "@/types";

export default function Users() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_TOTAL_ITEMS);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetchAllUsers();

        if (!response.ok) throw new Error("Failed to fetch users");

        const users = response.data?.ruumers || [];
        setAllUsers(users);
        setFilteredUsers(users);
      } catch (err) {
        console.error("Error loading users:", err);
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(allUsers);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = allUsers.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchLower) ||
          user.username?.toLowerCase().includes(searchLower) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
      );
      setFilteredUsers(filtered);

      if (filtered.length === 0) {
        notification({
          type: "error",
          message: "No users found, please try again!",
        });
        setSearchTerm("");
      }
    }
    setCurrentPage(1);
  }, [searchTerm, allUsers]);

  const totalPages = Math.max(Math.ceil(filteredUsers.length / itemsPerPage), 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  if (error) {
    return <div className="m-10 text-red-500">Error loading users: {error}</div>;
  }

  return (
    <div className="mt-5 mx-10 flex flex-col gap-5">
      <div className="flex justify-between gap-3 w-full">
        <Input
          value={searchTerm}
          placeholder="Search by email or username"
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[250px] bg-white dark:bg-dark text-black dark:text-white p-2"
        />
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => {
            setItemsPerPage(parseInt(value));
            setCurrentPage(1);
          }}
          defaultValue="5"
        >
          <SelectTrigger className="w-[180px] bg-white dark:bg-dark text-black dark:text-white p-2">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map((item) => (
              <SelectItem key={item} value={item.toString()}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      <UsersTable
        users={currentUsers}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
