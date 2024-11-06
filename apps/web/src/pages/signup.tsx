import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import notification from "@/lib/notification";
import { AuthLayout } from "@/components/layouts";
import { Button, Input } from "@/components/shared";
import { signup } from "@/actions";
import { verifyEmailToken } from "@/actions";
import { SignupInfo } from "@/types";
import { IconLoader } from "@tabler/icons-react"; // Add this import

export default function Signup() {
  const router = useRouter();
  const [details, setDetails] = useState<SignupInfo>({
    firstName: "",
    lastName: "",
    password: "",
    email: "",
  });
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const token = (router.query.token as string) || localStorage.getItem("signupToken");
  
    if (!token) {
      setError("No token found. Please check your email for the invitation link.");
      setLoading(false);
      return;
    }
  
    const verifyToken = async () => {
      setLoading(true);
      const result = await verifyEmailToken(token);
  
      if (result.ok) {
        setIsTokenValid(true);
        setDetails((prevDetails) => ({ ...prevDetails, email: result.email }));
        localStorage.setItem("signupToken", token);
      } else {
        setError("Invalid or expired token. Please request a new invite.");
        notification({ message: "Invalid or expired token. Please request a new invite from Photoruum's admin.", type: "error" });
        router.push("/login");
      }
  
      setLoading(false);
    };
  
    verifyToken();
  }, [router]);

  useEffect(() => {
    if (error) {
      notification({ message: error, type: "error" });
      if (error.includes("Invalid or expired")) {
        notification({ message: "Invalid or expired token. Please request a new invite from Photoruum's admin.", type: "error" });
      }
    }
  }, [error, router]);

  function handleChange(e: React.FormEvent<HTMLInputElement>) {
    const { name, value } = e.currentTarget;
    setDetails({ ...details, [name]: value });
  }

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    
    try {
      const { ok, data } = await signup({
        email: details.email,
        username: `${details.firstName.toLowerCase()}.${details.lastName.toLowerCase()}`,
        firstName: details.firstName,
        lastName: details.lastName,
        password: details.password,
      });

      if (!ok) {
        setError(data.error || "Signup failed. Please try again.");
        notification({ message: data.error || "Signup failed. Please try again.", type: "error" });
        return;
      }

      notification({ message: "Signup success! Login into your account.", type: "success" });
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      setError("Signup failed. Please try again.");
      notification({ message: "Signup failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    } 
  }

  return (
    <>
      {/* Loading Overlay */}
      {loading ? (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <IconLoader className="h-12 w-12 text-black dark:text-white animate-spin" />
        </div>
      ) : isTokenValid ? (
        <AuthLayout
          page={{
            title: "Signup",
            description: "Create your account to unlock your creative potential with our photography community.",
          }}
        >
          <div className="flex flex-col items-start w-full justify-center">
            <div className="w-full flex gap-y-4 flex-col lg:px-0 px-4">
              <div className="flex justify-start items-center gap-x-2">
                <h1 className='font-[500] font-[Kanit] text-[24px] leading-[24px]'>Signup • </h1>
              </div>
              <p className='mt-4 text-[#808080] font-[Kanit] font-[300] text-[16px] leading-[22px] w-[26.875rem]'>
                Create your account to unlock your creative potential with our photography community.
              </p>
            </div>

            <div className="border-b-[0.5px] border-light-gray-5 w-full md:my-11 my-8" />

            <form
              onSubmit={handleSignup}
              className="max-w-lg w-full grid sm:grid-cols-2 grid-cols-1 gap-4 lg:px-0 px-4"
            >
              <Input
                id="firstName"
                name="firstName"
                type="text"
                label="First name"
                placeholder="Your First name"
                value={details.firstName}
                onChange={handleChange}
                autoFocus
              />
              <Input
                id="lastName"
                name="lastName"
                type="text"
                label="Last name"
                placeholder="Your Last name"
                value={details.lastName}
                onChange={handleChange}
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="Your Email address"
                value={details.email}
                onChange={handleChange}
                readOnly
                className="bg-gray-200 cursor-not-allowed"
              />
              <Input
                id="password"
                name="password"
                type="password"
                label="Create Password"
                placeholder="Enter your password"
                value={details.password}
                onChange={handleChange}
              />

              <Button
                type="submit"
                className="col-span-full"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Get Started"}
              </Button>
            </form>
          </div>
        </AuthLayout>
      ) : null}
    </>
  );
}
