'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCandidateApplications, type JobApplication } from '@/lib/api/jobs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Building,
  Eye,
  FileText,
} from 'lucide-react';

export default function ApplicationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getCandidateApplications();
      setApplications(data);
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

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'Your application has been submitted and is under review';
      case 'SHORTLISTED':
        return 'Congratulations! You have been shortlisted for this position';
      case 'INTERVIEW':
        return 'You have been scheduled for an interview';
      case 'OFFERED':
        return 'Congratulations! You have received an offer';
      case 'REJECTED':
        return 'Unfortunately, your application was not successful';
      default:
        return '';
    }
  };

  if (loading) {
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
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-1">
          Track the status of your job applications
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-4">
              Start applying to jobs to see your applications here
            </p>
            <Button onClick={() => router.push('/candidate/jobs')}>
              Browse Jobs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      {application.job?.title || 'Job Title'}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {application.job && !application.job.hideCompanyName && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {application.job.companyName}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                    {application.job && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/candidate/jobs/${application.jobId}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Job
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Message */}
                <div className="text-sm text-muted-foreground">
                  {getStatusMessage(application.status)}
                </div>

                {/* Job Details */}
                {application.job && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {application.job.experienceMin}-{application.job.experienceMax} years
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{application.job.locations.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{application.job.category}</span>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {application.job && application.job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {application.job.skills.slice(0, 6).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {application.job.skills.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{application.job.skills.length - 6} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Timeline */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Applied On</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Last Updated</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(application.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Job Description Preview */}
                {application.job && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {application.job.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {applications.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Application Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'].map((status) => {
                const count = applications.filter((app) => app.status === status).length;
                return (
                  <div key={status} className="text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${getStatusColor(status)}`}>
                      {status}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
