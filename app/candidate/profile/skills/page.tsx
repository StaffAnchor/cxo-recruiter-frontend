"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X } from "lucide-react";
import { getProfile, addSkills, removeSkill } from "@/lib/api/candidate";
import { getSkills } from "@/lib/api/meta";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useToast } from "@/components/ui/use-toast";

export default function SkillsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSkillId, setSelectedSkillId] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["candidateProfile"],
    queryFn: getProfile,
  });

  const addMutation = useMutation({
    mutationFn: addSkills,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Skill added successfully" });
      setSelectedSkillId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add skill",
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Skill removed successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove skill",
        variant: "destructive",
      });
    },
  });

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkillId) {
      addMutation.mutate({ skillIds: [selectedSkillId] });
    }
  };

  const { data: availableSkills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ["metaSkills"],
    queryFn: () => getSkills(),
  });

  const selectedSkillName = useMemo(
    () => availableSkills.find((skill) => skill.id === selectedSkillId)?.name,
    [availableSkills, selectedSkillId]
  );

  const selectedAlreadyAdded = Boolean(
    selectedSkillName &&
      profile?.skills?.some(
        (skill) => skill.skillName.toLowerCase() === selectedSkillName.toLowerCase()
      )
  );

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
            <CardDescription>Select your professional skills from the master list</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAddSkill} className="space-y-3">
              <SearchableSelect
                options={availableSkills.map((skill) => ({
                  value: skill.id,
                  label: skill.name,
                }))}
                value={selectedSkillId}
                onChange={setSelectedSkillId}
                placeholder={isLoadingSkills ? "Loading skills..." : "Select a skill"}
                disabled={isLoadingSkills}
              />
              <Button
                type="submit"
                disabled={addMutation.isPending || !selectedSkillId || selectedAlreadyAdded}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
              {selectedAlreadyAdded && (
                <p className="text-sm text-muted-foreground">This skill is already added to your profile.</p>
              )}
            </form>

            {/* Skills List */}
            {profile?.skills && profile.skills.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium mb-3">Your Skills ({profile.skills.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary" className="text-sm px-3 py-1.5">
                      {skill.skillName}
                      <button
                        onClick={() => removeMutation.mutate(skill.id)}
                        disabled={removeMutation.isPending}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No skills added yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add your first skill above</p>
              </div>
            )}

            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
