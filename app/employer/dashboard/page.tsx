"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Users, 
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  Building2
} from "lucide-react";
import { getEmployerProfile, getEmployerStatistics, type EmployerProfile, type EmployerStatistics } from "@/lib/api/employer";
import { useToast } from "@/components/ui/use-toast";
import { EmployerNavbar } from "@/components/employer/employer-navbar";

export default function EmployerDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [statistics, setStatistics] = useState<EmployerStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileData, statsData] = await Promise.all([
          getEmployerProfile(),
          getEmployerStatistics()
        ]);
        setProfile(profileData);
        setStatistics(statsData);
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to fetch dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const employerStatus = profile?.status || "PENDING";
  const companyName = profile?.companyName || "Your Company";

  const renderStatusBadge = () => {
    switch (employerStatus) {
      case "APPROVED":
        return <Badge className="ml-2 bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="ml-2"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="ml-2 bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending Approval</Badge>;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Navbar */}
      <EmployerNavbar companyName={companyName} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            Welcome back, {companyName}!
            {renderStatusBadge()}
          </h1>
          <p className="text-muted-foreground">Here&apos;s an overview of your recruitment activities</p>
        </div>

        {/* Status Alert */}
        {employerStatus === "PENDING" && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Account Pending Approval
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Your employer account is currently under review by our admin team. 
                You&apos;ll be able to post jobs and access candidates once your account is approved.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {employerStatus === "REJECTED" && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                Account Rejected
              </CardTitle>
              <CardDescription className="text-red-700">
                Unfortunately, your employer account application was not approved. 
                Please contact support for more information.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">Total Jobs</CardDescription>
                <Briefcase className="w-5 h-5 text-primary opacity-70" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl font-bold">{statistics?.totalJobs || 0}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">Active Jobs</CardDescription>
                <TrendingUp className="w-5 h-5 text-green-600 opacity-70" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl font-bold text-green-600">{statistics?.activeJobs || 0}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">Applications</CardDescription>
                <Users className="w-5 h-5 text-blue-600 opacity-70" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl font-bold text-blue-600">{statistics?.totalApplications || 0}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Total received</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">Shortlisted</CardDescription>
                <CheckCircle2 className="w-5 h-5 text-purple-600 opacity-70" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl font-bold text-purple-600">{statistics?.applicationsByStatus?.SHORTLISTED || 0}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Candidates</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Job Postings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Job Postings</CardTitle>
                  <CardDescription>Your latest job listings</CardDescription>
                </div>
                <Button 
                  size="sm"
                  disabled={employerStatus !== "APPROVED"}
                  onClick={() => router.push("/employer/jobs/create")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium mb-2">No job postings yet</p>
                {employerStatus === "APPROVED" ? (
                  <p className="text-sm mb-4">Click &quot;Post Job&quot; to create your first job listing</p>
                ) : (
                  <p className="text-sm mb-4">You&apos;ll be able to post jobs once your account is approved</p>
                )}
                <Button 
                  variant="outline"
                  disabled={employerStatus !== "APPROVED"}
                  onClick={() => router.push("/employer/jobs/create")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Job
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  disabled={employerStatus !== "APPROVED"}
                  onClick={() => router.push("/employer/jobs/create")}
                >
                  <Plus className="w-5 h-5 mr-3 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">Post New Job</div>
                    <div className="text-xs text-muted-foreground">Create job listing</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => router.push("/employer/jobs")}
                >
                  <FileText className="w-5 h-5 mr-3 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">Manage Jobs</div>
                    <div className="text-xs text-muted-foreground">View all postings</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => router.push("/employer/profile")}
                >
                  <Building2 className="w-5 h-5 mr-3 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">Company Profile</div>
                    <div className="text-xs text-muted-foreground">Update details</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Company Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="text-sm font-medium">{profile?.companyName || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{profile?.location || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Company Size</p>
                  <p className="text-sm font-medium">{profile?.companySize || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Account Status</p>
                  <div className="mt-1">
                    {renderStatusBadge()}
                  </div>
                </div>
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => router.push("/employer/profile")}
                >
                  View Full Profile →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

