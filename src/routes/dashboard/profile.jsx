import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Import Badge component

export const Route = createFileRoute('/dashboard/profile')({
  component: DashboardProfile,
  staticData: {
    title: 'Profile',
  },
});

function DashboardProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'A passionate real estate agent helping clients find their dream homes.',
    avatar: 'https://github.com/shadcn.png', // Example avatar
    role: 'Admin', // Add user role
  });
  const [editableProfile, setEditableProfile] = useState(profile);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setEditableProfile((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const handleSave = () => {
    setProfile(editableProfile);
    setIsEditing(false);
    // In a real application, you would send this data to your backend API
    console.log('Profile saved:', editableProfile);
  };

  const handleCancel = () => {
    setEditableProfile(profile); // Revert to original profile
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 lg:px-6">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile Details</CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
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
                <AvatarImage src={editableProfile.avatar} alt={editableProfile.name} />
                <AvatarFallback>{editableProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              {editableProfile.role && !isEditing && ( // Conditionally render badge if role exists and not editing
                <Badge className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
                  {editableProfile.role}
                </Badge>
              )}
              {isEditing && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <UploadCloud className="h-8 w-8 text-white" />
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
