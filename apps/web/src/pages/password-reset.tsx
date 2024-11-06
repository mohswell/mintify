import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import notification from "@/lib/notification";
import { AuthLayout } from "@/components/layouts";
import { Button, Input } from "@/components/shared";
import { resetPassword as resetPasswordAction, verifyPasswordToken } from "@/actions";
import { IconLoader } from "@tabler/icons-react";

interface PasswordResetInfo {
  password: string;
  confirmPassword: string;
}

export default function PasswordReset() {
  const router = useRouter();
  const { token } = router.query;

  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [details, setDetails] = useState<PasswordResetInfo>({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (token) {
      verifyToken(token as string);
    }
  }, [token]);

  async function verifyToken(token: string) {
    setLoading(true); // Start loading
    try {
      const { ok } = await verifyPasswordToken(token);
      if (ok) {
        setIsTokenValid(true);
      } else {
        notification({ message: "Invalid or expired token.", type: "error" });
        setIsTokenValid(false); // Set as invalid token
        router.push("/forgot-password"); // Redirect after notification
      }
    } catch (error) {
      console.error("Token verification error:", error);
      notification({ message: "An error occurred. Please try again.", type: "error" });
      setIsTokenValid(false); // Set as invalid token
      router.push("/forgot-password"); // Redirect after notification
    } finally {
      setLoading(false); // End loading
    }
  }

  function handleChange(e: React.FormEvent<HTMLInputElement>) {
    const { name, value } = e.currentTarget;
    setDetails({ ...details, [name]: value });
  }

  async function handlePasswordReset(event: React.FormEvent) {
    event.preventDefault();

    const { password, confirmPassword } = details;

    if (password !== confirmPassword) {
      notification({ message: "Passwords do not match!" });
      return;
    }

    setLoading(true);
    const result = await resetPasswordAction(token as string, password);
    setLoading(false);

    if (result.ok) {
      notification({ message: result.message });
      router.push("/login");
    } else {
      notification({ message: result.message || "Failed to reset password." });
    }
  }

  return (
    <>
      {/* Loading Overlay */}
      {isLoading ? (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <IconLoader className="h-12 w-12 text-black dark:text-white animate-spin" />
        </div>
      ) : (
        <AuthLayout
          page={{
            title: "Reset password",
            description: "Create a new password to secure your account.",
          }}
        >
          <div className="flex flex-col items-start w-full justify-center">
            <div className="w-full flex gap-y-4 flex-col lg:px-0 px-4">
              <div className="flex justify-start items-center gap-x-2">
                <h3 className="font-medium text-2xl !leading-6 -mt-1">Reset password</h3>
                <span className="font-medium text-base !leading-[22px]">•</span>
                <p className="text-base font-light !leading-[22px]">
                  Remember password?{" "}
                  <Link href="/login" className="font-medium underline underline-offset-2">Log in</Link>
                </p>
              </div>
              <p className="text-light-gray-7 font-light !leading-[22px] text-base max-w-[400px] w-full">
                Create a new password. Ensure that both inputs match before submission.
              </p>
            </div>

            <div className="border-b-[0.5px] border-light-gray-5 w-full md:my-11 my-8" />

            {isTokenValid === true ? (
              <form
                onSubmit={handlePasswordReset}
                className="max-w-lg w-full grid sm:grid-cols-2 grid-cols-1 gap-4 lg:px-0 px-4"
              >
                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="New password"
                  placeholder="Enter your new password"
                  value={details.password}
                  onChange={handleChange}
                  autoFocus
                />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  label="Confirm password"
                  placeholder="Confirm your new password"
                  value={details.confirmPassword}
                  onChange={handleChange}
                />
                <Button
                  type="submit"
                  className="col-span-full"
                  disabled={!details.password || !details.confirmPassword || details.password !== details.confirmPassword || isLoading}
                >
                  {isLoading ? "Saving..." : "Create password"}
                </Button>
              </form>
            ) : null}
          </div>
        </AuthLayout>
      )}
    </>
  );
}
