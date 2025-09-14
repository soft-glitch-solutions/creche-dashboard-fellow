// components/students/StudentListSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export const StudentListSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      ))}
    </div>
  );
};