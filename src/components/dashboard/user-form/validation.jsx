// src/components/dashboard/user-form/validation.jsx
import { z } from "zod";

export const userFormSchema = (isRoleDisabled, isEditing) => {
  return z.object({
    name: z.string().min(1, "Full Name is required"),
    email: z.string().email("Invalid email address"), // Email should be required and valid
    role_id: (isRoleDisabled && isEditing) 
        ? z.string().optional() // Optional if disabled and editing
        : z.string().min(1, "Role is required"), // Required otherwise
    status: z.string().min(1, "Status is required"), // Enum: 'active','inActive','Blocked'
  });
};
