'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getJobApplications,
  updateApplicationStatus,
  getEmployerJobById,
  type JobApplication,
  type ApplicationStatus,
  type Job,
  APPLICATION_STATUSES,
} from '@/lib/api/jobs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Download } from 'lucide-react';

export default function JobApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobData, applicationsData] = await Promise.all([
        getEmployerJobById(jobId),
        getJobApplications(jobId),
      ]);
      setJob(jobData);
      setApplications(applicationsData);
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

  const handleStatusUpdate = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      setUpdatingStatus(applicationId);
      await updateApplicationStatus(applicationId, newStatus);
      toast({
        title: 'Success',
        description: 'Application status updated successfully',
      });
      loadData();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
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
      <Button variant="ghost" onClick={() => router.push('/employer/jobs')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Button>

      {job && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription>
              {applications.length} application{applications.length !== 1 ? 's' : ''} received
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground">
              Applications will appear here when candidates apply to this job
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {application.candidate?.fullName || 'Candidate Name'}
                    </CardTitle>
                    <CardDescription className="mt-2 space-y-1">
                      {application.candidate?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {application.candidate.email}
                        </div>
                      )}
                      {application.candidate?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
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
                <div className="space-y-4">
                  {/* Candidate Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {application.candidate?.currentCity && (
                      <div>
                        <div className="flex items-center text-muted-foreground mb-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          Location
                        </div>
                        <div>{application.candidate.currentCity}</div>
                      </div>
                    )}
                    {application.candidate?.totalExperience !== null && (
                      <div>
                        <div className="flex items-center text-muted-foreground mb-1">
                          <Briefcase className="h-4 w-4 mr-1" />
                          Experience
                        </div>
                        <div>{application.candidate?.totalExperience} years</div>
                      </div>
                    )}
                    <div>
                      <div className="text-muted-foreground mb-1">Applied On</div>
                      <div>{new Date(application.appliedAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Skills */}
                  {application.candidate?.skills && application.candidate.skills.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2">Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {application.candidate.skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill.skillName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {application.candidate?.education && application.candidate.education.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2">Education</div>
                      {application.candidate.education.slice(0, 2).map((edu, idx) => (
                        <div key={idx} className="text-sm mb-1">
                          {edu.degree} {edu.specialization && `in ${edu.specialization}`} from {edu.university} ({edu.graduationYear})
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Experience */}
                  {application.candidate?.experience && application.candidate.experience.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2">Recent Experience</div>
                      {application.candidate.experience.slice(0, 2).map((exp, idx) => (
                        <div key={idx} className="text-sm mb-2">
                          <div className="font-medium">{exp.role} at {exp.companyName}</div>
                          <div className="text-muted-foreground text-xs">
                            {new Date(exp.startDate).toLocaleDateString()} - {exp.currentlyWorking ? 'Present' : new Date(exp.endDate!).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {application.candidate?.resumeUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(application.candidate?.resumeUrl, '_blank')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        View Resume
                      </Button>
                    )}
                    
                    {application.candidate?.linkedin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(application.candidate?.linkedin, '_blank')}
                      >
                        LinkedIn Profile
                      </Button>
                    )}

                    <div className="ml-auto flex gap-2">
                      <select
                        value={application.status}
                        onChange={(e) => handleStatusUpdate(application.id, e.target.value as ApplicationStatus)}
                        disabled={updatingStatus === application.id}
                        className="px-3 py-1 border border-input rounded-md text-sm"
                      >
                        {APPLICATION_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
