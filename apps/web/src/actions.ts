import { API_URL } from "@/lib/env";
import { useAuthStore } from "@/stores/auth";
import { LoginDetails, SignupDetails, Token } from "@/types";

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