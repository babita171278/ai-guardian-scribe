import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  type: "vulnerability" | "evaluation" | "guardrail";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  timestamp: string;
  onDismiss?: () => void;
  details?: string[];
}

const severityConfig = {
  high: {
    color: "bg-error text-error-foreground",
    icon: AlertTriangle,
    border: "border-error/20"
  },
  medium: {
    color: "bg-warning text-warning-foreground", 
    icon: AlertTriangle,
    border: "border-warning/20"
  },
  low: {
    color: "bg-muted text-muted-foreground",
    icon: Shield,
    border: "border-muted/20"
  }
};

export function AlertCard({ 
  type, 
  severity, 
  title, 
  description, 
  timestamp, 
  onDismiss,
  details 
}: AlertCardProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <Card className={cn("border-l-4", config.border)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Badge className={cn("text-xs", config.color)}>
              {severity.toUpperCase()}
            </Badge>
          </div>
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          {type.charAt(0).toUpperCase() + type.slice(1)} Alert • {timestamp}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-foreground">{description}</p>
        {details && details.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Details:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-primary">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}