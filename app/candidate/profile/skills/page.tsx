"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X } from "lucide-react";
import { getProfile, addSkill, removeSkill } from "@/lib/api/candidate";
import { useToast } from "@/components/ui/use-toast";

export default function SkillsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["candidateProfile"],
    queryFn: getProfile,
  });

  const addMutation = useMutation({
    mutationFn: addSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Skill added successfully" });
      setNewSkill("");
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
    if (newSkill.trim()) {
      addMutation.mutate({ skillName: newSkill.trim() });
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
            <CardTitle>Skills</CardTitle>
            <CardDescription>Add your professional skills (min 2 characters, max 50)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter skill name"
                minLength={2}
                maxLength={50}
              />
              <Button type="submit" disabled={addMutation.isPending || !newSkill.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
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

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Skill suggestions:</h4>
              <div className="flex flex-wrap gap-2">
                {["JavaScript", "React", "Node.js", "Python", "SQL", "AWS", "Leadership", "Project Management"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setNewSkill(suggestion)}
                    disabled={profile?.skills?.some((s) => s.skillName.toLowerCase() === suggestion.toLowerCase())}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
