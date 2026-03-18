"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import {
  addEducation,
  updateEducation,
  deleteEducation,
  type CandidateEducation,
  type AddEducationData,
  type UpdateEducationData,
} from "@/lib/api/candidate";
import { useMetaStore } from "@/lib/meta-store";
import { useToast } from "@/components/ui/use-toast";

interface EducationSectionProps {
  education: CandidateEducation[];
}

interface EducationForm {
  degreeId: string;
  specializationId: string;
  instituteId: string;
  graduationYear: number;
}

const EMPTY_FORM: EducationForm = {
  degreeId: "",
  specializationId: "",
  instituteId: "",
  graduationYear: new Date().getFullYear(),
};

// Build graduation year options (current year + 6 years back to 1950)
const GRADUATION_YEARS = Array.from(
  { length: new Date().getFullYear() + 6 - 1950 + 1 },
  (_, i) => new Date().getFullYear() + 6 - i
);

export function EducationSection({ education }: EducationSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EducationForm>(EMPTY_FORM);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { degrees, institutes, loadDegrees, loadInstitutes } = useMetaStore();

  // Load reference data on mount
  useEffect(() => {
    loadDegrees();
    loadInstitutes();
  }, [loadDegrees, loadInstitutes]);

  // Degree options
  const degreeOptions = useMemo(
    () => degrees.map((d) => ({ value: d.id, label: d.name })),
    [degrees]
  );

  // Specialization options — dependent on selected degree
  const specializationOptions = useMemo(() => {
    const deg = degrees.find((d) => d.id === form.degreeId);
    return deg
      ? deg.specializations.map((s) => ({ value: s.id, label: s.name }))
      : [];
  }, [degrees, form.degreeId]);

  // Institute options with type badge
  const instituteOptions = useMemo(
    () =>
      institutes.map((i) => ({
        value: i.id,
        label: i.name,
        meta: i.type,
      })),
    [institutes]
  );

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleEdit = (edu: CandidateEducation) => {
    setForm({
      degreeId: edu.degreeId ?? "",
      specializationId: edu.specializationId ?? "",
      instituteId: edu.instituteId ?? "",
      graduationYear: edu.graduationYear,
    });
    setEditingId(edu.id);
    setIsOpen(true);
  };

  const addMutation = useMutation({
    mutationFn: (data: AddEducationData) => addEducation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Education added successfully" });
      resetForm();
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: (error as any).response?.data?.message || "Failed to add education",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEducationData }) =>
      updateEducation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Education updated successfully" });
      resetForm();
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: (error as any).response?.data?.message || "Failed to update education",
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
        description: (error as any).response?.data?.message || "Failed to delete education",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.degreeId || !form.instituteId || !form.graduationYear) {
      toast({
        title: "Validation error",
        description: "Please select degree, institute, and graduation year",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      degreeId: form.degreeId,
      specializationId: form.specializationId || undefined,
      instituteId: form.instituteId,
      graduationYear: form.graduationYear,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const handleDegreeChange = (degreeId: string) => {
    // Reset specialization when degree changes
    setForm((prev) => ({ ...prev, degreeId, specializationId: "" }));
  };

  const isBusy = addMutation.isPending || updateMutation.isPending;

  // Display label for an education record
  const getDisplayName = (edu: CandidateEducation) => {
    const degreeName = edu.degreeRef?.name ?? "—";
    const specName = edu.specializationRef?.name;
    const instituteName = edu.instituteName ?? edu.institute?.name ?? "—";
    return { degreeName, specName, instituteName };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Education</CardTitle>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Education" : "Add Education"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Degree */}
              <div className="space-y-1.5">
                <Label>Degree *</Label>
                <SearchableSelect
                  options={degreeOptions}
                  value={form.degreeId}
                  onChange={handleDegreeChange}
                  placeholder="Select degree"
                />
              </div>

              {/* Step 2: Specialization (dependent on degree) */}
              <div className="space-y-1.5">
                <Label>Specialization</Label>
                <SearchableSelect
                  options={specializationOptions}
                  value={form.specializationId}
                  onChange={(v) => setForm((prev) => ({ ...prev, specializationId: v }))}
                  placeholder={
                    form.degreeId
                      ? specializationOptions.length > 0
                        ? "Select specialization (optional)"
                        : "No specializations available"
                      : "Select degree first"
                  }
                  disabled={!form.degreeId || specializationOptions.length === 0}
                />
              </div>

              {/* Step 3: Institute */}
              <div className="space-y-1.5">
                <Label>Institute *</Label>
                <SearchableSelect
                  options={instituteOptions}
                  value={form.instituteId}
                  onChange={(v) => setForm((prev) => ({ ...prev, instituteId: v }))}
                  placeholder="Search institute..."
                />
              </div>

              {/* Step 4: Graduation Year */}
              <div className="space-y-1.5">
                <Label>Graduation Year *</Label>
                <Select
                  value={String(form.graduationYear)}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, graduationYear: parseInt(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADUATION_YEARS.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isBusy}>
                {isBusy ? "Saving..." : editingId ? "Update Education" : "Add Education"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {education.length === 0 ? (
          <p className="text-sm text-muted-foreground">No education added yet</p>
        ) : (
          <div className="space-y-4">
            {education.map((edu) => {
              const { degreeName, specName, instituteName } = getDisplayName(edu);
              const instituteType = edu.institute?.type;

              return (
                <div
                  key={edu.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{degreeName}</p>
                      {specName && (
                        <p className="text-sm text-muted-foreground">{specName}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {instituteName}
                        {instituteType && instituteType !== "OTHER" && (
                          <span className="ml-1.5 rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                            {instituteType}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Graduated: {edu.graduationYear}
                      </p>
                    </div>
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
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


interface EducationSectionProps {
  education: CandidateEducation[];
}

export function EducationSection({ education }: EducationSectionProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    degree: "",
    specialization: "",
    university: "",
    graduationYear: new Date().getFullYear(),
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: addEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Education added successfully" });
      resetForm();
      setIsAddOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: (error as any).response?.data?.message || "Failed to add education",
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
      setEditingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: (error as any).response?.data?.message || "Failed to update education",
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
        description: (error as any).response?.data?.message || "Failed to delete education",
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleEdit = (edu: CandidateEducation) => {
    setFormData({
      degree: edu.degree,
      specialization: edu.specialization || "",
      university: edu.university,
      graduationYear: edu.graduationYear,
    });
    setEditingId(edu.id);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Education</CardTitle>
        <Dialog open={isAddOpen || !!editingId} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setEditingId(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Education" : "Add Education"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="e.g., Bachelor of Technology"
                  required
                />
              </div>
              <div>
                <Label htmlFor="specialization">Specialization (Optional)</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  placeholder="e.g., IIT Bombay"
                  required
                />
              </div>
              <div>
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
                  min="1950"
                  max={new Date().getFullYear() + 6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={addMutation.isPending || updateMutation.isPending}>
                {addMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update" : "Add Education"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {education.length === 0 ? (
          <p className="text-sm text-muted-foreground">No education added yet</p>
        ) : (
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{edu.degree}</p>
                    {edu.specialization && (
                      <p className="text-sm text-muted-foreground">{edu.specialization}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{edu.university}</p>
                    <p className="text-xs text-muted-foreground">Graduated: {edu.graduationYear}</p>
                  </div>
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
