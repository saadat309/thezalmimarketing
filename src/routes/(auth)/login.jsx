import { LoginForm } from '@/components/auth/login-form';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/(auth)/login')({
  head: () => ({
    meta: [
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
   return (
            <div className="grid min-h-svh lg:grid-cols-2 bg-primary text-black">
              <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                  <Link to="/" className="flex items-center gap-2 font-medium">
                    <img src="/Zalmi Marketing Logo White.webp" alt="The Zalmi Marketing Logo" className="h-14 w-auto" />
                  </Link>
                </div>
                <div className="flex items-center justify-center flex-1">
                  <div className="w-full max-w-xs p-6 rounded-lg shadow-lg bg-card">
                    <LoginForm />
                  </div>
                </div>
              </div>
              <div className="relative hidden bg-muted lg:block">
                <img
                  src="/login_page.webp"
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>  )
}
