import { LoginForm } from '@/components/auth/login-form';
import { createFileRoute, Link } from '@tanstack/react-router';
import { MdOutlineRealEstateAgent } from "react-icons/md";

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
})

function RouteComponent() {
   return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link t0="/" className="flex items-center gap-2 font-medium">
            <div className="flex items-center justify-center bg-transparent rounded-md text-primary-foreground size-6">
              <MdOutlineRealEstateAgent className="text-primary" style={{ width: 24, height: 24 }} />
            </div>
            The Zalmi Marketing
          </Link>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
