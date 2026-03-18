"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { addSkills, removeSkill, type CandidateSkill } from "@/lib/api/candidate";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { getSkills } from "@/lib/api/meta";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface SkillsSectionProps {
  skills: CandidateSkill[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: addSkills,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({
        title: "Success",
        description: "Skill added successfully",
      });
      setSearch("");
      setSelectedSkillId("");
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

  const { data: availableSkills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ["metaSkills", search],
    queryFn: () => getSkills(search),
    enabled: isOpen,
  });

  const selectedSkillName = useMemo(
    () => availableSkills.find((skill) => skill.id === selectedSkillId)?.name,
    [availableSkills, selectedSkillId]
  );

  const selectedAlreadyAdded = Boolean(
    selectedSkillName &&
      skills.some((skill) => skill.skillName.toLowerCase() === selectedSkillName.toLowerCase())
  );

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkillId) {
      addMutation.mutate({ skillIds: [selectedSkillId] });
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
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search skills"
                />
              </div>
              <SearchableSelect
                options={availableSkills.map((skill) => ({ value: skill.id, label: skill.name }))}
                value={selectedSkillId}
                onChange={setSelectedSkillId}
                placeholder={isLoadingSkills ? "Loading skills..." : "Select a skill"}
                disabled={isLoadingSkills}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={addMutation.isPending || !selectedSkillId || selectedAlreadyAdded}
              >
                {addMutation.isPending ? "Adding..." : "Add Skill"}
              </Button>
              {selectedAlreadyAdded && (
                <p className="text-sm text-muted-foreground">This skill is already in your profile.</p>
              )}
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
