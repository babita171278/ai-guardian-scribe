import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { 
  MessageSquare, 
  Send, 
  Shield, 
  User, 
  Bot, 
  AlertTriangle,
  Settings,
  Trash2
} from "lucide-react";
import { apiService } from "@/services/api";
import { GuardrailType, SensitivityLevel } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: string;
  guardrailResults?: any[];
  alerts?: Array<{
    type: "vulnerability" | "guardrail";
    severity: "high" | "medium" | "low";
    title: string;
    description: string;
    details: string[];
  }>;
}

const GUARDRAIL_OPTIONS = [
  { id: "cybersecurity", label: "Cybersecurity", description: "Detect SQL injection, shell injection, etc." },
  { id: "illegal", label: "Illegal Content", description: "Detect requests for illegal activities" },
  { id: "privacy", label: "Privacy/PII", description: "Detect personally identifiable information" },
  { id: "prompt-injection", label: "Prompt Injection", description: "Detect manipulation attempts" },
  { id: "toxicity", label: "Toxicity", description: "Detect toxic content and hate speech" },
];

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedGuardrails, setSelectedGuardrails] = useState<string[]>(["cybersecurity", "toxicity"]);
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>("medium");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const runGuardrailChecks = async (input: string, output?: string) => {
    const results = [];
    const alerts = [];

    for (const guardrailType of selectedGuardrails) {
      try {
        let result;
        
        switch (guardrailType) {
          case "cybersecurity":
            result = await apiService.scanCybersecurityInput({
              input_text: input,
              categories: ["SQL injection", "Shell injection", "XSS", "Command injection"],
              sensitivity,
            });
            
            if ((result as any).safety_level === "unsafe") {
              alerts.push({
                type: "vulnerability" as const,
                severity: "high" as const,
                title: "Cybersecurity Threat Detected",
                description: (result as any).reason,
                details: (result as any).threats_detected || [],
              });
            }
            
            if (output) {
              const outputResult = await apiService.scanCybersecurityOutput({
                input_text: input,
                output_text: output,
                categories: ["Information Disclosure", "Credential Leakage"],
                sensitivity,
              });
              
              if ((outputResult as any).safety_level === "unsafe") {
                alerts.push({
                  type: "vulnerability" as const,
                  severity: "high" as const, 
                  title: "Output Security Risk",
                  description: (outputResult as any).reason,
                  details: (outputResult as any).threats_detected || [],
                });
              }
            }
            break;

          case "illegal":
            result = await apiService.scanIllegalInput({
              input_text: input,
              sensitivity,
            });
            
            if ((result as any).safety_level === "unsafe") {
              alerts.push({
                type: "guardrail" as const,
                severity: "high" as const,
                title: "Illegal Content Detected",
                description: (result as any).reason,
                details: (result as any).illegal_categories || [],
              });
            }
            break;

          case "privacy":
            result = await apiService.scanPrivacyInput({
              input_text: input,
              sensitivity,
            });
            
            if ((result as any).safety_level === "unsafe") {
              alerts.push({
                type: "guardrail" as const,
                severity: "medium" as const,
                title: "PII Detected",
                description: (result as any).reason,
                details: (result as any).pii_detected || [],
              });
            }
            break;

          case "prompt-injection":
            result = await apiService.scanPromptInjectionInput({
              input_text: input,
            });
            
            if ((result as any).safety_level === "unsafe") {
              alerts.push({
                type: "vulnerability" as const,
                severity: "high" as const,
                title: "Prompt Injection Attempt",
                description: (result as any).reason,
                details: (result as any).injection_techniques || [],
              });
            }
            break;

          case "toxicity":
            result = await apiService.scanToxicityInput({
              input_text: input,
              sensitivity,
            });
            
            if ((result as any).safety_level === "unsafe") {
              alerts.push({
                type: "guardrail" as const,
                severity: "medium" as const,
                title: "Toxic Content Detected",
                description: (result as any).reason,
                details: (result as any).toxicity_categories || [],
              });
            }
            break;
        }
        
        results.push({ type: guardrailType, result });
      } catch (error) {
        console.error(`Guardrail check failed for ${guardrailType}:`, error);
      }
    }

    return { results, alerts };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      type: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Run input guardrails first
      const { alerts: inputAlerts } = await runGuardrailChecks(inputMessage);
      
      // If high-severity alerts, block the request
      const hasBlockingAlerts = inputAlerts.some(alert => alert.severity === "high");
      
      if (hasBlockingAlerts) {
        const blockedMessage: Message = {
          id: Date.now().toString() + "-blocked",
          type: "bot",
          content: "⚠️ Message blocked due to security concerns. Please revise your input.",
          timestamp: new Date().toISOString(),
          alerts: inputAlerts,
        };
        
        setMessages(prev => [...prev, blockedMessage]);
        
        toast({
          title: "Message Blocked",
          description: "Input failed security checks.",
          variant: "destructive",
        });
        
        setInputMessage("");
        setLoading(false);
        return;
      }

      // Get AI response
      const aiResponse = await apiService.chatWithGemini({
        input_text: inputMessage,
      });

      // Run output guardrails
      const { alerts: outputAlerts } = await runGuardrailChecks(inputMessage, (aiResponse as any).response);

      const botMessage: Message = {
        id: Date.now().toString() + "-bot",
        type: "bot",
        content: (aiResponse as any).response,
        timestamp: new Date().toISOString(),
        alerts: [...inputAlerts, ...outputAlerts],
      };

      setMessages(prev => [...prev, botMessage]);

      if (inputAlerts.length > 0 || outputAlerts.length > 0) {
        toast({
          title: "Security Alerts",
          description: `${inputAlerts.length + outputAlerts.length} security issues detected.`,
          variant: "destructive",
        });
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        type: "bot",
        content: "Sorry, I encountered an error processing your request.",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setInputMessage("");
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">AI Chatbot</h2>
            <p className="text-muted-foreground">
              Chat with AI while monitoring guardrails and security in real-time.
            </p>
          </div>
          <Button variant="outline" onClick={clearChat}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Guardrail Settings */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Guardrail Settings
                </CardTitle>
                <CardDescription>
                  Select which guardrails to activate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Active Guardrails</Label>
                  <div className="space-y-3">
                    {GUARDRAIL_OPTIONS.map((option) => (
                      <div key={option.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={selectedGuardrails.includes(option.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedGuardrails([...selectedGuardrails, option.id]);
                            } else {
                              setSelectedGuardrails(selectedGuardrails.filter(id => id !== option.id));
                            }
                          }}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor={option.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium mb-2 block">Sensitivity Level</Label>
                  <div className="grid gap-2">
                    {(["low", "medium", "high"] as SensitivityLevel[]).map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={level}
                          checked={sensitivity === level}
                          onCheckedChange={() => setSensitivity(level)}
                        />
                        <Label htmlFor={level} className="text-sm capitalize">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">
                      {selectedGuardrails.length} guardrails active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat Interface
                </CardTitle>
                <CardDescription>
                  Interact with the AI while guardrails monitor for security issues
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Start a conversation with the AI assistant.</p>
                        <p className="text-sm">Active guardrails will monitor for security issues.</p>
                      </div>
                    )}
                    
                    {messages.map((message) => (
                      <div key={message.id} className="space-y-3">
                        <div className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.type === "user" ? "bg-primary" : "bg-muted"
                            }`}>
                              {message.type === "user" ? (
                                <User className="h-4 w-4 text-primary-foreground" />
                              ) : (
                                <Bot className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className={`rounded-lg px-4 py-2 ${
                              message.type === "user" 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted"
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {message.alerts && message.alerts.length > 0 && (
                          <div className="space-y-2 ml-11">
                            {message.alerts.map((alert, index) => (
                              <AlertCard
                                key={index}
                                type={alert.type}
                                severity={alert.severity}
                                title={alert.title}
                                description={alert.description}
                                timestamp="Just now"
                                details={alert.details}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="min-h-[40px] max-h-[120px]"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={loading || !inputMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedGuardrails.length} guardrails active
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Sensitivity: {sensitivity}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}