"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";
import { userApi } from "@/lib/api/user.api";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  userId?: number; // If provided, admin is updating. If not, user is updating self.
  onUploadSuccess?: (newUrl: string) => void;
}

export function ProfilePhotoUpload({ currentPhotoUrl, userId, onUploadSuccess }: ProfilePhotoUploadProps) {
  const { update: updateSession } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      let response;
      if (userId) {
        response = await userApi.updateUserProfilePhoto(userId, file);
      } else {
        response = await userApi.updateMyProfilePhoto(file);
        // Update session if self
        await updateSession({ image: response.data });
      }
      
      toast.success("Profile photo updated successfully");
      onUploadSuccess?.(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload profile photo");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-slate-100">
          <AvatarImage src={previewUrl || currentPhotoUrl} className="object-cover" />
          <AvatarFallback className="bg-slate-100 text-slate-400 text-2xl">
            {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : "U"}
          </AvatarFallback>
        </Avatar>
        
        <label 
          htmlFor="photo-upload" 
          className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
        >
          <Camera className="h-6 w-6" />
        </label>
        <input 
          id="photo-upload" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
      
      {previewUrl && !isUploading && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs h-7 text-slate-500"
          onClick={() => setPreviewUrl(null)}
        >
          <X className="h-3 w-3 mr-1" /> Cancel preview
        </Button>
      )}
      
      <p className="text-xs text-slate-500">
        JPG, PNG or GIF. Max size 2MB.
      </p>
    </div>
  );
}
