"use client";

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
import { Switch } from "@/components/ui/switch";
import { Camera } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../contexts/auth-context";
import { profileAPI } from "../../../lib/api/profile";

export default function UserSetting() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(
    user?.username || user?.email || "User",
  );
  const [isPublic, setIsPublic] = useState(true);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleProfilePictureUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfilePicture(file);
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBannerImage(file);
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);

      // Kiểm tra không có gì thay đổi
      const unchangedName =
        displayName === (user?.username || user?.email || "User");
      const unchangedProfile =
        !profilePicture &&
        (!user?.imageUrl || user?.imageUrl === "/placeholder.svg");
      const unchangedBanner =
        !bannerImage &&
        (!user?.bannerUrl || user?.bannerUrl === "/placeholder.svg");

      if (unchangedName && unchangedProfile && unchangedBanner) {
        toast.info("No changes to save");
        setIsLoading(false);
        return;
      }

      if (!displayName) {
        toast.error("Please enter your display name before saving.");
        setIsLoading(false);
        return;
      }

      if (!profilePicture && !bannerImage && unchangedName) {
        toast.error(
          "Please upload a profile picture, banner or change username to save.",
        );
        setIsLoading(false);
        return;
      }

      const res = await profileAPI.updateProfile(
        profilePicture as File,
        bannerImage as File,
        displayName,
      );

      if (res) {
        if (user) {
          user.imageUrl = res.data.imageUrl;
          user.bannerUrl = res.data.bannerUrl;
          user.username = res.data.username;
        }
        localStorage.setItem("user", JSON.stringify(user));
      }
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
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
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-background">
                  <AvatarImage
                    src={
                      profilePicture
                        ? URL.createObjectURL(profilePicture)
                        : user?.imageUrl || "/placeholder.svg"
                    }
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback className="flex h-full w-full items-center justify-center bg-muted font-bold text-4xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  onClick={() => profileInputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Banner */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Banner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative h-32 overflow-hidden rounded-lg bg-muted">
                  <img
                    src={
                      bannerImage
                        ? URL.createObjectURL(bannerImage)
                        : user?.bannerUrl || "/placeholder.svg"
                    }
                    alt="Profile banner"
                    className="h-full w-full object-cover"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Choose Banner
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Your Name */}
          <Card>
            <CardHeader>
              <CardTitle>Your Name</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={32}
              />
            </CardContent>
          </Card>

          {/* Profile Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Public</span>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end">
            <Button size="lg" onClick={handleSaveChanges} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                "Save All Changes"
              )}
            </Button>
          </div>

          {/* Delete Account */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount}>
                      Delete
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
