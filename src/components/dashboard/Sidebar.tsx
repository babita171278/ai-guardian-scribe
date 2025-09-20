import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  MessageSquare, 
  Shield, 
  AlertCircle, 
  FileText, 
  Settings,
  Brain,
  Lock
} from "lucide-react";

const navigation = [
  {
    name: "Overview",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "Evaluation Metrics",
    href: "/metrics",
    icon: Brain,
  },
  {
    name: "Guardrails Testing",
    href: "/guardrails",
    icon: Shield,
  },
  {
    name: "AI Chatbot",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    name: "Alert Center",
    href: "/alerts",
    icon: AlertCircle,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    name: "Security Settings",
    href: "/security",
    icon: Lock,
  },
  {
    name: "Settings",
    href: "/settings", 
    icon: Settings,
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}