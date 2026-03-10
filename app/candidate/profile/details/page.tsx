"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { getProfile, updateProfile, type UpdateProfileData } from "@/lib/api/candidate";
import { useToast } from "@/components/ui/use-toast";

export default function ProfileDetailsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["candidateProfile"],
    queryFn: getProfile,
  });

  const [formData, setFormData] = useState<UpdateProfileData>({
    fullName: profile?.fullName || "",
    phone: profile?.phone || "",
    linkedin: profile?.linkedin || "",
    currentCity: profile?.currentCity || "",
    totalExperience: profile?.totalExperience || 0,
    currentCTC: profile?.currentCTC || 0,
    expectedCTC: profile?.expectedCTC || 0,
    noticePeriod: profile?.noticePeriod || 0,
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      router.push("/candidate/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/candidate/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your personal and professional information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                    pattern="[6-9][0-9]{9}"
                    title="Enter valid 10-digit Indian mobile number"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <Label htmlFor="currentCity">Current City *</Label>
                <Input
                  id="currentCity"
                  value={formData.currentCity}
                  onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                  placeholder="Mumbai"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalExperience">Total Experience (years)</Label>
                  <Input
                    id="totalExperience"
                    type="number"
                    value={formData.totalExperience}
                    onChange={(e) => setFormData({ ...formData, totalExperience: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="50"
                  />
                </div>
                <div>
                  <Label htmlFor="noticePeriod">Notice Period (days)</Label>
                  <Input
                    id="noticePeriod"
                    type="number"
                    value={formData.noticePeriod}
                    onChange={(e) => setFormData({ ...formData, noticePeriod: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="365"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentCTC">Current CTC (₹)</Label>
                  <Input
                    id="currentCTC"
                    type="number"
                    value={formData.currentCTC}
                    onChange={(e) => setFormData({ ...formData, currentCTC: parseInt(e.target.value) || 0 })}
                    min="0"
                    placeholder="1200000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter annual salary in rupees</p>
                </div>
                <div>
                  <Label htmlFor="expectedCTC">Expected CTC (₹)</Label>
                  <Input
                    id="expectedCTC"
                    type="number"
                    value={formData.expectedCTC}
                    onChange={(e) => setFormData({ ...formData, expectedCTC: parseInt(e.target.value) || 0 })}
                    min="0"
                    placeholder="1500000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter annual salary in rupees</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/candidate/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
