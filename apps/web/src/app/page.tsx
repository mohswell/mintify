import { Nav } from '@/components/login/Login-Nav';
import Footer from '@/components/login/Login-Footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import LoginForm from '@/components/login/Login-Form';

export default function Login() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <div className="flex flex-grow justify-center items-center p-4">
        <Card className="mx-auto max-w-md border-none shadow-none">
          <CardHeader>
            {/* <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription> */}
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}