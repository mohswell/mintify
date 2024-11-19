import { useState } from 'react';
import { User } from '@/types';
import { API_URL } from '@/types';
import { useAuthStore } from '@/stores/auth';

interface UsersData {
  items: User[];
  totalPages: number;
}

interface FetchUsersParams {
  page: number;
  totalItems: number;
  search?: string | null;
}

interface UseUsersReturn {
  users: UsersData;
  isLoading: boolean;
  error: string | null;
  processUsers: (params: FetchUsersParams) => Promise<void>;
}

export const useUsers = (): UseUsersReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UsersData>({
    items: [],
    totalPages: 1,
  });
  const [error, setError] = useState<string | null>(null);

  const processUsers = async ({ page, totalItems, search }: FetchUsersParams) => {
    setIsLoading(true);
    setError(null);

    try {

      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/ruumers/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      const allUsers = data.data as User[];

      // Filter users based on search term
      let filteredUsers = allUsers;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = allUsers.filter((user) => 
          user.email?.toLowerCase().includes(searchLower) ||
          user.username?.toLowerCase().includes(searchLower) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
        );
      }

      // Calculate pagination
      const totalFilteredItems = filteredUsers.length;
      const totalPages = Math.max(Math.ceil(totalFilteredItems / totalItems), 1);
      const startIndex = (page - 1) * totalItems;
      const endIndex = Math.min(startIndex + totalItems, totalFilteredItems);
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      setUsers({
        items: paginatedUsers.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
          phoneNumber: user.phoneNumber,
          isInactive: user.isInactive,
          isAdmin: user.isAdmin,
        })),
        totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUsers({ items: [], totalPages: 1 });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    isLoading,
    error,
    processUsers,
  };
};