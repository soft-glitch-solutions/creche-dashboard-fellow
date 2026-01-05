import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const StudentProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    {/* Back Button */}
    <Skeleton className="h-10 w-24" />

    {/* Header Card */}
    <Card className="p-6 flex items-center gap-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-10 w-20" />
    </Card>

    {/* Tabs */}
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
      <Card className="p-6 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </Card>
    </div>
  </div>
);
