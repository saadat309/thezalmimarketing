// src/components/dashboard/user-form/user-form.jsx
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { userFormSchema } from "./validation"; // Update to import the function
import { useAuthStore } from "@/store/authStore"; // Added import
import { Loader2 } from "lucide-react";

export default function UserForm({ initialData, onSuccess, onCancel, isSubmitting }) {
  const { user: currentUser } = useAuthStore(); // Get current user directly
  const [roles, setRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const isCEO = currentUser?.role_name?.toLowerCase() === 'ceo';
  const isEditing = !!initialData;
  const isSelf = initialData && String(initialData.id) === String(currentUser?.id);

  // Role Field Disabled Logic
  // 1. User cannot change their own role.
  // 2. Only CEO can change user roles (so Admin cannot change role in Edit mode).
  const isRoleDisabled = isSelf || (isEditing && !isCEO);

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inActive', label: 'Inactive' },
    { value: 'Blocked', label: 'Blocked' },
  ];

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema(isRoleDisabled, isEditing)), // Call the schema function
    defaultValues: {
      name: "",
      email: "",
      role_id: initialData?.role_id ? String(initialData.role_id) : "", 
      status: "inActive", 
      ...(initialData || {}),
    },
  });

  useEffect(() => {
    // Fetch roles from API
    const fetchRoles = async () => {
      setIsLoadingRoles(true);
      try {
        const response = await fetch("/api/roles", {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
            "X-Auth-Token": useAuthStore.getState().token
          },
        }); 
        if (!response.ok) throw new Error('Failed to fetch roles');
        const data = await response.json();
        
        // Filter roles for non-CEOs (Admins cannot assign CEO role)
        const filteredRoles = isCEO ? data : data.filter(r => r.name.toLowerCase() !== 'ceo');
        setRoles(filteredRoles);

        // If adding a new user AND role_id is currently empty, set a default
        // Use setValue instead of reset for partial updates
        if (!isEditing && filteredRoles.length > 0 && !initialData?.role_id) { // Only set if initialData didn't provide one
            setValue('role_id', String(filteredRoles[0].id));
        }

        // NEW: If editing and role is disabled, re-assert the role_id after roles are loaded
        // This addresses the field.value becoming empty after roles are set
        if (isEditing && isRoleDisabled && initialData?.role_id && filteredRoles.length > 0) {
            const foundRole = filteredRoles.find(r => String(r.id) === String(initialData.role_id));
            if (foundRole) {
                setValue('role_id', String(initialData.role_id));
            }
        }


      } catch (error) {
        console.error("Error loading roles:", error);
        toast.error("Failed to load roles for selection");
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [isCEO, isEditing, setValue, initialData]); // Added setValue to dependency array

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        role_id: initialData.role_id ? String(initialData.role_id) : "",
        status: initialData.status,
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        role_id: "",
        status: "inActive",
      });
    }
  }, [initialData, reset]); // Removed isRoleDisabled and setValue from dependencies 


  const onSubmit = (data) => {
    // If the role field is disabled, ensure the original role_id from initialData is used
    if (isRoleDisabled && initialData?.role_id && (!data.role_id || data.role_id === "")) {
      data.role_id = String(initialData.role_id);
    }
    onSuccess(data);
  };

  const onError = (formErrors) => {
    console.error("Form errors:", formErrors);
    toast.error("Form validation failed. Please check your inputs.");
  };

  return (
    <div className="max-w-2xl p-6 mx-auto space-y-8">
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? "Edit User" : "Add New User"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
              <Input id="name" placeholder="Full Name" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input id="email" type="email" placeholder="Email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_id">Role <span className="text-red-500">*</span></Label>
              <Controller
                name="role_id"
                control={control}
                render={({ field }) => {
                  return (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingRoles || isRoleDisabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingRoles ? "Loading roles..." : "Select a role"} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  );
                }} // <-- Corrected: Added missing closing curly brace here
              />
              {errors.role_id && <p className="text-sm text-red-500">{errors.role_id.message}</p>}
              {isRoleDisabled && <p className="text-xs text-muted-foreground">You cannot change this user's role.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 flex gap-3 p-6 border-t bg-background">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save User
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}