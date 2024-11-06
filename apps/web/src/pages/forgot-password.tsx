import Link from "next/link";
import { useState } from "react";
import { AuthLayout } from "@/components/layouts";
import { Button, Input } from "@/components/shared";
import { validateEmail } from "@/lib/helpers";
import notification from "@/lib/notification";
import { forgotPassword } from "@/actions";

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);

  async function requestLink(event: React.FormEvent) {
    event.preventDefault();

    // Set loading state
    setLoading(true);

    try {
      // Call the forgotPassword function to trigger the backend request
      const { ok, data } = await forgotPassword(email);

      if (ok) {
        // Display success notification
        notification({ message: "Password reset link sent to your email.", type: "success" });
      } else {
        // Handle errors by displaying error messages
        notification({ message: data.error || "Failed to send reset link.", type: "error" });
      }
    } catch (error) {
      console.error("Error requesting password reset link:", error);
      notification({ message: "An unexpected error occurred. Please try again.", type: "error" });
    } finally {
      // Stop loading state
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      page={{
        title: "Forgot password",
        description: 
        "Submit more photos to unlock your creative potential with our photography community.",
      }}
    >
      <div className="flex flex-col items-start w-full justify-center">
        <div className="w-full flex gap-y-4 flex-col lg:px-0 px-4">
          <div className="flex justify-start items-center gap-x-2">
            <h3 className="font-medium text-2xl !leading-6 -mt-1">
              Forgot password
            </h3>

            <span className="font-medium text-base !leading-[22px]">•</span>

            <p className="text-base font-light !leading-[22px]">
              Remember password?{" "}
              <Link
                href="/login"
                className="font-medium underline underline-offset-2"
              >
                Log in
              </Link>
            </p>
          </div>
          <p className="text-light-gray-7 font-light !leading-[22px] text-base max-w-[400px] w-full">
            Enter your email and we will send you a link to reset your password.
          </p>
        </div>
        <div className="border-b-[0.5px] border-light-gray-5 w-full md:my-11 my-8" />
        <form onSubmit={requestLink} className="max-w-lg w-full grid grid-cols-1 gap-4 lg:px-0 px-4">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            autoFocus
          />
          <Button type="submit" disabled={!validateEmail(email) || isLoading}>
            {isLoading ? "Sending..." : "Request link"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
