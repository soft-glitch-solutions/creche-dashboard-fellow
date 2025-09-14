// components/SocialSkeletons.tsx
import { Skeleton } from "@/components/ui/skeleton";

export const ArticleSkeleton = () => (
  <div className="p-6 border rounded-lg">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mt-4" />
    <Skeleton className="h-4 w-3/4 mt-2" />
    <div className="mt-6 flex items-center gap-4">
      <Skeleton className="h-8 w-20 rounded-md" />
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  </div>
);

export const PaginationSkeleton = () => (
  <div className="flex justify-center gap-2">
    <Skeleton className="h-8 w-8 rounded-md" />
    <Skeleton className="h-8 w-8 rounded-md" />
    <Skeleton className="h-8 w-8 rounded-md" />
    <Skeleton className="h-8 w-8 rounded-md" />
    <Skeleton className="h-8 w-8 rounded-md" />
  </div>
);