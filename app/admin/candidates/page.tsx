"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { adminApi, type GetCandidatesParams } from "@/lib/api/admin";
import { useMetaStore } from "@/lib/meta-store";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { X, SlidersHorizontal, Users, ChevronLeft, ChevronRight } from "lucide-react";

type InstituteType = "IIT" | "IIM" | "TIER1" | "OTHER";

interface CandidateSummary {
  id: string;
  fullName: string | null;
  photoUrl: string | null;
  user: { id: string; email: string };
  skills: { id: string; skillName: string }[];
  education: {
    degreeRef: { id: string; name: string } | null;
    specializationRef: { id: string; name: string } | null;
    institute: { id: string; name: string; type: string } | null;
    instituteName: string | null;
  }[];
}

interface ActiveFilters {
  degreeId: string;
  specializationId: string;
  instituteType: InstituteType | "";
}

const EMPTY_FILTERS: ActiveFilters = {
  degreeId: "",
  specializationId: "",
  instituteType: "",
};

const INSTITUTE_TYPES: { value: InstituteType; label: string; color: string }[] = [
  { value: "IIT", label: "IIT", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "IIM", label: "IIM", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "TIER1", label: "Tier 1", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "OTHER", label: "Other", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

export default function AdminCandidatesPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Guard: redirect non-admins
  useEffect(() => {
    if (user && user.role !== "ADMIN") router.push("/login");
  }, [user, router]);

  const { degrees, loadDegrees, loadInstitutes } = useMetaStore();
  const [filters, setFilters] = useState<ActiveFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<ActiveFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadDegrees();
    loadInstitutes();
  }, [loadDegrees, loadInstitutes]);

  // Build query params from appliedFilters
  const queryParams: GetCandidatesParams = useMemo(() => {
    const params: GetCandidatesParams = { page, limit: 20 };
    if (appliedFilters.degreeId) params.degreeId = appliedFilters.degreeId;
    if (appliedFilters.specializationId) params.specializationId = appliedFilters.specializationId;
    if (appliedFilters.instituteType) params.instituteType = appliedFilters.instituteType;
    return params;
  }, [appliedFilters, page]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-candidates", queryParams],
    queryFn: () => adminApi.getCandidates(queryParams),
    enabled: !!user && user.role === "ADMIN",
  });

  const candidates = data?.data?.candidates ?? [];
  const pagination = data?.data?.pagination;

  // Degree options for filter
  const degreeOptions = useMemo(
    () => degrees.map((d) => ({ value: d.id, label: d.name })),
    [degrees]
  );

  // Specialization options dependent on selected degree in filters
  const specializationOptions = useMemo(() => {
    const deg = degrees.find((d) => d.id === filters.degreeId);
    return deg ? deg.specializations.map((s) => ({ value: s.id, label: s.name })) : [];
  }, [degrees, filters.degreeId]);

  const applyFilters = useCallback(() => {
    setAppliedFilters({ ...filters });
    setPage(1);
  }, [filters]);

  const clearAllFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const removeFilter = (key: keyof ActiveFilters) => {
    const updated = { ...appliedFilters, [key]: "" };
    // If removing degree, also clear specialization
    if (key === "degreeId") updated.specializationId = "";
    setFilters(updated);
    setAppliedFilters(updated);
    setPage(1);
  };

  const handleDegreeChange = (degreeId: string) => {
    setFilters((prev) => ({ ...prev, degreeId, specializationId: "" }));
  };

  // Active filter chips
  const activeChips: { key: keyof ActiveFilters; label: string }[] = [];
  if (appliedFilters.degreeId) {
    const deg = degrees.find((d) => d.id === appliedFilters.degreeId);
    if (deg) activeChips.push({ key: "degreeId", label: deg.name });
  }
  if (appliedFilters.specializationId) {
    const deg = degrees.find((d) => d.id === appliedFilters.degreeId);
    const spec = deg?.specializations.find((s) => s.id === appliedFilters.specializationId);
    if (spec) activeChips.push({ key: "specializationId", label: spec.name });
  }
  if (appliedFilters.instituteType) {
    const it = INSTITUTE_TYPES.find((t) => t.value === appliedFilters.instituteType);
    if (it) activeChips.push({ key: "instituteType", label: it.label });
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/dashboard")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Candidate Pool</h1>
            <p className="text-sm text-muted-foreground">
              Filter candidates by education background
            </p>
          </div>
        </div>
        {pagination && (
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Users className="w-4 h-4 mr-1.5" />
            {pagination.total} candidates
          </Badge>
        )}
      </div>

      {/* Filter Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filter by Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Degree */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Degree</label>
              <SearchableSelect
                options={degreeOptions}
                value={filters.degreeId}
                onChange={handleDegreeChange}
                placeholder="Any degree"
              />
            </div>

            {/* Specialization */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Specialization</label>
              <SearchableSelect
                options={specializationOptions}
                value={filters.specializationId}
                onChange={(v) =>
                  setFilters((prev) => ({ ...prev, specializationId: v }))
                }
                placeholder={filters.degreeId ? "Any specialization" : "Select degree first"}
                disabled={!filters.degreeId || specializationOptions.length === 0}
              />
            </div>

            {/* Institute Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Institute Type</label>
              <Select
                value={filters.instituteType}
                onValueChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    instituteType: v === "ALL" ? "" : (v as InstituteType),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Any type</SelectItem>
                  {INSTITUTE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Institute Type chips */}
          <div className="flex flex-wrap gap-2">
            {INSTITUTE_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    instituteType: prev.instituteType === t.value ? "" : t.value,
                  }))
                }
                className={[
                  "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  filters.instituteType === t.value
                    ? t.color + " border-current"
                    : "border-border text-muted-foreground hover:border-foreground/40",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <Badge
                  key={chip.key}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={() => removeFilter(chip.key)}
                    className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {activeChips.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <Button onClick={applyFilters} size="sm">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading candidates...</div>
      ) : isError ? (
        <div className="text-center py-12 text-destructive">Failed to load candidates.</div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No candidates found matching the selected filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {candidates.map((candidate: CandidateSummary) => {
              const primaryEdu = candidate.education?.[0];
              const degreeName = primaryEdu?.degreeRef?.name ?? null;
              const specName = primaryEdu?.specializationRef?.name ?? null;
              const instituteName = primaryEdu?.instituteName ?? primaryEdu?.institute?.name ?? null;
              const instituteType = primaryEdu?.institute?.type ?? null;
              const initials =
                candidate.fullName
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) ?? "?";

              return (
                <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        {candidate.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={candidate.photoUrl ?? undefined} alt={candidate.fullName ?? undefined} />
                        ) : (
                          <AvatarFallback>{initials}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {candidate.fullName ?? "Unnamed Candidate"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {candidate.user?.email}
                        </p>

                        {/* Education summary */}
                        {degreeName && (
                          <div className="mt-2 space-y-0.5">
                            <p className="text-sm font-medium text-foreground/80">
                              {degreeName}
                              {specName && (
                                <span className="font-normal text-muted-foreground">
                                  {" · "}
                                  {specName}
                                </span>
                              )}
                            </p>
                            {instituteName && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                {instituteName}
                                {instituteType && instituteType !== "OTHER" && (
                                  <span
                                    className={
                                      INSTITUTE_TYPES.find((t) => t.value === instituteType)
                                        ?.color +
                                      " rounded px-1.5 py-0.5 text-[10px] font-medium"
                                    }
                                  >
                                    {instituteType}
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Skills */}
                        {candidate.skills?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 4).map((s: { id: string; skillName: string }) => (
                              <Badge key={s.id} variant="outline" className="text-xs px-1.5 py-0">
                                {s.skillName}
                              </Badge>
                            ))}
                            {candidate.skills.length > 4 && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                +{candidate.skills.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
