"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { getProfile, addEducation, updateEducation, deleteEducation, type AddEducationData, type UpdateEducationData } from "@/lib/api/candidate";
import { useToast } from "@/components/ui/use-toast";

export default function EducationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    degree: "",
    specialization: "",
    university: "",
    graduationYear: new Date().getFullYear(),
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["candidateProfile"],
    queryFn: getProfile,
  });

  const addMutation = useMutation({
    mutationFn: addEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Education added successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add education",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEducationData }) => updateEducation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Education updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update education",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Education deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete education",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      degree: "",
      specialization: "",
      university: "",
      graduationYear: new Date().getFullYear(),
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (edu: { id: string; degree: string; specialization: string | null; university: string; graduationYear: number }) => {
    setFormData({
      degree: edu.degree,
      specialization: edu.specialization || "",
      university: edu.university,
      graduationYear: edu.graduationYear,
    });
    setEditingId(edu.id);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      addMutation.mutate(formData as AddEducationData);
    }
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
            <CardTitle>Education</CardTitle>
            <CardDescription>Add your educational qualifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add/Edit Form */}
            {isAdding ? (
              <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="font-medium">{editingId ? "Edit Education" : "Add Education"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="degree">Degree *</Label>
                    <Input
                      id="degree"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      placeholder="Bachelor of Technology"
                      required
                      minLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="Computer Science"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="university">University/Institute *</Label>
                  <Input
                    id="university"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    placeholder="Mumbai University"
                    required
                    minLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="graduationYear">Graduation Year *</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
                    min={1950}
                    max={new Date().getFullYear() + 6}
                    required
                  />
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
                Add Education
              </Button>
            )}

            {/* Education List */}
            {profile?.education && profile.education.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Your Education ({profile.education.length})</h3>
                {profile.education.map((edu) => (
                  <div key={edu.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{edu.degree}</h4>
                        {edu.specialization && (
                          <p className="text-sm text-muted-foreground">{edu.specialization}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{edu.university}</p>
                        <p className="text-xs text-muted-foreground mt-1">Graduated: {edu.graduationYear}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(edu)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(edu.id)}
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
                <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No education added yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add your first qualification above</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
