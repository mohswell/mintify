import Link from "next/link";
import Cookies from "js-cookie";
import { useState } from "react";
import { useRouter } from "next/router";
import { login } from "@/actions";
import { LoginDetails } from "@/types";
import { validateEmail } from "@/lib/helpers";
import notification from "@/lib/notification";
import { AuthLayout } from "@/components/layouts";
import { Button, Input } from "@/components/shared";
import { useAuthStore } from "@/stores/auth";
import { SESSION_NAME } from "@/lib/constants";

export default function Login() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);

  const [isLoading, setLoading] = useState<boolean>(false);
  const [details, setDetails] = useState<LoginDetails>({
    email: "",
    password: "",
  });

  function handleChange(e: React.FormEvent<HTMLInputElement>) {
    const { name, value } = e.currentTarget;

    setDetails({ ...details, [name]: value });
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);

    try {
      const { ok, data } = await login(details);

      if (!ok) {
        setLoading(false);
        notification({ type: "error", message: data.error });

        return;
      }

      notification({ message: "Login successful!" });

      setToken(data.token);
      setUser(data.user);

      // Set the token in a cookie for the middleware to access
      Cookies.set(SESSION_NAME, data.token, {
        secure: true,
        sameSite: "strict",
      });

      router.push("/dashboard");
    } catch (error: any) {
      notification({ type: "error", message: "Login failed!" });

      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      page={{
        title: "Login",
        description:
          "Submit more photos to unlock your creative potential with our photography community.",
      }}
    >
      <div className="flex flex-col items-start w-full justify-center">
        <div className="w-full flex gap-y-4 flex-col lg:px-0 px-4">
          <div className="flex justify-start items-center gap-x-2">
            <h3 className="font-medium text-2xl !leading-6 -mt-1">Log in</h3>
            {/* <span className="font-medium text-base !leading-[22px]">•</span>
              <p className="text-base font-light !leading-[22px]">
                Don’t have an account?{" "}
                <Link
                  href="#"
                  className="font-medium underline underline-offset-2"
                >
                  Sign up
                </Link>
              </p> */}
          </div>
  
          <p className="text-light-gray-7 dark:text-light-gray-6 font-light !leading-[22px] text-base max-w-[400px] w-full">
            Submit more photos to unlock your creative potential with our
            photography community.
          </p>
        </div>
  
        <div className="border-b-[0.5px] border-light-gray-5 dark:border-dark-2 w-full md:my-11 my-8" />
  
        <form
          onSubmit={handleLogin}
          className="max-w-lg w-full grid sm:grid-cols-2 grid-cols-1 gap-4 lg:px-0 px-4"
        >
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="Enter your email address"
            value={details.email}
            onChange={handleChange}
            autoFocus
            className="bg-white dark:bg-dark-2 border-light-gray-5 dark:border-dark-2"
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={details.password}
            onChange={handleChange}
            className="bg-white dark:bg-dark-2 border-light-gray-5 dark:border-dark-2"
          />
  
          <Button
            type="submit"
            loading={isLoading}
            className="col-span-full bg-dark dark:bg-white text-white dark:text-dark hover:bg-dark-darker dark:hover:bg-light-gray-1"
            disabled={!(validateEmail(details.email) && details.password)}
          >
            Get back in!
          </Button>
  
          <p className="font-light text-base !leading-[22px] tracking-[-2%] col-span-full">
            Forgot your password?{" "}
            <Link
              href="/forgot-password"
              className="underline underline-offset-2 font-medium hover:text-light-gray-7 dark:hover:text-light-gray-6"
            >
              Reset it
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
