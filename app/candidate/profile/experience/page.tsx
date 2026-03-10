"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProfile, addExperience, updateExperience, deleteExperience, type AddExperienceData, type UpdateExperienceData } from "@/lib/api/candidate";
import { useToast } from "@/components/ui/use-toast";

export default function ExperiencePage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["candidateProfile"],
    queryFn: getProfile,
  });

  const addMutation = useMutation({
    mutationFn: addExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Experience added successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add experience",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExperienceData }) => updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Experience updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update experience",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Experience deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete experience",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      companyName: "",
      role: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (exp: { id: string; companyName: string; role: string; startDate: string; endDate: string | null; currentlyWorking: boolean }) => {
    setFormData({
      companyName: exp.companyName,
      role: exp.role,
      startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : "",
      endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : "",
      currentlyWorking: exp.currentlyWorking,
    });
    setEditingId(exp.id);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: AddExperienceData = {
      companyName: formData.companyName,
      role: formData.role,
      startDate: new Date(formData.startDate).toISOString(),
      currentlyWorking: formData.currentlyWorking,
    };

    if (!formData.currentlyWorking && formData.endDate) {
      data.endDate = new Date(formData.endDate).toISOString();
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      addMutation.mutate(data);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const calculateDuration = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return years > 0 ? `${years}y ${remainingMonths}m` : `${remainingMonths}m`;
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
            <CardTitle>Work Experience</CardTitle>
            <CardDescription>Add your professional work experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add/Edit Form */}
            {isAdding ? (
              <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="font-medium">{editingId ? "Edit Experience" : "Add Experience"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Tech Corp"
                      required
                      minLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role/Position *</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="Software Engineer"
                      required
                      minLength={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      disabled={formData.currentlyWorking}
                      required={!formData.currentlyWorking}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="currentlyWorking"
                    checked={formData.currentlyWorking}
                    onChange={(e) => {
                      setFormData({ ...formData, currentlyWorking: e.target.checked, endDate: "" });
                    }}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="currentlyWorking" className="cursor-pointer">
                    I currently work here
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Update" : "Add"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            )}

            {/* Experience List */}
            {profile?.experience && profile.experience.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Your Experience ({profile.experience.length})</h3>
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{exp.role}</h4>
                          {exp.currentlyWorking && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{exp.companyName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(exp.startDate)} - {exp.currentlyWorking ? "Present" : formatDate(exp.endDate!)} · {calculateDuration(exp.startDate, exp.endDate)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(exp)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(exp.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No experience added yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add your first work experience above</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
