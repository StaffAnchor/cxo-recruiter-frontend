'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  getEmployerJobById, 
  updateJob, 
  JOB_CATEGORIES, 
  type UpdateJobData 
} from '@/lib/api/jobs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<UpdateJobData>({
    title: '',
    description: '',
    locations: [''],
    skills: [''],
    experienceMin: 0,
    experienceMax: 0,
    companyName: '',
    hideCompanyName: false,
    industry: [''],
    category: '',
    functionalArea: '',
    salaryMin: 0,
    salaryMax: 0,
    hideSalary: false,
    graduationYearMin: 2015,
    graduationYearMax: new Date().getFullYear(),
    courseTypes: [''],
  });

  useEffect(() => {
    const loadJob = async () => {
      try {
        setInitialLoading(true);
        const job = await getEmployerJobById(jobId);
        setFormData({
          title: job.title,
          description: job.description,
          locations: job.locations.length > 0 ? job.locations : [''],
          skills: job.skills.length > 0 ? job.skills : [''],
          experienceMin: job.experienceMin,
          experienceMax: job.experienceMax,
          companyName: job.companyName,
          hideCompanyName: job.hideCompanyName,
          industry: job.industry.length > 0 ? job.industry : [''],
          category: job.category,
          functionalArea: job.functionalArea,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          hideSalary: job.hideSalary,
          graduationYearMin: job.graduationYearMin,
          graduationYearMax: job.graduationYearMax,
          courseTypes: job.courseTypes.length > 0 ? job.courseTypes : [''],
        });
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast({
          title: 'Error',
          description: err.response?.data?.message || 'Failed to load job',
          variant: 'destructive',
        });
        router.push('/employer/jobs');
      } finally {
        setInitialLoading(false);
      }
    };

    loadJob();
  }, [jobId, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up empty strings from arrays
    const cleanedData = {
      ...formData,
      locations: formData.locations?.filter(l => l.trim()),
      skills: formData.skills?.filter(s => s.trim()),
      industry: formData.industry?.filter(i => i.trim()),
      courseTypes: formData.courseTypes?.filter(c => c.trim()),
    };

    // Validation
    if (cleanedData.locations && cleanedData.locations.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one location',
        variant: 'destructive',
      });
      return;
    }

    if (cleanedData.skills && cleanedData.skills.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one skill',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await updateJob(jobId, cleanedData);
      toast({
        title: 'Success',
        description: 'Job posting updated successfully',
      });
      router.push('/employer/jobs');
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update job',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArrayFieldChange = (
    field: 'locations' | 'skills' | 'industry' | 'courseTypes',
    index: number,
    value: string
  ) => {
    const currentArray = formData[field] || [''];
    const newArray = [...currentArray];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: 'locations' | 'skills' | 'industry' | 'courseTypes') => {
    const currentArray = formData[field] || [''];
    setFormData({ ...formData, [field]: [...currentArray, ''] });
  };

  const removeArrayField = (
    field: 'locations' | 'skills' | 'industry' | 'courseTypes',
    index: number
  ) => {
    const currentArray = formData[field] || [''];
    const newArray = currentArray.filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Loading job details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Job Posting</CardTitle>
          <CardDescription>
            Update the details of your job posting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  required
                  minLength={3}
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="description">Job Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  required
                  minLength={50}
                  maxLength={5000}
                  rows={6}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>

              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="hideCompanyName"
                    checked={formData.hideCompanyName}
                    onChange={(e) => setFormData({ ...formData, hideCompanyName: e.target.checked })}
                    className="mr-2"
                  />
                  <Label htmlFor="hideCompanyName" className="font-normal">
                    Hide company name from candidates
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  <option value="">Select category</option>
                  {JOB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="functionalArea">Functional Area *</Label>
                <Input
                  id="functionalArea"
                  value={formData.functionalArea}
                  onChange={(e) => setFormData({ ...formData, functionalArea: e.target.value })}
                  placeholder="e.g., Software Development"
                  required
                />
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Locations *</h3>
              {(formData.locations || ['']).map((location, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={location}
                    onChange={(e) => handleArrayFieldChange('locations', index, e.target.value)}
                    placeholder="e.g., Bangalore"
                  />
                  {(formData.locations || ['']).length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeArrayField('locations', index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayField('locations')}
              >
                Add Location
              </Button>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Required Skills *</h3>
              {(formData.skills || ['']).map((skill, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={skill}
                    onChange={(e) => handleArrayFieldChange('skills', index, e.target.value)}
                    placeholder="e.g., JavaScript"
                  />
                  {(formData.skills || ['']).length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeArrayField('skills', index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayField('skills')}
              >
                Add Skill
              </Button>
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Experience Required</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experienceMin">Minimum (years) *</Label>
                  <Input
                    id="experienceMin"
                    type="number"
                    value={formData.experienceMin}
                    onChange={(e) => setFormData({ ...formData, experienceMin: Number(e.target.value) })}
                    min={0}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="experienceMax">Maximum (years) *</Label>
                  <Input
                    id="experienceMax"
                    type="number"
                    value={formData.experienceMax}
                    onChange={(e) => setFormData({ ...formData, experienceMax: Number(e.target.value) })}
                    min={formData.experienceMin || 0}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Salary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Salary Range (Annual)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryMin">Minimum (₹) *</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: Number(e.target.value) })}
                    min={0}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="salaryMax">Maximum (₹) *</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: Number(e.target.value) })}
                    min={formData.salaryMin || 0}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hideSalary"
                  checked={formData.hideSalary}
                  onChange={(e) => setFormData({ ...formData, hideSalary: e.target.checked })}
                  className="mr-2"
                />
                <Label htmlFor="hideSalary" className="font-normal">
                  Hide salary from candidates
                </Label>
              </div>
            </div>

            {/* Industry */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Industry *</h3>
              {(formData.industry || ['']).map((ind, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ind}
                    onChange={(e) => handleArrayFieldChange('industry', index, e.target.value)}
                    placeholder="e.g., Technology"
                  />
                  {(formData.industry || ['']).length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeArrayField('industry', index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayField('industry')}
              >
                Add Industry
              </Button>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Education Requirements</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="graduationYearMin">Graduation Year Min *</Label>
                  <Input
                    id="graduationYearMin"
                    type="number"
                    value={formData.graduationYearMin}
                    onChange={(e) => setFormData({ ...formData, graduationYearMin: Number(e.target.value) })}
                    min={2000}
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="graduationYearMax">Graduation Year Max *</Label>
                  <Input
                    id="graduationYearMax"
                    type="number"
                    value={formData.graduationYearMax}
                    onChange={(e) => setFormData({ ...formData, graduationYearMax: Number(e.target.value) })}
                    min={formData.graduationYearMin || 2000}
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Course Types *</Label>
                {(formData.courseTypes || ['']).map((course, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={course}
                      onChange={(e) => handleArrayFieldChange('courseTypes', index, e.target.value)}
                      placeholder="e.g., B.Tech, MBA"
                    />
                    {(formData.courseTypes || ['']).length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeArrayField('courseTypes', index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayField('courseTypes')}
                  className="mt-2"
                >
                  Add Course Type
                </Button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Job Posting'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
