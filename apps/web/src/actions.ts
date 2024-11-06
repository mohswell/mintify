import { API_URL } from "@/lib/env";
import { useAuthStore } from "@/stores/auth";
import { LoginDetails, NewSubmission, SignupDetails, Token } from "@/types";

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

export const getSubmissions = async () => {
  const user = useAuthStore.getState().user;
  const token = useAuthStore.getState().token;

  const res = await fetch(`${API_URL}/submissions/images/${user?.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  return { ok: res.ok, data };
};

export const uploadImage = async (formData: FormData) => {
  const token = useAuthStore.getState().token;

  const res = await fetch(`${API_URL}/images/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  return { ok: res.ok, data };
};

export const createSubmission = async (details: NewSubmission) => {
  const token = useAuthStore.getState().token;
  const user = useAuthStore.getState().user;

  const res = await fetch(`${API_URL}/images/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...details,
      user_id: (user?.id as number).toString(),
    }),
  });

  const data = await res.json();

  return { ok: res.ok, data };
};

export const fetchAllImages  = async () => {
  const token = useAuthStore.getState().token;

  const res = await fetch(`${API_URL}/images/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  return { ok: res.ok, data };
};