"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Tag } from "lucide-react";
import { getProfile, addKeyword, removeKeyword } from "@/lib/api/candidate";
import { useToast } from "@/components/ui/use-toast";

export default function KeywordsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newKeyword, setNewKeyword] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["candidateProfile"],
    queryFn: getProfile,
  });

  const addMutation = useMutation({
    mutationFn: addKeyword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Keyword added successfully" });
      setNewKeyword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add keyword",
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeKeyword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Success", description: "Keyword removed successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove keyword",
        variant: "destructive",
      });
    },
  });

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim()) {
      addMutation.mutate({ keyword: newKeyword.trim() });
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
            <CardTitle>Job Keywords</CardTitle>
            <CardDescription>
              Add keywords to get personalized job recommendations (min 2 characters, max 50)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Keyword Form */}
            <form onSubmit={handleAddKeyword} className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Enter job keyword"
                minLength={2}
                maxLength={50}
              />
              <Button type="submit" disabled={addMutation.isPending || !newKeyword.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </form>

            {/* Keywords List */}
            {profile?.followedKeywords && profile.followedKeywords.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Your Keywords ({profile.followedKeywords.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.followedKeywords.map((kw) => (
                    <Badge key={kw.id} variant="secondary" className="text-sm px-3 py-1.5">
                      <Tag className="w-3 h-3 mr-1" />
                      {kw.keyword}
                      <button
                        onClick={() => removeMutation.mutate(kw.id)}
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
                <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No keywords added yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add your first keyword above</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Popular keywords:</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Remote",
                  "Full-time",
                  "Contract",
                  "Senior",
                  "Manager",
                  "Executive",
                  "CXO",
                  "Banking",
                  "Finance",
                  "Healthcare",
                  "IT",
                  "Sales",
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setNewKeyword(suggestion)}
                    disabled={profile?.followedKeywords?.some(
                      (k) => k.keyword.toLowerCase() === suggestion.toLowerCase()
                    )}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">💡 How keywords work</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Keywords help match you with relevant job opportunities</li>
                <li>• Include job types, industries, or specific role preferences</li>
                <li>• The more specific your keywords, the better the matches</li>
                <li>• You can add as many keywords as you want</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
