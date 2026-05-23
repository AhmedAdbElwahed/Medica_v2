"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DoctorDto, Specialty } from "@/types/doctor.types";
import { useQuery } from "@tanstack/react-query";
import { wardApi } from "@/lib/api/ward.api";
import { Loader2 } from "lucide-react";
import { ProfilePhotoUpload } from "@/components/shared/profile-photo-upload";

const SPECIALTIES: Specialty[] = [
  "GENERAL_PRACTICE", "PEDIATRICS", "CARDIOLOGY", "NEUROLOGY",
  "ONCOLOGY", "ORTHOPEDICS", "DERMATOLOGY", "PSYCHIATRY", 
  "OPHTHALMOLOGY", "RADIOLOGY", "GINECOLOGY", "UROLOGY", 
  "GASTROENTEROLOGY", "PULMONOLOGY"
];

const SPECIALTY_ITEMS = SPECIALTIES.map((s) => ({
  value: s,
  label: s.replace("_", " "),
}));

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  specialty: z.enum(SPECIALTIES as [string, ...string[]]),
  education: z.string().min(10, "Education details are required"),
  certifications: z.string().min(5, "Certifications are required"),
  yearsOfExperience: z.coerce.number().min(0, "Years of experience cannot be negative"),
  licenseNumber: z.string().min(5, "License number is required"),
  workStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  workEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  activeStatus: z.boolean().default(true),
  wardId: z.coerce.number().positive("Please select a ward"),
});

type DoctorFormValues = z.infer<typeof formSchema>;

interface DoctorFormProps {
  initialData?: Partial<DoctorDto>;
  onSubmit: (values: DoctorFormValues) => void;
  isLoading?: boolean;
}

const formatTimeToHHmm = (timeString?: string) => {
  if (!timeString) return "";
  // If format is HH:mm:ss, slice it to HH:mm
  if (timeString.length === 8 && timeString.includes(":")) {
    return timeString.slice(0, 5);
  }
  return timeString;
};

export function DoctorForm({ initialData, onSubmit, isLoading }: DoctorFormProps) {
  const { data: wardsPage, isLoading: isLoadingWards } = useQuery({
    queryKey: ["wards"],
    queryFn: () => wardApi.getAll(),
  });

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      specialty: initialData?.specialty || "GENERAL_PRACTICE",
      education: initialData?.education || "",
      certifications: initialData?.certifications || "",
      yearsOfExperience: initialData?.yearsOfExperience || 0,
      licenseNumber: initialData?.licenseNumber || "",
      workStartTime: formatTimeToHHmm(initialData?.workStartTime) || "09:00",
      workEndTime: formatTimeToHHmm(initialData?.workEndTime) || "17:00",
      activeStatus: initialData?.activeStatus ?? true,
      wardId: initialData?.wardId || undefined,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {initialData?.id && (
          <div className="flex justify-center pb-6 border-b">
            <div className="space-y-4 text-center">
              <FormLabel className="text-base">Profile Photo</FormLabel>
              <ProfilePhotoUpload 
                currentPhotoUrl={initialData.profilePhotoUrl} 
                userId={initialData.id}
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@medica.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} items={SPECIALTY_ITEMS}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SPECIALTIES.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Ward</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value?.toString()}
                      disabled={isLoadingWards}
                      items={wardsPage?.data.content.map((ward) => ({
                        value: ward.id.toString(),
                        label: `Ward #${ward.id} (${ward.genderDesignation.toLowerCase().split("_")[0]})`,
                      }))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingWards ? "Loading wards..." : "Select ward"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wardsPage?.data.content.map((ward) => (
                          <SelectItem key={ward.id} value={ward.id.toString()}>
                            Ward #{ward.id} ({ward.genderDesignation.toLowerCase().split("_")[0]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Professional Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="LIC-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>Format: HH:mm</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>Format: HH:mm</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="activeStatus"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Doctor is currently working and can accept appointments.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium">Education & Certifications</h3>
          <FormField
            control={form.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Education</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe educational background, degrees, universities..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="certifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certifications</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="List relevant medical certifications, board approvals..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Doctor" : "Create Doctor"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
