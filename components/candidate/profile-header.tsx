"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Pencil, MapPin, Phone, Linkedin, Briefcase, DollarSign } from "lucide-react";
import { updateProfile, uploadPhoto, type CandidateProfile, type UpdateProfileData } from "@/lib/api/candidate";
import { useToast } from "@/components/ui/use-toast";

interface ProfileHeaderProps {
  profile: CandidateProfile | null;
}

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    fullName: profile?.fullName || "",
    phone: profile?.phone || "",
    linkedin: profile?.linkedin || "",
    currentCity: profile?.currentCity || "",
    totalExperience: profile?.totalExperience ?? 0,
    currentCTC: profile?.currentCTC ?? 20,
    expectedCTC: profile?.expectedCTC ?? 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Profile updated successfully" });
      setIsEditOpen(false);
    },
    onError: (error: Error) => {
      const apiError = error as Error & ApiError;
      toast({
        title: "Error",
        description: apiError.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: uploadPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Photo uploaded successfully" });
    },
    onError: (error: Error) => {
      const apiError = error as Error & ApiError;
      toast({
        title: "Error",
        description: apiError.response?.data?.message || "Failed to upload photo",
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      uploadPhotoMutation.mutate(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "CN";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {/* Profile Photo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile?.photoUrl || ""} alt={profile?.fullName || "Candidate"} />
            <AvatarFallback className="text-2xl">{getInitials(profile?.fullName || null)}</AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 rounded-full w-8 h-8"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadPhotoMutation.isPending}
          >
            <Camera className="w-4 h-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{profile?.fullName || "Add your name"}</h2>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Pencil className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentCity">Current City</Label>
                    <Input
                      id="currentCity"
                      value={formData.currentCity}
                      onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalExperience">Total Experience (years)</Label>
                    <Input
                      id="totalExperience"
                      type="number"
                      value={formData.totalExperience}
                      onChange={(e) => setFormData({ ...formData, totalExperience: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentCTC">Current CTC (Lacs, 20 to 300)</Label>
                      <Input
                        id="currentCTC"
                        type="number"
                        value={formData.currentCTC}
                        onChange={(e) => setFormData({ ...formData, currentCTC: parseInt(e.target.value) || 20 })}
                        min="20"
                        max="300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expectedCTC">Expected CTC (Lacs, below 300)</Label>
                      <Input
                        id="expectedCTC"
                        type="number"
                        value={formData.expectedCTC}
                        onChange={(e) => setFormData({ ...formData, expectedCTC: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="299"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
            {profile?.currentCity && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile?.currentCity}
              </div>
            )}
            {profile?.totalExperience !== null && profile?.totalExperience !== undefined && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {profile?.totalExperience} years
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {profile?.currentCTC !== null && profile?.currentCTC !== undefined && (
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <DollarSign className="w-3 h-3" />
              Current CTC
            </div>
            <p className="font-semibold">{profile?.currentCTC} L</p>
          </div>
        )}
        {profile?.expectedCTC !== null && profile?.expectedCTC !== undefined && (
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <DollarSign className="w-3 h-3" />
              Expected CTC
            </div>
            <p className="font-semibold">{profile?.expectedCTC} L</p>
          </div>
        )}
        {profile?.phone && (
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Phone className="w-3 h-3" />
              Phone
            </div>
            <p className="font-semibold">{profile?.phone}</p>
          </div>
        )}
      </div>

      {profile?.linkedin && (
        <a
          href={profile?.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <Linkedin className="w-4 h-4" />
          View LinkedIn Profile
        </a>
      )}
    </div>
  );
}
