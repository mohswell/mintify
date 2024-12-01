import { API_URL } from "@/lib/env";
import { useAuthStore } from "@/stores/auth";
import { ApiResponse, GenAiResponse, GitHubUser, LoginDetails, SignupDetails, Token } from "@/types";
import axios from "axios";
import { AuthUser } from "./auth/factories/authInterface";
import { api } from "./server/api";

export const login = async (details: LoginDetails) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(details),
  });

  const data = await res.json();

  return { ok: res.ok, data };
};

export const githubLogin = async (githubUser: GitHubUser) => {
  const res = await fetch(`${API_URL}/auth/github-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      githubId: githubUser.id,
      email: githubUser.email,
      username: githubUser.login,
      name: githubUser.name,
      avatarUrl: githubUser.avatarUrl,
    }),
  });

  const data = await res.json();

  return { ok: res.ok, data };
};

export const signup = async (details: SignupDetails) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(details),
  });

  const data = await res.json();

  return { ok: res.ok, data };
};

export const forgotPassword = async (email: string) => {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  return { ok: res.ok, data };
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    // Send a request to verify the token and update the password
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password: newPassword,
      }),
    });

    const data = await res.json();

    // Return response based on API's success
    if (res.ok && data.success) {
      return { ok: true, message: "Password reset successful!" };
    } else {
      return { ok: false, message: data.message || "Failed to reset password." };
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return { ok: false, message: "An error occurred while resetting the password." };
  }
};

export const verifyPasswordToken = async (token: Token) => {
  try {
    const res = await fetch(`${API_URL}/auth/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    return { ok: data.valid, message: data.valid ? "Token is valid" : data.error };
  } catch (error) {
    console.error("Error verifying token:", error);
    return { ok: false, message: "An error occurred while verifying the token" };
  }
};

export const sendInviteEmail = async (email: string) => {
  try {
    const bearerToken = useAuthStore.getState().token;
    const response = await fetch(`${API_URL}/invite/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({ email }),
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

export const generateAccessToken = async () => {
  const user = useAuthStore.getState().user;
  const token = useAuthStore.getState().token;

  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  const res = await fetch(`${API_URL}/access-token/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId: user.id }),
  });

  const data = await res.json();
  return { ok: res.ok, data };
};

export const fetchPullRequests = async () => {
  const token = useAuthStore.getState().token;
  const userId = useAuthStore.getState().user?.id;

  // Optional: Add user ID to the request if available
  const queryParams = userId ? `?userId=${userId}` : '';

  try {
    const response = await axios.get(`${API_URL}/github/pull-requests${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return {
      data: response.data,
      error: null
    };
  } catch (err: any) {
    console.error('Failed to fetch pull requests:', err);
    return {
      data: [],
      error: err.response?.data?.message || 'Failed to fetch pull requests'
    };
  }
};

export const fetchPRFileAnalysis = async (prNumber: number) => {
  const token = useAuthStore.getState().token;

  try {
    const response = await axios.get(`${API_URL}/github/file-analysis/${prNumber}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return {
      data: response.data.data,
      error: null
    };
  } catch (err: any) {
    console.error('Failed to fetch file analysis:', err);
    return {
      data: [],
      error: err.response?.data?.message || 'Failed to fetch file analysis'
    };
  }
};

export const fetchAllPRFileAnalysis = async () => {
  const token = useAuthStore.getState().token;

  try {
    const response = await axios.get(`${API_URL}/github/file-analysis`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return {
      data: response.data.data,
      error: null
    };
  } catch (err: any) {
    console.error('Failed to fetch file analyses:', err);
    return {
      data: [],
      error: err.response?.data?.message || 'Failed to fetch file analyses'
    };
  }
};

export const getApiKeyUsageStats = async () => {
  const token = useAuthStore.getState().token;
  try {
    const res = await fetch(`${API_URL}/access-token/usage`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch API key usage stats");
    }

    return { ok: true, data };
  } catch (error) {
    console.error("API key usage stats error:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

export const updateUserDetails = async (updatedUserDetails: Partial<AuthUser>) => {
  const user = useAuthStore.getState().user;
  const token = useAuthStore.getState().token;

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const res = await fetch(`${API_URL}/user/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...updatedUserDetails }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update user details");
  }

  // Update local user state
  useAuthStore.setState({ user: { ...user, ...updatedUserDetails } });

  return { ok: res.ok, data };
};


export async function sendAICodeAnalysis(params: {
  fileDiff: string;
  prompt?: string;
  filePath: string;
}): Promise<{ ok: boolean; data?: any; error?: string }> {
  const token = useAuthStore.getState().token;

  if (!token) {
    console.error("No auth token found");
    return { ok: false, error: "Authentication token is missing" };
  }

  try {
    console.log("Sending API request with token:", token);
    const response = await axios.post(`${API_URL}/gemini/generate-code`,
      {
        code: `File Path: ${params.filePath}\n\nCode Diff:\n${params.fileDiff}\n\nAdditional Context: ${params.prompt || ''}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { ok: true, data: response.data };
  } catch (error: any) {
    console.error("API error:", error.response?.data || error.message);
    return { ok: false, error: error.message };
  }
}
