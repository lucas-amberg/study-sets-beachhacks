"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import supabase from "@/lib/supabase";

import { PlusSquare, BarChart2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StudySet } from "@/lib/supabase";

export default function Sidebar() {
    const [studySets, setStudySets] = useState<StudySet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchStudySets = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from("study_sets")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) {
                    throw error;
                }

                setStudySets(data || []);
            } catch (error) {
                console.error("Error fetching study sets:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudySets();

        // Listen for real-time database changes
        const channel = supabase
            .channel("study_sets_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "study_sets" },
                () => {
                    fetchStudySets();
                },
            )
            .subscribe();

        // Listen for custom event when a study set is created
        const handleStudySetCreated = (e: any) => {
            fetchStudySets();
        };

        // Listen for custom event when a study set is updated
        const handleStudySetUpdated = (e: any) => {
            fetchStudySets();
        };

        // Listen for custom event when a study set is deleted
        const handleStudySetDeleted = (e: any) => {
            fetchStudySets();
        };

        window.addEventListener("studySetCreated", handleStudySetCreated);
        window.addEventListener("studySetUpdated", handleStudySetUpdated);
        window.addEventListener("studySetDeleted", handleStudySetDeleted);

        return () => {
            supabase.removeChannel(channel);
            window.removeEventListener(
                "studySetCreated",
                handleStudySetCreated,
            );
            window.removeEventListener(
                "studySetUpdated",
                handleStudySetUpdated,
            );
            window.removeEventListener(
                "studySetDeleted",
                handleStudySetDeleted,
            );
        };
    }, []);

    const createNewStudySet = async () => {
        // Instead of creating an empty study set, navigate to the upload page
        router.push(`/create-study-set`);
    };

    const getStudySetDisplayName = (studySet: StudySet) => {
        return studySet.name || `Study Set #${studySet.id}`;
    };

    return (
        <div className="w-64 bg-slate-100 dark:bg-slate-900 h-full flex flex-col border-r">
            <div className="p-4 border-b">
                <Link
                    href="/"
                    className="flex items-center gap-3 cursor-pointer">
                    <Image
                        src="/study-sets-logo.png"
                        alt="Study Sets Logo"
                        width={32}
                        height={32}
                        className="rounded-md"
                    />
                    <h2 className="text-xl font-bold">Study Sets</h2>
                </Link>
            </div>
            
            {/* Categories Link */}
            <div className="p-4 border-b">
                <Link
                    href="/categories"
                    className={`flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${
                        pathname === "/categories" ? "bg-slate-200 dark:bg-slate-800" : ""
                    }`}
                >
                    <Tag className="h-4 w-4" />
                    <span>Browse Categories</span>
                </Link>
            </div>

            <div className="flex-1 overflow-auto">
                {isLoading ? (
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : studySets.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <p>No study sets yet</p>
                        <p className="text-sm">Create your first one!</p>
                    </div>
                ) : (
                    <div className="p-2">
                        {studySets.map((studySet) => (
                            <Link
                                key={studySet.id}
                                href={`/study-set/${studySet.id}`}
                                className={`block p-2 rounded-md mb-1 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${
                                    pathname === `/study-set/${studySet.id}`
                                        ? "bg-slate-200 dark:bg-slate-800"
                                        : ""
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">
                                            {getStudySetDisplayName(studySet)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(
                                                studySet.created_at,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <div className="p-4 border-t mt-auto">
                <div className="space-y-2">
                    <Link href="/stats">
                        <Button
                            className="w-full flex items-center justify-center gap-2"
                            variant="secondary">
                            <BarChart2 className="h-5 w-5" />
                            <span>View Stats</span>
                        </Button>
                    </Link>

                    <Button
                        onClick={createNewStudySet}
                        className="w-full flex items-center justify-center gap-2"
                        variant="outline">
                        <PlusSquare className="h-5 w-5" />
                        <span>Create New Set</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
