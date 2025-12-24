import { InviteAcceptForm } from '@/components/auth/invite-accept-form';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { z } from "zod";

export const Route = createFileRoute('/(auth)/accept-invite')({
  head: () => ({
    meta: [
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: RouteComponent,
  validateSearch: (search) => {
    return z.object({
      token: z.string().min(1, "Invite token is missing."),
      email: z.string().email("Invalid email in invite link."),
    }).parse(search);
  },
});

function RouteComponent() {
  const { token, email } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid invite link. Missing token or email.");
      navigate({ to: '/login' }); // Redirect to login if invite link is malformed
    }
  }, [token, email, navigate]);

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
            <InviteAcceptForm email={email} token={token} />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/invite_page.webp"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}