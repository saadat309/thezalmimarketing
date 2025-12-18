import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2, ArrowLeft } from "lucide-react"

export function ForgotPasswordForm({ className, ...props }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [isSent, setIsSent] = useState(false);

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process request");
      }

      setIsSent(true);
      toast.success("Reset link sent if email exists!");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.message || "An unexpected error occurred.");
    }
  };

  if (isSent) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold text-black">Check your email</h1>
          <p className="text-sm text-balance text-black/80">
            We have sent a password reset link to your email address.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link to="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-black">Forgot Password</h1>
        <p className="text-sm text-balance text-black/80">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-black">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required {...register("email")} className="bg-input text-black border-border" />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Link...
            </>
          ) : "Send Reset Link"}
        </Button>
        <div className="text-center text-sm">
          <Link to="/login" className="underline underline-offset-4 hover:text-primary text-black/80">
            Back to login
          </Link>
        </div>
      </div>
    </form>
  );
}
