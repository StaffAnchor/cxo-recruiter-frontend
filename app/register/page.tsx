"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Building2, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-4xl">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Join CXO Recruiter</h1>
          <p className="text-muted-foreground">Choose your account type to get started</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/register/candidate" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <UserCircle className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>I'm a Candidate</CardTitle>
                <CardDescription>
                  Looking for executive opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Create your professional profile</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Get matched with top employers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Apply to exclusive CXO positions</span>
                  </li>
                </ul>
                <Button className="w-full">Register as Candidate</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/register/employer" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>I'm an Employer</CardTitle>
                <CardDescription>
                  Looking to hire top executives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Post executive job openings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Access qualified candidates</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Streamline your hiring process</span>
                  </li>
                </ul>
                <Button className="w-full" variant="secondary">
                  Register as Employer
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
