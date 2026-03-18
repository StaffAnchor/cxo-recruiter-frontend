"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { getProfile, addEducation, updateEducation, deleteEducation, type AddEducationData, type UpdateEducationData } from "@/lib/api/candidate";
import { useToast } from "@/components/ui/use-toast";
import { useMetaStore } from "@/lib/meta-store";
import { SearchableSelect } from "@/components/ui/searchable-select";

const INSTITUTE_TYPE_COLORS: Record<string, string> = {
  IIT: "bg-blue-100 text-blue-700",
  IIM: "bg-green-100 text-green-700",
  TIER1: "bg-purple-100 text-purple-700",
  OTHER: "bg-gray-100 text-gray-600",
};

type FormData = {
  degreeId: string;
  specializationId: string;
  instituteId: string;
  customInstituteName: string;
  graduationYear: number;
};

export default function EducationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    degreeId: "",
    specializationId: "",
    instituteId: "",
    customInstituteName: "",
    graduationYear: new Date().getFullYear(),
  });

  const { degrees, institutes, loadDegrees, loadInstitutes } = useMetaStore();

  useEffect(() => {
    loadDegrees();
    loadInstitutes();
  }, [loadDegrees, loadInstitutes]);

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
        description: error.message || "Failed to add education",
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
        description: error.message || "Failed to update education",
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
        description: error.message || "Failed to delete education",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({ degreeId: "", specializationId: "", instituteId: "", customInstituteName: "", graduationYear: new Date().getFullYear() });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (edu: { id: string; degreeId: string | null; specializationId: string | null; instituteId: string | null; graduationYear: number; instituteName?: string | null }) => {
    const customName = edu.instituteName?.trim() ?? "";
    const isCustomInstitute = customName.length > 0;
    setFormData({
      degreeId: edu.degreeId ?? "",
      specializationId: edu.specializationId ?? "",
      instituteId: isCustomInstitute ? (otherInstituteId || edu.instituteId || "") : (edu.instituteId ?? ""),
      customInstituteName: isCustomInstitute ? customName : "",
      graduationYear: edu.graduationYear,
    });
    setEditingId(edu.id);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCustom = selectedInstituteType === "OTHER";
    const payload: AddEducationData = {
      degreeId: formData.degreeId,
      graduationYear: formData.graduationYear,
      ...(formData.specializationId && { specializationId: formData.specializationId }),
      instituteId: formData.instituteId,
      ...(isCustom && formData.customInstituteName.trim()
        ? { customInstituteName: formData.customInstituteName.trim() }
        : {}),
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  // Derive dropdown options
  const degreeOptions = degrees.map((d) => ({ value: d.id, label: d.name }));
  const selectedDegree = degrees.find((d) => d.id === formData.degreeId);
  const specializationOptions = selectedDegree?.specializations.map((s) => ({ value: s.id, label: s.name })) ?? [];
  const instituteOptions = institutes.map((i) => ({ value: i.id, label: i.name, meta: i.type }));
  const otherInstituteId = institutes.find((i) => i.type === "OTHER")?.id ?? "";
  const selectedInstituteType = institutes.find((i) => i.id === formData.instituteId)?.type;

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
                    <Label>Degree *</Label>
                    <SearchableSelect
                      options={degreeOptions}
                      value={formData.degreeId}
                      onChange={(v) =>
                        setFormData((prev) => ({ ...prev, degreeId: v, specializationId: "" }))
                      }
                      placeholder="Select degree"
                    />
                  </div>
                  <div>
                    <Label>Specialization</Label>
                    <SearchableSelect
                      options={specializationOptions}
                      value={formData.specializationId}
                      onChange={(v) => setFormData((prev) => ({ ...prev, specializationId: v }))}
                      placeholder={
                        !formData.degreeId
                          ? "Select degree first"
                          : specializationOptions.length === 0
                          ? "No specializations"
                          : "Select specialization"
                      }
                      disabled={!formData.degreeId || specializationOptions.length === 0}
                    />
                  </div>
                </div>

                <div>
                  <Label>Institute *</Label>
                  <SearchableSelect
                    options={instituteOptions}
                    value={formData.instituteId}
                    onChange={(v) => {
                      const selectedType = institutes.find((i) => i.id === v)?.type;
                      setFormData((prev) => ({
                        ...prev,
                        instituteId: v,
                        customInstituteName: selectedType === "OTHER" ? prev.customInstituteName : "",
                      }));
                    }}
                    placeholder="Search and select institute..."
                  />
                  {selectedInstituteType === "OTHER" && (
                    <div className="mt-2">
                      <Input
                        autoFocus
                        value={formData.customInstituteName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, customInstituteName: e.target.value }))
                        }
                        placeholder="Enter your institute name"
                        minLength={2}
                        maxLength={200}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="graduationYear">Graduation Year *</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, graduationYear: parseInt(e.target.value) }))
                    }
                    min={1950}
                    max={new Date().getFullYear() + 6}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={
                      !formData.degreeId ||
                      !formData.instituteId ||
                      (selectedInstituteType === "OTHER" && !formData.customInstituteName.trim()) ||
                      addMutation.isPending ||
                      updateMutation.isPending
                    }
                  >
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
                {profile.education.map((edu) => {
                  const degreeName = edu.degreeRef?.name;
                  const specName = edu.specializationRef?.name;
                  const instituteName = edu.instituteName ?? edu.institute?.name;
                  const instituteType = edu.instituteName ? "OTHER" : edu.institute?.type;
                  return (
                    <div key={edu.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{degreeName}</h4>
                          {specName && (
                            <p className="text-sm text-muted-foreground">{specName}</p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            {instituteName && (
                              <p className="text-sm text-muted-foreground">{instituteName}</p>
                            )}
                            {instituteType && (
                              <span
                                className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                  INSTITUTE_TYPE_COLORS[instituteType] ?? INSTITUTE_TYPE_COLORS.OTHER
                                }`}
                              >
                                {instituteType}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Graduated: {edu.graduationYear}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(edu)}>
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
                  );
                })}
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
