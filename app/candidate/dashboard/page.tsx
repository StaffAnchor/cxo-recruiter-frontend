"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Badge,
  Briefcase, 
  Building2, 
  DollarSign, 
  LogOut,
  MapPin,
  Pencil
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getProfile, uploadPhoto } from "@/lib/api/candidate";
import { ProfileNavigation } from "@/components/candidate/profile-navigation";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const JOB_CATEGORIES = [
  "My Feed",
  "Banking & Finance",
  "Sales & Marketing",
  "Consulting",
  "HR & IR",
  "IT & Systems",
  "Healthcare"
];

export default function CandidateDashboard() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState("All Jobs");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["candidateProfile"],
    queryFn: getProfile,
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: uploadPhoto,
    onSuccess: (data) => {
      // Update the cache immediately with the new photo URL
      queryClient.setQueryData(["candidateProfile"], (oldData: any) => {
        if (oldData) {
          return { ...oldData, photoUrl: data.photoUrl };
        }
        return oldData;
      });
      // Also invalidate to fetch fresh data from server
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload photo",
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Photo size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    uploadPhotoMutation.mutate(file);
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getProfileInitial = () => {
    if (profile?.fullName) {
      return profile.fullName.charAt(0).toUpperCase();
    }
    return "P";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Briefcase className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">CXO Recruiter</span>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push("/candidate/jobs")}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Jobs
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/candidate/applications")}
              >
                My Applications
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/candidate/profile/details")}
              >
                Profile
              </Button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={profile?.photoUrl || ""} 
                        alt={user?.email}
                        key={profile?.photoUrl}
                        className="h-full w-full object-cover object-center"
                      />
                      <AvatarFallback>{user?.email ? getInitials(user.email) : "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{profile?.fullName || "Candidate"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src={profile?.photoUrl || ""} 
                        alt={profile?.fullName || "Profile"}
                        key={profile?.photoUrl}
                        className="h-full w-full object-cover object-center"
                      />
                      <AvatarFallback className="text-xl">{getProfileInitial()}</AvatarFallback>
                    </Avatar>
                    <label htmlFor="profile-photo-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90 transition-colors">
                      <Pencil className="w-3 h-3" />
                      <input
                        id="profile-photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={uploadPhotoMutation.isPending}
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <CardTitle>{profile?.fullName || "Your Profile"}</CardTitle>
                    <CardDescription>Keep your profile updated</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ProfileNavigation profile={profile} />
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Jobs */}
          <div className="lg:col-span-8 space-y-6">
            {/* Jobs List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedCategory === "My Feed" ? "Recommended Jobs" : selectedCategory}
                </CardTitle>
                <CardDescription>
                  Based on your profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Empty State */}
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Jobs Available Soon</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Complete your profile to get personalized job recommendations
                  </p>
                </div>

                {/* Sample Job Card (for future implementation) */}
                {/* <div className="space-y-4">
                  <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Senior Product Manager</h4>
                          <p className="text-sm text-muted-foreground">Tech Company Inc.</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              Bangalore
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ₹25-35L
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              <Briefcase className="w-3 h-3 mr-1" />
                              5-8 years
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>
                </div> */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
