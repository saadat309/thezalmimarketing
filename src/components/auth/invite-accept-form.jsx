import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils"; // Re-added cn import
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Assuming toast is used for notifications
import { useNavigate } from "@tanstack/react-router"; // For redirection
import { Eye, EyeOff } from "lucide-react";

// Zod schema for invite acceptance form
const inviteAcceptFormSchema = z.object({
  name: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  token: z.string().min(1, "Token is required"),
});

export function InviteAcceptForm({ className, email: propEmail, token: propToken, ...props }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(inviteAcceptFormSchema),
    defaultValues: {
      name: "",
      email: propEmail || "",
      password: "",
      token: propToken || "",
    },
  });

  useEffect(() => {
    if (propEmail) setValue("email", propEmail);
    if (propToken) setValue("token", propToken);
  }, [propEmail, propToken, setValue]);

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      toast.success("Account activated successfully! You can now log in.");
      navigate({ to: '/login' }); // Redirect to login page
    } catch (e) {
      console.error("Invite acceptance error:", e);
      toast.error(e.message || "Failed to activate account.");
    }
  };

  const onError = (formErrors) => {
    console.error("Form validation failed:", formErrors);
    toast.error("Please correct the errors in the form.");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className={cn(className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold text-black">
            Activate Your Account
          </h1>
          <p className="text-sm text-black/80 text-balance">
            Set your name and password to activate your account.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email" className="text-black/80">
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
            readOnly
            className="bg-input text-foreground border-border"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="name" className="text-black/80">
            Full Name
          </FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            {...register("name")}
            className="bg-input text-foreground border-border"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password" className="text-black/80">
            Password
          </FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="bg-input text-foreground border-border pr-10"
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
          <FieldDescription className="text-black/80">
            Must be at least 8 characters long.
          </FieldDescription>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </Field>

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Activating..." : "Activate Account"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
