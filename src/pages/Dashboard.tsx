import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Shield, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  MessageSquare,
  FileText,
  Eye
} from "lucide-react";
import { useState, useEffect } from "react";
import { EvaluationResult, GuardrailResult } from "@/types/api";

// Mock data for demonstration
const mockMetrics = [
  {
    title: "Total Evaluations",
    value: "1,247",
    description: "This month",
    icon: <Brain className="h-4 w-4" />,
  },
  {
    title: "Average Relevancy",
    value: "87%",
    level: "good" as const,
    description: "Across all inputs",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    title: "Threats Blocked",
    value: "23",
    description: "Last 24 hours",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    title: "Active Alerts",
    value: "5",
    description: "Requires attention",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
];

const mockAlerts = [
  {
    type: "vulnerability" as const,
    severity: "high" as const,
    title: "Potential SQL Injection Detected",
    description: "User input contains patterns consistent with SQL injection attempts.",
    timestamp: "2 minutes ago",
    details: ["Pattern: UNION SELECT", "Confidence: 95%", "Source: Chat Interface"]
  },
  {
    type: "evaluation" as const,
    severity: "medium" as const,
    title: "Poor Relevancy Score",
    description: "AI response scored 'poor' in relevancy evaluation.",
    timestamp: "15 minutes ago",
    details: ["Score: 32%", "Metric: Answer Relevancy", "Input: Technical question"]
  },
  {
    type: "guardrail" as const,
    severity: "low" as const,
    title: "Privacy Scan Complete",
    description: "No PII detected in recent batch processing.",
    timestamp: "1 hour ago",
    details: ["Scanned: 156 inputs", "PII Found: 0", "False Positives: 2"]
  },
];

const recentEvaluations = [
  {
    id: "1",
    timestamp: "2024-01-20 14:30:00",
    metric: "Answer Relevancy",
    level: "excellent" as const,
    score: 94,
    input: "What is machine learning?",
    output: "Machine learning is a subset of artificial intelligence...",
  },
  {
    id: "2", 
    timestamp: "2024-01-20 14:25:00",
    metric: "Bias Detection",
    level: "good" as const,
    score: 78,
    input: "Tell me about software engineers",
    output: "Software engineers are professionals who design...",
  },
  {
    id: "3",
    timestamp: "2024-01-20 14:20:00",
    metric: "Faithfulness",
    level: "fair" as const,
    score: 65,
    input: "Explain quantum computing",
    output: "Quantum computing uses quantum mechanical phenomena...",
  },
];

export default function Dashboard() {
  const [alerts, setAlerts] = useState(mockAlerts);

  const dismissAlert = (index: number) => {
    setAlerts(alerts.filter((_, i) => i !== index));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
            <p className="text-muted-foreground">
              Monitor your AI system's performance and security in real-time.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {mockMetrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Evaluations */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Evaluations
                </CardTitle>
                <CardDescription>
                  Latest AI response evaluations and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvaluations.map((evaluation) => (
                    <div key={evaluation.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{evaluation.metric}</span>
                          <Badge 
                            variant="secondary"
                            className={
                              evaluation.level === "excellent" ? "bg-excellent text-success-foreground" :
                              evaluation.level === "good" ? "bg-good text-success-foreground" :
                              evaluation.level === "fair" ? "bg-fair text-warning-foreground" :
                              "bg-poor text-error-foreground"
                            }
                          >
                            {evaluation.level}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{evaluation.score}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-md">
                          Input: {evaluation.input}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(evaluation.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Alerts */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Active Alerts
                </CardTitle>
                <CardDescription>
                  Security and performance alerts requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <AlertCard
                      key={index}
                      {...alert}
                      onDismiss={() => dismissAlert(index)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-success"></div>
                <div>
                  <p className="font-medium">API Server</p>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-success"></div>
                <div>
                  <p className="font-medium">Evaluation Engine</p>
                  <p className="text-sm text-muted-foreground">Running</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-success"></div>
                <div>
                  <p className="font-medium">Guardrails</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}