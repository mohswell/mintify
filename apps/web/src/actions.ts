import { API_URL } from "@/lib/env";
import { useAuthStore } from "@/stores/auth";
import { LoginDetails, Token, FetchUsersResponse, FetchImageResponse } from "@/types";

export const verifyEmailToken = async (token: Token) => {
  try {
    const res = await fetch(`${API_URL}/email/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      return { ok: true, email: data.email };
    } else {
      return { ok: false };
    }
  } catch (error) {
    console.error(error);
    return { ok: false };
  }
};

export const login = async (details: LoginDetails) => {
  const res = await fetch(`${API_URL}/auth/admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(details),
  });

  const data = await res.json();

  return { ok: res.ok, data };
};

export const getStats = async () => {
  const user = useAuthStore.getState().user;
  const token = useAuthStore.getState().token;

  const res = await fetch(`${API_URL}/stats/values/${user?.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  return { ok: res.ok, data };
};

export const fetchAllUsers = async (): Promise<FetchUsersResponse> => {
  const token = useAuthStore.getState().token;

  const res = await fetch(`${API_URL}/ruumers/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const responseData = await res.json();

  return {
    ok: res.ok,
    data: {
      message: responseData.message,
      ruumers: responseData.ruumers
    }
  };
};

export const fetchAllImages  = async (): Promise<FetchImageResponse> => {
  const token = useAuthStore.getState().token;

  const res = await fetch(`${API_URL}/images/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  return {
    ok: res.ok,
    data: {
      message: data.message,
      images: data.images
    }
  };
};

export const sendInviteEmail = async (email: string) => {
  try {
      // const baseUrl = process.env.NEXT_PUBLIC_BASE_APP_URL;
      // const bearerToken = process.env.NEXT_PUBLIC_INVITE_BEARER_TOKEN;
      const bearerToken = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/invite/user`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({ email }), // Just sending the email in the body
      });

      const result = await response.json();

      if (!response.ok) {
          throw new Error(result.message || 'Failed to send invite');
      }

      return result.message;
  } catch (error: any) {
      throw new Error(error.message || 'An error occurred while sending the invite');
  }
};
