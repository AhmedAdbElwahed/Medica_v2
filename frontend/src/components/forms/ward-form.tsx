"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wardSchema, WardValues } from "@/lib/validators/ward.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { WardDto } from "@/types/ward.types";
import { toast } from "sonner";

interface WardFormProps {
  initialData?: Partial<WardDto>;
  onSubmit: (values: WardValues) => Promise<void> | void;
  isLoading?: boolean;
  onCancel: () => void;
}

const GENDER_DESIGNATIONS = [
  { value: "MALE", label: "Male Only" },
  { value: "FEMALE", label: "Female Only" },
  { value: "MIXED", label: "Mixed Gender" },
];

export function WardForm({ initialData, onSubmit, isLoading, onCancel }: WardFormProps) {
  const form = useForm<WardValues>({
    resolver: zodResolver(wardSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      numberOfBeds: initialData?.numberOfBeds || 10,
      numberOfNurses: initialData?.numberOfNurses || 2,
      genderDesignation: initialData?.genderDesignation || "MIXED",
      active: initialData?.active ?? true,
      locked: initialData?.locked ?? false,
    },
  });

  const handleFormSubmit = async (data: WardValues) => {
    try {
      await onSubmit(data);
    } catch (error: any) {
      const responseData = error.response?.data;
      if (responseData?.code === "VALIDATION_ERROR" && typeof responseData.message === "object") {
        const fieldErrors = responseData.message;
        Object.entries(fieldErrors).forEach(([key, val]) => {
          const formKey = key === "phoneNumber" ? "phone" : key;
          form.setError(formKey as any, {
            type: "server",
            message: val as string,
          });
        });
        toast.error("Please fix the validation errors below.");
      } else {
        toast.error(responseData?.message || "Failed to submit ward details");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit as any)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control as any}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ward Name</FormLabel>
                <FormControl>
                  <Input placeholder="General ICU / Ward A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="genderDesignation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender Designation</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} items={GENDER_DESIGNATIONS}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GENDER_DESIGNATIONS.map((designation) => (
                      <SelectItem key={designation.value} value={designation.value}>
                        {designation.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input placeholder="icu@hospital.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+20 123 456 7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="numberOfBeds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Capacity (Beds)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="numberOfNurses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nursing Staff Count</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 col-span-1 md:col-span-2">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <FormDescription>
                    Whether the ward is operational and accepting staff or patients.
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

          <FormField
            control={form.control as any}
            name="locked"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 col-span-1 md:col-span-2">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Lock Ward</FormLabel>
                  <FormDescription>
                    Locking the ward suspends any new patient admissions immediately.
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

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? "Update Ward" : "Create Ward"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
