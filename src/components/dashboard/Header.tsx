import { Shield, Activity, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Responsible AI Dashboard
            </h1>
          </div>
          <Badge variant="secondary" className="ml-2">
            v1.0.0
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-success" />
            <span>API Status: Connected</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span>Active Monitoring</span>
          </div>
        </div>
      </div>
    </header>
  );
}