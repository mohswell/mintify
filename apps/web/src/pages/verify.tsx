import Link from "next/link";
import { useEffect, useState } from "react";
import notification from "@/lib/notification";
import { AuthLayout } from "@/components/layouts";
import { Button, Input } from "@/components/shared";
import { validateEmail } from "@/lib/helpers";

interface SignupInfo {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export default function Signup() {
  // const [isLoading, setLoading] = useState<boolean>(false);
  const [details, setDetails] = useState<SignupInfo>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const canProceed =
    details.firstName &&
    details.lastName &&
    validateEmail(details.email) &&
    details.password;

  useEffect(() => {
    setDetails({
      ...details,
      firstName: "John",
      lastName: "Doe",
      email: "example@gmail.com",
    });

    // eslint-disable-next-line
  }, []);

  function handleChange(e: React.FormEvent<HTMLInputElement>) {
    const { name, value } = e.currentTarget;

    setDetails({ ...details, [name]: value });
  }

  function createPassword(event: React.FormEvent) {
    event.preventDefault();

    console.log(details);

    notification({ message: "Password created successfully!" });
  }

  return (
    <AuthLayout
      page={{
        title: "Create password",
        description:
          "Submit more photos to unlock your creative potential with our photography community.",
      }}
    >
      <div className="flex flex-col items-start w-full justify-center">
        <div className="w-full flex gap-y-4 flex-col lg:px-0 px-4">
          <div className="flex justify-start items-center gap-x-2">
            <h3 className="font-medium text-2xl !leading-6 -mt-1">
              Create password
            </h3>
            <span className="font-medium text-base !leading-[22px]">•</span>
            <p className="text-base font-light !leading-[22px]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium underline underline-offset-2"
              >
                Log in
              </Link>
            </p>
          </div>

          <p className="text-light-gray-7 font-light !leading-[22px] text-base max-w-[400px] w-full">
            Create your password and login to be start uploading photos.
          </p>
        </div>

        <div className="border-b-[0.5px] border-light-gray-5 w-full md:my-11 my-8" />

        <form
          onSubmit={createPassword}
          className="max-w-lg w-full grid sm:grid-cols-2 grid-cols-1 gap-4 lg:px-0 px-4"
        >
          <Input
            label="First name"
            placeholder="Enter your first name"
            value={details.firstName}
            disabled
            readOnly
          />
          <Input
            label="Last name"
            placeholder="Enter your last name"
            value={details.lastName}
            disabled
            readOnly
          />
          <Input
            type="email"
            label="Email"
            placeholder="Enter your email address"
            value={details.email}
            disabled
            readOnly
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Create password"
            placeholder="Enter your password"
            value={details.password}
            onChange={handleChange}
            autoFocus
          />

          <Button
            type="submit"
            className="col-span-full"
            disabled={!canProceed}
          >
            Create password
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
