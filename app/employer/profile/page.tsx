"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft
} from "lucide-react";
import { getEmployerProfile, updateEmployerProfile, type EmployerProfile, type UpdateEmployerProfileData } from "@/lib/api/employer";
import { useToast } from "@/components/ui/use-toast";
import { EmployerNavbar } from "@/components/employer/employer-navbar";

export default function EmployerProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    location: "",
    companySize: "",
    gstNumber: "",
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getEmployerProfile();
        setProfile(data);
        setFormData({
          fullName: data.fullName || "",
          companyName: data.companyName || "",
          location: data.location || "",
          companySize: data.companySize || "",
          gstNumber: data.gstNumber || "",
        });
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to fetch profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.fullName && formData.fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (formData.companyName.length < 2) {
      newErrors.companyName = "Company name must be at least 2 characters";
    }

    if (formData.location && formData.location.length < 2) {
      newErrors.location = "Location must be at least 2 characters";
    }

    if (formData.companySize && formData.companySize.length < 2) {
      newErrors.companySize = "Company size must be at least 2 characters";
    }

    if (formData.gstNumber) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(formData.gstNumber)) {
        newErrors.gstNumber = "Invalid GST number format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      // Only send fields that have changed
      const updates: UpdateEmployerProfileData = {};
      if (formData.fullName !== profile?.fullName) updates.fullName = formData.fullName;
      if (formData.companyName !== profile?.companyName) updates.companyName = formData.companyName;
      if (formData.location !== profile?.location) updates.location = formData.location;
      if (formData.companySize !== profile?.companySize) updates.companySize = formData.companySize;
      if (formData.gstNumber !== profile?.gstNumber) updates.gstNumber = formData.gstNumber;

      const updatedProfile = await updateEmployerProfile(updates);
      setProfile(updatedProfile);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        companyName: profile.companyName || "",
        location: profile.location || "",
        companySize: profile.companySize || "",
        gstNumber: profile.gstNumber || "",
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const renderStatusBadge = () => {
    if (!profile) return null;
    
    switch (profile.status) {
      case "APPROVED":
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending Approval</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Navbar */}
      <EmployerNavbar companyName={profile?.companyName} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => router.push("/employer/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Company Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your company information</p>
            </div>
            {renderStatusBadge()}
          </div>
        </div>

        {/* Status Alert */}
        {profile?.status === "PENDING" && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center text-base">
                <Clock className="w-5 h-5 mr-2" />
                Account Pending Approval
              </CardTitle>
              <CardDescription className="text-yellow-700 text-sm">
                Your profile is under review. You can still update your information while we review your account.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {profile?.status === "REJECTED" && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center text-base">
                <XCircle className="w-5 h-5 mr-2" />
                Account Rejected
              </CardTitle>
              <CardDescription className="text-red-700 text-sm">
                Your account application was not approved. Please contact support for more information.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  {isEditing ? "Update your company details" : "View your company profile"}
                </CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                {isEditing ? (
                  <div>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Enter your full name"
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">
                    {profile?.fullName || "Not provided"}
                  </p>
                )}
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                {isEditing ? (
                  <div>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      placeholder="Enter company name"
                      className={errors.companyName ? "border-red-500" : ""}
                      required
                    />
                    {errors.companyName && (
                      <p className="text-sm text-red-500 mt-1">{errors.companyName}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">
                    {profile?.companyName || "Not provided"}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <div>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="e.g., Mumbai, Maharashtra"
                      className={errors.location ? "border-red-500" : ""}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500 mt-1">{errors.location}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">
                    {profile?.location || "Not provided"}
                  </p>
                )}
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                {isEditing ? (
                  <div>
                    <Input
                      id="companySize"
                      value={formData.companySize}
                      onChange={(e) => handleInputChange("companySize", e.target.value)}
                      placeholder="e.g., 50-100 employees"
                      className={errors.companySize ? "border-red-500" : ""}
                    />
                    {errors.companySize && (
                      <p className="text-sm text-red-500 mt-1">{errors.companySize}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">
                    {profile?.companySize || "Not provided"}
                  </p>
                )}
              </div>

              {/* GST Number */}
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                {isEditing ? (
                  <div>
                    <Input
                      id="gstNumber"
                      value={formData.gstNumber}
                      onChange={(e) => handleInputChange("gstNumber", e.target.value.toUpperCase())}
                      placeholder="e.g., 22AAAAA0000A1Z5"
                      className={errors.gstNumber ? "border-red-500" : ""}
                    />
                    {errors.gstNumber && (
                      <p className="text-sm text-red-500 mt-1">{errors.gstNumber}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Format: 15 characters (e.g., 22AAAAA0000A1Z5)
                    </p>
                  </div>
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">
                    {profile?.gstNumber || "Not provided"}
                  </p>
                )}
              </div>

              {/* Account Status (Read-only) */}
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="py-2">
                  {renderStatusBadge()}
                </div>
              </div>

              {/* Created/Updated dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="text-sm">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p className="text-sm">
                    {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
