"use client";

import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { Input } from "./Input";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { login } from "@/actions";
import { Loader } from "lucide-react";
import notification from "@/lib/notification";
import Cookies from "js-cookie";
import { SESSION_NAME } from "@/lib/constants";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50),
});

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setUser, setToken } = useAuthStore();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const { ok, data } = await login(values);

      if (!ok) {
        setIsLoading(false);
        notification({ type: "error", message: "Invalid credentials, Please try again!" });
        return;
      }

      // On successful login, set the user data and token in the state and cookies
      notification({ message: "Login successful!" });

      setToken(data.token);
      setUser(data.user);

      // Set the token in a cookie for access
      Cookies.set(SESSION_NAME, data.token, {
        secure: true,
        sameSite: "strict",
      });

      // Redirect to the dashboard after successful login
      router.push("/home");
    } catch (error: any) {
      notification({ type: "error", message: "Login failed!" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              "Login"
            )}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}