import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { apiFetch } from '@/lib/apiClient';

export const Route = createFileRoute('/dashboard/profile')({
  component: DashboardProfile,
  staticData: {
    title: 'Profile',
  },
});

function DashboardProfile() {
  const { user, login, token } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Helper to get avatar URL
  const getAvatarUrl = (u) => {
    if (!u?.profile_pic) return "";
    if (u.profile_pic.startsWith('http')) return u.profile_pic;
    return u.profile_pic;
  };

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    role: '',
  });

  const [editableProfile, setEditableProfile] = useState(profile);
  const fileInputRef = useRef(null);

  // Load user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) return;
        const res = await apiFetch("/auth/me");
        if (res.ok) {
            const data = await res.json();
            const profileData = {
                name: data.name || '',
                email: data.email || '',
                bio: data.bio || '',
                avatar: getAvatarUrl(data),
                role: data.role_name || 'User', // Use role_name from API
            };
            setProfile(profileData);
            setEditableProfile(profileData);
            // Update store
            login(token, data);
        }
      } catch (e) {
        console.error("Failed to fetch profile", e);
        toast.error("Failed to load profile data");
      }
    };
    fetchProfile();
  }, [token, login]); // Added dependencies

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setEditableProfile((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditableProfile((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editableProfile.name);
      formData.append("bio", editableProfile.bio);
      
      if (selectedFile) {
        formData.append("profile_pic", selectedFile);
      }
      
      const res = await apiFetch("/auth/me", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      
      // Fetch updated profile to update store and local state
       const profileRes = await apiFetch("/auth/me");
        if (profileRes.ok) {
            const newData = await profileRes.json();
            const newProfileData = {
                name: newData.name || '',
                email: newData.email || '',
                bio: newData.bio || '',
                avatar: getAvatarUrl(newData),
                role: newData.role_name || 'User',
            };
            setProfile(newProfileData);
            setEditableProfile(newProfileData);
            login(token, newData);
            setIsEditing(false);
            setSelectedFile(null);
        }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditableProfile(profile); // Revert to original profile
    setIsEditing(false);
    setSelectedFile(null);
  };

  return (
    <div className="container px-4 py-8 mx-auto lg:px-6">
      <h1 className="mb-6 text-3xl font-bold">User Profile</h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile Details</CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>Cancel</Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar
                className={`h-20 w-20 ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={handleAvatarClick}
              >
                <AvatarImage src={editableProfile.avatar} alt={editableProfile.name} className="object-cover" />
                <AvatarFallback>{editableProfile.name ? editableProfile.name.charAt(0) : 'U'}</AvatarFallback>
              </Avatar>
              {editableProfile.role && !isEditing && (
                <Badge className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
                  {editableProfile.role}
                </Badge>
              )}
              {isEditing && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <UploadCloud className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div className="grid gap-1">
              <Label className="text-sm font-medium leading-none">
                Profile Picture
              </Label>
              {isEditing && (
                <p className="text-sm text-muted-foreground">Click the image to upload a new one.</p>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={editableProfile.name}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={editableProfile.email}
              onChange={handleInputChange}
              disabled={true} // Email is usually not editable via profile settings
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={editableProfile.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}