'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getJobById, applyToJob, type Job } from '@/lib/api/jobs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building,
  GraduationCap,
  CheckCircle,
} from 'lucide-react';

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadJob();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const data = await getJobById(jobId);
      setJob(data);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load job details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!confirm('Are you sure you want to apply to this job?')) {
      return;
    }

    try {
      setApplying(true);
      await applyToJob(jobId);
      setHasApplied(true);
      toast({
        title: 'Success',
        description: 'Application submitted successfully!',
      });
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Failed to apply';
      if (message.includes('already applied')) {
        setHasApplied(true);
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min: number, max: number) => {
    const formatAmount = (amount: number) => {
      if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
      if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
      return amount.toString();
    };
    return `₹${formatAmount(min)} - ₹${formatAmount(max)}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Loading job details...</div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-semibold mb-2">Job not found</h3>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
              {!job.hideCompanyName && (
                <CardDescription className="text-lg flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {job.companyName}
                </CardDescription>
              )}
            </div>
            {hasApplied ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-4 w-4" />
                Applied
              </Badge>
            ) : (
              <Button onClick={handleApply} disabled={applying} size="lg">
                {applying ? 'Applying...' : 'Apply Now'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium">Experience</div>
                <div className="text-sm text-muted-foreground">
                  {job.experienceMin}-{job.experienceMax} years
                </div>
              </div>
            </div>

            {!job.hideSalary && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Salary</div>
                  <div className="text-sm text-muted-foreground">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium">Location</div>
                <div className="text-sm text-muted-foreground">
                  {job.locations.join(', ')}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium">Industry</div>
                <div className="text-sm text-muted-foreground">
                  {job.industry.join(', ')}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium">Category</div>
                <div className="text-sm text-muted-foreground">{job.category}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium">Posted</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <hr />

          {/* Job Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Job Description</h3>
            <div className="text-sm whitespace-pre-line text-muted-foreground">
              {job.description}
            </div>
          </div>

          <hr />

          {/* Required Skills */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <hr />

          {/* Education Requirements */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Education Requirements</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <span className="font-medium">Graduation Year:</span>{' '}
                  {job.graduationYearMin} - {job.graduationYearMax}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <span className="font-medium">Course Types:</span>{' '}
                  {job.courseTypes.join(', ')}
                </div>
              </div>
            </div>
          </div>

          <hr />

          {/* Functional Area */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Functional Area</h3>
            <p className="text-sm text-muted-foreground">{job.functionalArea}</p>
          </div>

          {/* Apply Button at bottom */}
          {hasApplied ? (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="flex items-center gap-3 py-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-900">Application Submitted</div>
                  <div className="text-sm text-green-700">
                    You have already applied to this position
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-3">
              <Button onClick={handleApply} disabled={applying} size="lg" className="flex-1">
                {applying ? 'Applying...' : 'Apply Now'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/candidate/jobs')}
              >
                Browse More Jobs
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
