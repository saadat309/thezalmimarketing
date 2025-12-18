import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { useAuthStore } from "@/store/authStore"
import { useNavigate, Link } from "@tanstack/react-router"
import { toast } from "sonner" // For toast notifications
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export function LoginForm({
  className,
  ...props
}) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate({ from: '/login' });
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Login failed with status: ${response.status}`);
      }

      const responseData = await response.json();
      login(responseData.token, responseData.user); // Store token and user data
      toast.success("Login successful!");
      navigate({ to: '/dashboard' });
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "An unexpected error occurred during login.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-black">Login to your account</h1>
        <p className="text-sm text-balance text-black/80">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-black">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required {...register("email")} className="bg-input text-black border-border" />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password" className="text-black">Password</Label>
            <Link to="/forgot-password" size="sm" className="ml-auto text-sm underline-offset-4 hover:underline text-black/80">
              Forgot your password?
            </Link>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              required 
              {...register("password")} 
              className="bg-input text-black border-border pr-10" 
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-black/60" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4 text-black/60" aria-hidden="true" />
              )}
              <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
            </Button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </div>
    </form>
  );
}
