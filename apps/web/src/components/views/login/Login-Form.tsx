"use client";

import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { Button as GithubLoginButton } from "@/components/views/ui/button";
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
import { login, githubLogin } from "@/actions";
import { Loader } from "lucide-react";
import { IconBrandGithub } from "@tabler/icons-react";
import notification from "@/lib/notification";
import Cookies from "js-cookie";
import { SESSION_NAME } from "@/lib/constants";
import { supabase } from "@/auth/config/supabase";
import { GitHubUser } from "@/types";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(50),
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

      notification({ message: "Login successful!" });

      setToken(data.token);
      setUser(data.user);

      Cookies.set(SESSION_NAME, data.token, {
        secure: true,
        sameSite: "strict",
      });

      router.push("/home");
    } catch (error: any) {
      notification({ type: "error", message: "Login failed!" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleGitHubLogin = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          scopes: "user:email",
          redirectTo: `${window.location.origin}/auth/callback/github`
        }
      });

      if (error) {
        notification({
          type: "error",
          message: "GitHub login failed. Please try again.",
        });
        console.error('GitHub OAuth initiation error:', error);
        return;
      }
    } catch (error) {
      console.error('GitHub login error:', error);
      notification({
        type: "error",
        message: "An unexpected error occurred during GitHub login"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <GithubLoginButton
          variant="outline"
          className="w-full"
          onClick={handleGitHubLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader className="size-4 animate-spin mr-2" />
          ) : (
            <>
              <IconBrandGithub className="mr-2 size-4" />
              Login with GitHub
            </>
          )}
        </GithubLoginButton>


        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}