import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/views/ui/card";
import { SignupForm } from "@/components/features";
import Footer from "@/components/views/login/Login-Footer";
import { Nav } from "@/components/views/login/Login-Nav";

export default function Signup() {
  return (
    <div className="flex flex-col min-h-screen overflow-none">
      <Nav />
      <div className="flex flex-grow justify-center items-center p-3">
        <Card className="mx-auto max-w-md border-none shadow-none">
          <CardHeader>
            {/* <CardDescription>
              Enter your information to create an account
            </CardDescription> */}
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}