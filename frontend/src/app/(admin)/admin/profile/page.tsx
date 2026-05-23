"use client";

import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfilePhotoUpload } from "@/components/shared/profile-photo-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Profile" 
        description="Manage your account settings and profile photo."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ProfilePhotoUpload currentPhotoUrl={user?.image || undefined} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={user?.name || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={user?.email || ""} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user?.role?.replace("ROLE_", "") || ""} disabled className="capitalize" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              To change your personal information, please contact the hospital administration.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
