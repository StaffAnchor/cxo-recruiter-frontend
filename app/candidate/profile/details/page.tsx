"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { getProfile, updateProfile, type UpdateProfileData } from "@/lib/api/candidate";
import { useToast } from "@/components/ui/use-toast";

const MAJOR_INDIAN_CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Bhopal",
  "Patna",
  "Chandigarh",
  "Bhubaneswar",
  "Kochi",
  "Visakhapatnam",
] as const;

const OTHER_CITY_OPTION = "OTHER";

const CITY_VARIANTS: Record<string, (typeof MAJOR_INDIAN_CITIES)[number]> = {
  bangalore: "Bengaluru",
  bengaluru: "Bengaluru",
  delhi: "Delhi",
  mumbai: "Mumbai",
  hyderabad: "Hyderabad",
  chennai: "Chennai",
  kolkata: "Kolkata",
  pune: "Pune",
  ahmedabad: "Ahmedabad",
  jaipur: "Jaipur",
  surat: "Surat",
  lucknow: "Lucknow",
  kanpur: "Kanpur",
  nagpur: "Nagpur",
  indore: "Indore",
  bhopal: "Bhopal",
  patna: "Patna",
  chandigarh: "Chandigarh",
  bhubaneswar: "Bhubaneswar",
  kochi: "Kochi",
  visakhapatnam: "Visakhapatnam",
};

const normalizeCurrentCity = (city: string | null | undefined): string => {
  const trimmedCity = city?.trim() || "";
  if (!trimmedCity) {
    return "";
  }

  const canonicalCity = CITY_VARIANTS[trimmedCity.toLowerCase()];
  return canonicalCity || trimmedCity;
};

