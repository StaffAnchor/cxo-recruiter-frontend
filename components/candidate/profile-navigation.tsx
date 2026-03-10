"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronRight, User, FileText, Briefcase, GraduationCap, Award, Tag } from "lucide-react";
import { type CandidateProfile } from "@/lib/api/candidate";

interface ProfileNavigationProps {
  profile: CandidateProfile | null | undefined;
}

const profileSections = [
  {
    id: "details",
    title: "Profile Details",
    icon: User,
    path: "/candidate/profile/details",
    isComplete: (profile: CandidateProfile | null | undefined) => 
      Boolean(profile?.fullName && profile?.phone && profile?.currentCity),
  },
  {
    id: "resume",
    title: "Resume",
    icon: FileText,
    path: "/candidate/profile/resume",
    isComplete: (profile: CandidateProfile | null | undefined) => 
      Boolean(profile?.resumeUrl),
  },
  {
    id: "skills",
    title: "Skills",
    icon: Award,
    path: "/candidate/profile/skills",
    isComplete: (profile: CandidateProfile | null | undefined) => 
      Boolean(profile?.skills && profile.skills.length > 0),
  },
  {
    id: "education",
    title: "Education",
    icon: GraduationCap,
    path: "/candidate/profile/education",
    isComplete: (profile: CandidateProfile | null | undefined) => 
      Boolean(profile?.education && profile.education.length > 0),
  },
  {
    id: "experience",
    title: "Experience",
    icon: Briefcase,
    path: "/candidate/profile/experience",
    isComplete: (profile: CandidateProfile | null | undefined) => 
      Boolean(profile?.experience && profile.experience.length > 0),
  },
  {
    id: "keywords",
    title: "Keywords",
    icon: Tag,
    path: "/candidate/profile/keywords",
    isComplete: (profile: CandidateProfile | null | undefined) => 
      Boolean(profile?.followedKeywords && profile.followedKeywords.length > 0),
  },
];

export function ProfileNavigation({ profile }: ProfileNavigationProps) {
  const router = useRouter();

  return (
    <div className="divide-y">
      {profileSections.map((section) => {
        const Icon = section.icon;
        const completed = section.isComplete(profile);
        
        return (
          <button
            key={section.id}
            onClick={() => router.push(section.path)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                completed ? "bg-green-100" : "bg-muted"
              }`}>
                {completed ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Icon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">{section.title}</p>
                <p className="text-xs text-muted-foreground">
                  {completed ? "Completed" : "Not completed"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        );
      })}
    </div>
  );
}
