import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const ApplicationProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    {/* Back Button */}
    <Skeleton className="h-10 w-24" />

    {/* Header Card */}
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      {/* Lifecycle */}
      <div className="flex items-center gap-3 overflow-x-auto py-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
            {i < 4 && <Skeleton className="h-0.5 w-8" />}
          </div>
        ))}
      </div>
    </Card>

    {/* Tabs */}
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <Card className="p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </Card>
    </div>
  </div>
);