export default function ProfileDetailsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["candidateProfile"],
    queryFn: getProfile,
  });

  const [formData, setFormData] = useState<UpdateProfileData>({
    fullName: "",
    dob: "",
    gender: undefined,
    phone: "",
    linkedin: "",
    preferredLocations: [],
    currentCity: "",
    totalExperience: 10,
    currentCTC: 20,
    currentAnnualFixedCTC: 20,
    expectedCTC: 0,
  });
  const [selectedCurrentCity, setSelectedCurrentCity] = useState<string>("");
  const [customCurrentCity, setCustomCurrentCity] = useState<string>("");

  const formatDate = (value: string | null | undefined): string => {
    if (!value) {
      return "Not provided";
    }

    return new Date(value).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatGender = (value: string | null | undefined): string => {
    if (!value) {
      return "Not provided";
    }

    return value
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const resetFormFromProfile = useCallback(() => {
    if (!profile) {
      return;
    }

    const normalizedProfileCity = normalizeCurrentCity(profile.currentCity);

    setFormData({
      fullName: profile.fullName || "",
      dob: profile.dob ? profile.dob.split("T")[0] : "",
      gender: profile.gender || undefined,
      phone: profile.phone || "",
      linkedin: profile.linkedin || "",
      preferredLocations: profile.preferredLocations || [],
      currentCity: normalizedProfileCity,
      totalExperience: profile.totalExperience ?? 10,
      currentCTC: profile.currentCTC ?? 20,
      currentAnnualFixedCTC: profile.currentAnnualFixedCTC ?? 20,
      expectedCTC: profile.expectedCTC ?? 0,
    });

    if (!normalizedProfileCity) {
      setSelectedCurrentCity("");
      setCustomCurrentCity("");
    } else if (
      MAJOR_INDIAN_CITIES.includes(normalizedProfileCity as (typeof MAJOR_INDIAN_CITIES)[number])
    ) {
      setSelectedCurrentCity(normalizedProfileCity);
      setCustomCurrentCity("");
    } else {
      setSelectedCurrentCity(OTHER_CITY_OPTION);
      setCustomCurrentCity(normalizedProfileCity);
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetFormFromProfile();
  }, [profile, resetFormFromProfile]);

  const handleAddPreferredLocation = (selectedLocation: string) => {
    if (!selectedLocation) {
      return;
    }

    const currentPreferredLocations = formData.preferredLocations || [];

    if (currentPreferredLocations.includes(selectedLocation)) {
      toast({
        title: "Already added",
        description: "This preferred location is already selected.",
        variant: "destructive",
      });
      return;
    }

    if (currentPreferredLocations.length >= 5) {
      toast({
        title: "Limit reached",
        description: "You can add up to 5 preferred locations.",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      preferredLocations: [...currentPreferredLocations, selectedLocation],
    });
  };

  const handleRemovePreferredLocation = (locationToRemove: string) => {
    setFormData({
      ...formData,
      preferredLocations: (formData.preferredLocations || []).filter(
        (location) => location !== locationToRemove
      ),
    });
  };

  const preferredLocations = formData.preferredLocations || [];
  const hasReachedPreferredLocationLimit = preferredLocations.length >= 5;

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["candidateProfile"], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
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

    if (!formData.currentCity?.trim()) {
      toast({
        title: "Current city required",
        description: "Please select your current city. If not listed, choose Other and mention it.",
        variant: "destructive",
      });
      return;
    }

    const payload: UpdateProfileData = {
      ...formData,
      dob: formData.dob || undefined,
      preferredLocations: (formData.preferredLocations || []).slice(0, 5),
    };

    updateMutation.mutate(payload);
  };

  const handleCancelEdit = () => {
    resetFormFromProfile();
    setIsEditing(false);
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>
                  {isEditing ? "Update your personal and professional information" : "View your personal and professional information"}
                </CardDescription>
              </div>
              {!isEditing && (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
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
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob || ""}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY") =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                      <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Select
                  value={selectedCurrentCity}
                  onValueChange={(value) => {
                    setSelectedCurrentCity(value);

                    if (value === OTHER_CITY_OPTION) {
                      setFormData({ ...formData, currentCity: customCurrentCity });
                      return;
                    }

                    setCustomCurrentCity("");
                    setFormData({ ...formData, currentCity: value });
                  }}
                >
                  <SelectTrigger id="currentCity">
                    <SelectValue placeholder="Select your current city" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAJOR_INDIAN_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                    <SelectItem value={OTHER_CITY_OPTION}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedCurrentCity === OTHER_CITY_OPTION && (
                <div>
                  <Label htmlFor="customCurrentCity">Mention City *</Label>
                  <Input
                    id="customCurrentCity"
                    value={customCurrentCity}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomCurrentCity(value);
                      setFormData({ ...formData, currentCity: value });
                    }}
                    placeholder="Enter your city"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="preferredLocations">Preferred Locations (up to 5)</Label>
                <div className="flex gap-2">
                  <Select
                    value=""
                    onValueChange={handleAddPreferredLocation}
                    disabled={hasReachedPreferredLocationLimit}
                  >
                    <SelectTrigger id="preferredLocations" className="flex-1">
                      <SelectValue placeholder="Select preferred city" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAJOR_INDIAN_CITIES.map((city) => (
                        <SelectItem
                          key={city}
                          value={city}
                          disabled={preferredLocations.includes(city)}
                        >
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Select city from dropdown. It gets added instantly. Maximum 5 locations can be selected.
                </p>
                {hasReachedPreferredLocationLimit && (
                  <p className="text-xs text-amber-600 mt-1">
                    You have selected 5 preferred locations. Remove one to add another.
                  </p>
                )}
                {preferredLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {preferredLocations.map((location) => (
                      <div
                        key={location}
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                      >
                        <span>{location}</span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemovePreferredLocation(location)}
                          aria-label={`Remove ${location}`}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="totalExperience">Total Experience (years, min 10)</Label>
                <Input
                  id="totalExperience"
                  type="number"
                  value={formData.totalExperience}
                  onChange={(e) => setFormData({ ...formData, totalExperience: parseInt(e.target.value) || 10 })}
                  min="10"
                  max="50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentCTC">Current CTC (Lacs, min 20)</Label>
                  <Input
                    id="currentCTC"
                    type="number"
                    value={formData.currentCTC}
                    onChange={(e) =>
                      setFormData({ ...formData, currentCTC: parseInt(e.target.value) || 20 })
                    }
                    min="20"
                    max="300"
                    placeholder="20"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter annual salary in lacs</p>
                </div>
                <div>
                  <Label htmlFor="currentAnnualFixedCTC">Current Annual Fixed CTC (Lacs)</Label>
                  <Input
                    id="currentAnnualFixedCTC"
                    type="number"
                    value={formData.currentAnnualFixedCTC}
                    onChange={(e) =>
                      setFormData({ ...formData, currentAnnualFixedCTC: parseInt(e.target.value) || 20 })
                    }
                    placeholder="20"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter annual fixed salary in lacs</p>
                </div>
                <div>
                  <Label htmlFor="expectedCTC">Expected CTC (Lacs)</Label>
                  <Input
                    id="expectedCTC"
                    type="number"
                    value={formData.expectedCTC}
                    onChange={(e) => setFormData({ ...formData, expectedCTC: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="299"
                    placeholder="30"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter annual salary in lacs</p>
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
                  onClick={handleCancelEdit}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile?.fullName || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">{formatDate(profile?.dob)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile?.phone || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">{formatGender(profile?.gender)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>LinkedIn Profile</Label>
                  {profile?.linkedin ? (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm inline-block py-2 px-3 bg-muted rounded-md text-blue-600 hover:underline"
                    >
                      {profile.linkedin}
                    </a>
                  ) : (
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">Not provided</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current City</Label>
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile?.currentCity || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Total Experience</Label>
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile?.totalExperience ?? "Not provided"}{profile?.totalExperience !== null && profile?.totalExperience !== undefined ? " years" : ""}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Locations</Label>
                  {profile?.preferredLocations && profile.preferredLocations.length > 0 ? (
                    <div className="flex flex-wrap gap-2 py-2 px-3 bg-muted rounded-md">
                      {profile.preferredLocations.map((location) => (
                        <span
                          key={location}
                          className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs"
                        >
                          {location}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">Not provided</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Current CTC</Label>
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">
                      {profile?.currentCTC !== null && profile?.currentCTC !== undefined ? `${profile.currentCTC} Lacs` : "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Annual Fixed CTC</Label>
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">
                      {profile?.currentAnnualFixedCTC !== null && profile?.currentAnnualFixedCTC !== undefined ? `${profile.currentAnnualFixedCTC} Lacs` : "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Expected CTC</Label>
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">
                      {profile?.expectedCTC !== null && profile?.expectedCTC !== undefined ? `${profile.expectedCTC} Lacs` : "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Profile Created</Label>
                    <p className="text-sm">{formatDate(profile?.createdAt)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <p className="text-sm">{formatDate(profile?.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
