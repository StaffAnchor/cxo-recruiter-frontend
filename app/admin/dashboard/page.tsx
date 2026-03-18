"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth-store";
import { adminApi } from "@/lib/api/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  Settings,
  LogOut,
  Bell,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

type EmployerStatus = "PENDING" | "APPROVED" | "REJECTED";

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, clearAuth } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<EmployerStatus | "ALL">("PENDING");

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.getStats,
  });

  // Fetch employers based on filter
  const { data: employersData, isLoading } = useQuery({
    queryKey: ["admin-employers", statusFilter],
    queryFn: () => adminApi.getEmployers({ 
      status: statusFilter === "ALL" ? undefined : statusFilter 
    }),
  });

  // Approve employer mutation
  const approveMutation = useMutation({
    mutationFn: adminApi.approveEmployer,
    onSuccess: () => {
      toast({
        title: "Employer approved",
        description: "The employer account has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-employers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => {
      toast({
        title: "Approval failed",
        description: "Failed to approve employer. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reject employer mutation
  const rejectMutation = useMutation({
    mutationFn: adminApi.rejectEmployer,
    onSuccess: () => {
      toast({
        title: "Employer rejected",
        description: "The employer account has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-employers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => {
      toast({
        title: "Rejection failed",
        description: "Failed to reject employer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const employers = employersData?.data?.employers || [];
  const statsData = stats?.data || {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">CXO Recruiter</span>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/jobs")}
            >
              All Jobs
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/applications")}
            >
              All Applications
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/candidates")}
            >
              Candidates
            </Button>
          </nav>
          <div className="flex items-center space-x-4">
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Admin</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage the platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Total Users</CardDescription>
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">{statsData.totalUsers || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                All registered users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Candidates</CardDescription>
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">{statsData.totalCandidates || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Active job seekers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Employers</CardDescription>
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">{statsData.totalEmployers || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {statsData.approvedEmployers || 0} approved
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-yellow-700">Pending</CardDescription>
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <CardTitle className="text-3xl text-yellow-800">
                {statsData.pendingEmployers || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-yellow-700">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Employer Management */}
        <Card>
          <CardHeader>
            <CardTitle>Employer Management</CardTitle>
            <CardDescription>Review and approve employer registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as EmployerStatus | "ALL")}>
              <TabsList className="mb-4">
                <TabsTrigger value="PENDING">
                  Pending ({statsData.pendingEmployers || 0})
                </TabsTrigger>
                <TabsTrigger value="APPROVED">
                  Approved ({statsData.approvedEmployers || 0})
                </TabsTrigger>
                <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
                <TabsTrigger value="ALL">All</TabsTrigger>
              </TabsList>

              <TabsContent value={statusFilter} className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading employers...
                  </div>
                ) : employers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No employers found</p>
                  </div>
                ) : (
                  employers.map((employer: any) => (
                    <Card key={employer.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback>{employer.companyName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{employer.companyName}</h3>
                                {getStatusBadge(employer.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{employer.user?.email}</p>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Location:</span>{" "}
                                  <span className="font-medium">{employer.location}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Company Size:</span>{" "}
                                  <span className="font-medium">{employer.companySize}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">GST Number:</span>{" "}
                                  <span className="font-medium">{employer.gstNumber}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Registered:</span>{" "}
                                  <span className="font-medium">
                                    {new Date(employer.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {employer.status === "PENDING" && (
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => approveMutation.mutate(employer.id)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectMutation.mutate(employer.id)}
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
