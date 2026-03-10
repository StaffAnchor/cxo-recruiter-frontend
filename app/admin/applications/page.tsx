'use client';

import { useEffect, useState } from 'react';
import { getAllApplications, type JobApplication } from '@/lib/api/jobs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Building,
  Search,
  Download,
} from 'lucide-react';

export default function AdminApplicationsPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);

  useEffect(() => {
    loadApplications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.candidate?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.candidate?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.job?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applications]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await getAllApplications(page, 20);
      setApplications(response.applications || []);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'bg-blue-100 text-blue-800';
      case 'SHORTLISTED':
        return 'bg-purple-100 text-purple-800';
      case 'INTERVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'OFFERED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusStats = () => {
    return {
      total: applications.length,
      applied: applications.filter((a) => a.status === 'APPLIED').length,
      shortlisted: applications.filter((a) => a.status === 'SHORTLISTED').length,
      interview: applications.filter((a) => a.status === 'INTERVIEW').length,
      offered: applications.filter((a) => a.status === 'OFFERED').length,
      rejected: applications.filter((a) => a.status === 'REJECTED').length,
    };
  };

  const stats = getStatusStats();

  if (loading && page === 1) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Loading applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Applications</h1>
        <p className="text-muted-foreground mt-1">
          View and monitor all job applications across the platform
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card className={statusFilter === 'ALL' ? 'border-primary' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setStatusFilter('ALL')}
            >
              View All
            </Button>
          </CardContent>
        </Card>

        {['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'].map((status) => (
          <Card key={status} className={statusFilter === status ? 'border-primary' : ''}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {status}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats[status.toLowerCase() as keyof typeof stats]}
              </div>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setStatusFilter(status)}
              >
                Filter
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by candidate name, email, job title, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md"
            >
              <option value="ALL">All Status</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFERED">Offered</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          {(searchTerm || statusFilter !== 'ALL') && (
            <div className="mt-2 text-sm text-muted-foreground">
              Showing {filteredApplications.length} of {applications.length} applications
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-semibold mb-2">No applications found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Applications will appear here when candidates apply to jobs'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {application.candidate?.fullName || 'Candidate Name'}
                    </CardTitle>
                    <CardDescription className="mt-1 space-y-1">
                      {application.candidate?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {application.candidate.email}
                        </div>
                      )}
                      {application.candidate?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {application.candidate.phone}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Job Information */}
                  {application.job && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="font-semibold mb-1">{application.job.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Building className="h-3 w-3" />
                        {application.job.companyName}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {application.job.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {application.job.locations[0]}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Candidate Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {application.candidate?.currentCity && (
                      <div>
                        <div className="text-muted-foreground mb-1">Location</div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {application.candidate.currentCity}
                        </div>
                      </div>
                    )}
                    {application.candidate?.totalExperience !== null && (
                      <div>
                        <div className="text-muted-foreground mb-1">Experience</div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {application.candidate?.totalExperience} years
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-muted-foreground mb-1">Applied On</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Updated On</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(application.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {application.candidate?.skills && application.candidate.skills.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2">Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {application.candidate.skills.slice(0, 5).map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill.skillName}
                          </Badge>
                        ))}
                        {application.candidate.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{application.candidate.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    {application.candidate?.resumeUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(application.candidate?.resumeUrl, '_blank')}
                      >
                        <Download className="mr-2 h-3 w-3" />
                        Resume
                      </Button>
                    )}
                    {application.candidate?.linkedin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(application.candidate?.linkedin, '_blank')}
                      >
                        LinkedIn
                      </Button>
                    )}
                    <div className="ml-auto text-xs text-muted-foreground">
                      App ID: {application.id.slice(0, 8)}...
                    </div>
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
