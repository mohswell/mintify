"use client";

import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/views/ui/button";
import { Input } from "@/components/views/ui/input";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../views/ui/form";
import { signup } from "@/actions";
import { useState } from "react";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import notification from "@/lib/notification";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }).max(50),
  lastName: z.string().min(1, { message: "Last name is required" }).max(50),
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().min(2, { message: "Username must be at least 2 characters" }).max(50),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(50),
});


export default function SignupForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const { ok, data } = await signup(values); 

      if (!ok) {
        setIsLoading(false);
        notification({ type: "error", message: "Signup failed. Notify the owner if you think this is a mistake!" });
        return;
      }

      notification({ message: "Signup successful! Redirecting to login..." });

      // Delay redirection to the login page
      setTimeout(() => {
        router.push("/");
      }, 1000); 

      form.reset();
    } catch (error: any) {
      notification({ type: "error", message: "Signup failed!" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
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
          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              "Create an account"
            )}

          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/" className="underline">
            Sign in
          </Link>
        </div>
      </form>
    </Form>
  );
}
