import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RelevancyLevel } from "@/types/api";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  level?: RelevancyLevel;
  description?: string;
  trend?: "up" | "down" | "stable";
  icon?: React.ReactNode;
}

const levelColors = {
  excellent: "bg-excellent text-success-foreground",
  good: "bg-good text-success-foreground", 
  fair: "bg-fair text-warning-foreground",
  poor: "bg-poor text-error-foreground",
};

export function MetricCard({ title, value, level, description, trend, icon }: MetricCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {level && (
            <Badge 
              className={cn(
                "capitalize",
                levelColors[level]
              )}
            >
              {level}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}