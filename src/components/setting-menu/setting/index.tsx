"use client";

import type React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Camera, Globe, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "../../../contexts/auth-context";

export default function UserSetting() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(
    user?.username || user?.email || "User",
  );
  const [isPublic, setIsPublic] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const { toast } = useToast();

  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Mock data
  const profileUrl =
    "https://studyon.app/dashboard/user/cmdrednmb028zomun2ec7rreu";
  const defaultBannerImage =
    "https://t3.ftcdn.net/jpg/04/12/12/98/360_F_412129819_HaLS1MLvkJBPaBPMagPUOYm1SfAcaT7h.jpg";

  const handleProfilePictureUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPG, PNG, WebP).",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfilePicture(result);
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPG, PNG, WebP).",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setBannerImage(result);
      toast({
        title: "Banner updated",
        description: "Your profile banner has been updated successfully.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = () => {
    // Handle save logic here
    toast({
      title: "Changes saved",
      description: "Your profile changes have been saved successfully.",
    });
  };

  const handleDeleteAccount = () => {
    // Handle account deletion logic here
    console.log("Deleting account...");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file inputs */}
      <input
        ref={profileInputRef}
        type="file"
        accept="image/*"
        onChange={handleProfilePictureUpload}
        className="hidden"
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        onChange={handleBannerUpload}
        className="hidden"
      />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">Settings</h1>
          <p className="text-muted-foreground">
            Manage account and website settings.
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <p className="text-muted-foreground text-sm">
                Upload a profile picture to personalize your account.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profilePicture || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => profileInputRef.current?.click()}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Choose Image
                  </Button>
                  <p className="text-muted-foreground text-xs">
                    Maximum file size: 5MB. Supported formats: JPG, PNG, WebP
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Banner */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Banner</CardTitle>
              <p className="text-muted-foreground text-sm">
                Upload a banner image for your profile page. Recommended size:
                1200x300px.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative h-32 overflow-hidden rounded-lg bg-muted">
                  <img
                    src={
                      bannerImage || defaultBannerImage || "/placeholder.svg"
                    }
                    alt="Profile banner"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Choose Banner
                  </Button>
                  <Button variant="outline">View Profile</Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  Maximum file size: 10MB. Supported formats: JPG, PNG, WebP
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Your Name */}
          <Card>
            <CardHeader>
              <CardTitle>Your Name</CardTitle>
              <p className="text-muted-foreground text-sm">
                Please enter a display name you are comfortable with.
              </p>
            </CardHeader>
            <CardContent>
              <div className="items-left flex flex-col gap-2">
                <div className="flex flex-1">
                  <Input
                    className="mr-2"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    maxLength={32}
                  />
                  <Button onClick={handleSaveChanges}>Save Changes</Button>
                </div>
                <p className="mt-1 text-muted-foreground text-xs">
                  Max 32 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Privacy</CardTitle>
              <p className="text-muted-foreground text-sm">
                Control who can view your profile and statistics.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">Public</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Anyone can view your profile and all learning statistics
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>

              {isPublic && (
                <div className="mt-4 rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground text-sm">
                    Your profile URL:{" "}
                    <span className="text-blue-600">{profileUrl}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Delete Account */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <p className="text-muted-foreground text-sm">
                This is a danger zone - Be careful!
              </p>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Permanently delete your StudyOn account. This action
                      cannot be undone and will remove all your data, progress,
                      and learning materials.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
