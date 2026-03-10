'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { browseJobs, JOB_CATEGORIES, type Job, type BrowseJobsParams } from '@/lib/api/jobs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Search, MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react';

export default function BrowseJobsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<BrowseJobsParams>({
    page: 1,
    limit: 10,
  });

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await browseJobs({ ...filters, page });
      setJobs(response.jobs || []);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load jobs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    loadJobs();
  };

  const formatSalary = (min: number, max: number) => {
    const formatAmount = (amount: number) => {
      if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
      if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
      return amount.toString();
    };
    return `₹${formatAmount(min)} - ₹${formatAmount(max)}`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Browse Jobs</h1>
        <p className="text-muted-foreground mt-1">
          Find your next opportunity from {jobs.length > 0 ? `${totalPages * 10}+` : 'our'} available positions
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search jobs..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  <option value="">All Categories</option>
                  {JOB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <Input
                  placeholder="Location"
                  value={filters.location || ''}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min Exp"
                  value={filters.experienceMin || ''}
                  onChange={(e) => setFilters({ ...filters, experienceMin: Number(e.target.value) || undefined })}
                  min={0}
                />
                <Input
                  type="number"
                  placeholder="Max Exp"
                  value={filters.experienceMax || ''}
                  onChange={(e) => setFilters({ ...filters, experienceMax: Number(e.target.value) || undefined })}
                  min={0}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFilters({ page: 1, limit: 10 });
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {loading && page === 1 ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Loading jobs...</div>
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/candidate/jobs/${job.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {!job.hideCompanyName && job.companyName}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/candidate/jobs/${job.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      <Briefcase className="mr-1 h-3 w-3" />
                      {job.experienceMin}-{job.experienceMax} years
                    </Badge>
                    {!job.hideSalary && (
                      <Badge variant="secondary">
                        <DollarSign className="mr-1 h-3 w-3" />
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </Badge>
                    )}
                    <Badge variant="secondary">{job.category}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {job.locations.join(', ')}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {job.skills.slice(0, 6).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.skills.length - 6} more
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <div className="flex items-center px-4">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
