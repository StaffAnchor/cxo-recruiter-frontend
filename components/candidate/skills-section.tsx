"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { addSkill, removeSkill, type CandidateSkill } from "@/lib/api/candidate";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface SkillsSectionProps {
  skills: CandidateSkill[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [skillName, setSkillName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: addSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({
        title: "Success",
        description: "Skill added successfully",
      });
      setSkillName("");
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: (error as any).response?.data?.message || "Failed to add skill",
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({
        title: "Success",
        description: "Skill removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: (error as any).response?.data?.message || "Failed to remove skill",
        variant: "destructive",
      });
    },
  });

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillName.trim()) {
      addMutation.mutate({ skillName: skillName.trim() });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Skills</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Skill</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <Label htmlFor="skillName">Skill Name</Label>
                <Input
                  id="skillName"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g., React.js, Python, Leadership"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adding..." : "Add Skill"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No skills added yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill.id} variant="secondary" className="px-3 py-1">
                {skill.skillName}
                <button
                  onClick={() => removeMutation.mutate(skill.id)}
                  className="ml-2 hover:text-destructive"
                  disabled={removeMutation.isPending}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
