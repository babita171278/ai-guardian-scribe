import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { Brain, Play, AlertTriangle, CheckCircle } from "lucide-react";
import { apiService } from "@/services/api";
import { RelevancyLevel, SensitivityLevel } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

interface EvaluationResults {
  answerRelevancy?: any;
  bias?: any;
  faithfulness?: any;
  hallucination?: any;
  piiLeakage?: any;
  toxicity?: any;
  // OpikEval results
  opikAnswerRelevance?: any;
  opikContextPrecision?: any;
  opikContextRecall?: any;
  opikHallucination?: any;
  opikModeration?: any;
  opikUsefulness?: any;
}

export default function EvaluationMetrics() {
  const [userInput, setUserInput] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [context, setContext] = useState("");
  const [hallucinationContexts, setHallucinationContexts] = useState<string[]>([""]);
  const [expectedOutput, setExpectedOutput] = useState("");
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>("medium");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EvaluationResults>({});
  const [activeTab, setActiveTab] = useState("deepeval");
  const { toast } = useToast();

  const runEvaluation = async (metricType: string) => {
    if (!userInput.trim() || !aiOutput.trim()) {
      toast({
        title: "Missing Input",
        description: "Please provide both user input and AI output.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let result;
      
      switch (metricType) {
        case "answer-relevancy":
          result = await apiService.evaluateAnswerRelevancy({
            user_input: userInput,
            ai_output: aiOutput,
            sensitivity
          });
          setResults(prev => ({ ...prev, answerRelevancy: result }));
          break;
          
        case "bias":
          result = await apiService.evaluateBias({
            ai_output: aiOutput,
            user_input: userInput
          });
          setResults(prev => ({ ...prev, bias: result }));
          break;
          
        case "faithfulness":
          if (!context.trim()) {
            toast({
              title: "Missing Context",
              description: "Context is required for faithfulness evaluation.",
              variant: "destructive",
            });
            return;
          }
          result = await apiService.evaluateFaithfulness({
            actual_output: aiOutput,
            retrieval_context: context,
            user_input: userInput,
            sensitivity
          });
          setResults(prev => ({ ...prev, faithfulness: result }));
          break;
          
        case "hallucination":
          {
            const ctxs = hallucinationContexts.map((c) => c.trim()).filter(Boolean);
            if (!ctxs.length) {
              toast({
                title: "Missing Context",
                description: "At least one context is required for hallucination evaluation.",
                variant: "destructive",
              });
              return;
            }
            result = await apiService.evaluateHallucination({
              actual_output: aiOutput,
              contexts: ctxs,
              user_input: userInput,
              sensitivity,
            });
            setResults((prev) => ({ ...prev, hallucination: result }));
          }
          break;
          
        case "pii-leakage":
          result = await apiService.evaluatePiiLeakage({
            ai_output: aiOutput,
            user_input: userInput,
            sensitivity: sensitivity
          });
          setResults(prev => ({ ...prev, piiLeakage: result }));
          break;
          
        case "toxicity":
          result = await apiService.evaluateToxicity({
            ai_output: aiOutput,
            user_input: userInput,
            sensitivity: sensitivity
          });
          setResults(prev => ({ ...prev, toxicity: result }));
          break;
      }

      toast({
        title: "Evaluation Complete",
        description: `${metricType} evaluation completed successfully.`,
      });

    } catch (error: any) {
      toast({
        title: "Evaluation Failed",
        description: error.message || "Failed to run evaluation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runOpikEvaluation = async (metricType: string) => {
    if (!userInput.trim() || !aiOutput.trim()) {
      toast({
        title: "Missing Input",
        description: "Please provide both user input and AI output.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let result;
      
      switch (metricType) {
        case "answer-relevance":
          result = await apiService.evaluateAnswerRelevance({
            user_input: userInput,
            ai_output: aiOutput,
            sensitivity
          });
          setResults(prev => ({ ...prev, opikAnswerRelevance: result }));
          break;
          
        case "context-precision":
          if (!context.trim()) {
            toast({
              title: "Missing Context",
              description: "Context is required for context precision evaluation.",
              variant: "destructive",
            });
            return;
          }
          if (!expectedOutput.trim()) {
            toast({
              title: "Missing Expected Output",
              description: "Expected Output is required for context precision evaluation.",
              variant: "destructive",
            });
            return;
          }
          result = await apiService.evaluateContextPrecision({
            user_input: userInput,
            ai_output: aiOutput,
            expected_output: expectedOutput,
            context: context,
            sensitivity,
          });
          setResults((prev) => ({ ...prev, opikContextPrecision: result }));
          break;
          
        case "context-recall":
          if (!context.trim()) {
            toast({
              title: "Missing Context",
              description: "Context is required for context recall evaluation.",
              variant: "destructive",
            });
            return;
          }
          if (!expectedOutput.trim()) {
            toast({
              title: "Missing Expected Output",
              description: "Expected Output is required for context recall evaluation.",
              variant: "destructive",
            });
            return;
          }
          result = await apiService.evaluateContextRecall({
            user_input: userInput,
            ai_output: aiOutput,
            expected_output: expectedOutput,
            context: context,
            sensitivity,
          });
          setResults((prev) => ({ ...prev, opikContextRecall: result }));
          break;
          
        case "hallucination":
          if (!context.trim()) {
            toast({
              title: "Missing Context",
              description: "Context is required for hallucination evaluation.",
              variant: "destructive",
            });
            return;
          }
          result = await apiService.evaluateOpikHallucination({
            input_text: userInput,
            context: context,
            output: aiOutput,
          });
          setResults((prev) => ({ ...prev, opikHallucination: result }));
          break;
          
        case "moderation":
          result = await apiService.moderateContent({
            text: aiOutput,
            sensitivity
          });
          setResults(prev => ({ ...prev, opikModeration: result }));
          break;
          
        case "usefulness":
          result = await apiService.evaluateUsefulness({
            user_input: userInput,
            ai_output: aiOutput,
          });
          setResults(prev => ({ ...prev, opikUsefulness: result }));
          break;
      }

      toast({
        title: "Evaluation Complete",
        description: `OpikEval ${metricType} evaluation completed successfully.`,
      });

    } catch (error: any) {
      console.error("OpikEval error:", error);
      toast({
        title: "Evaluation Failed",
        description: error.message || "Failed to run evaluation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "excellent": return "bg-excellent text-success-foreground";
      case "good": return "bg-good text-success-foreground";
      case "fair": return "bg-fair text-warning-foreground";
      case "poor": return "bg-poor text-error-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const shouldShowAlert = (result: any) => {
    if (!result) return false;
    const level = getResultLevel(result);
    return level === "poor" || level === "fair";
  };

  const getResultLevel = (result: any) => {
    if (!result) return "N/A";
    
    // Handle different result structures
    return result.relevancy_level || 
           result.bias_level || 
           result.faithfulness_level || 
           result.hallucination_level || 
           result.privacy_level || 
           result.toxicity_level ||
           result.recall_level || 
           result.precision_level || 
           result.usefulness_level || 
           result.safety_level || 
           "N/A";
  };

  const getResultScore = (result: any) => {
    if (!result) return null;
    
    // Handle different score formats
    if (result.score !== undefined) {
      // OpikEval scores are already 0-100 or 0-1, normalize to percentage
      return result.score <= 1 ? Math.round(result.score * 100) : Math.round(result.score);
    }
    
    if (result.answer_relevance_score !== undefined) {
      return Math.round(result.answer_relevance_score * 100);
    }
    
    if (result.context_precision_score !== undefined) {
      return Math.round(result.context_precision_score * 100);
    }
    
    if (result.context_recall_score !== undefined) {
      return Math.round(result.context_recall_score * 100);
    }
    
    // DeepEval percentage scores
    return result.relevancy_percentage || 
           result.bias_percentage || 
           result.faithfulness_percentage || 
           result.hallucination_percentage ||
           result.privacy_percentage || 
           result.toxicity_percentage || 
           null;
  };

  const getResultReason = (result: any) => {
    if (!result) return "";
    
    if (Array.isArray(result.reason)) {
      return result.reason.join(". ");
    }
    
    return result.reason || "";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Evaluation Metrics</h2>
          <p className="text-muted-foreground">
            Test your AI responses against various quality and safety metrics.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Input Configuration
                </CardTitle>
                <CardDescription>
                  Configure your evaluation inputs and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-input">User Input</Label>
                  <Textarea
                    id="user-input"
                    placeholder="Enter the user's question or prompt..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-output">AI Output</Label>
                  <Textarea
                    id="ai-output"
                    placeholder="Enter the AI's response..."
                    value={aiOutput}
                    onChange={(e) => setAiOutput(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">Context (For Context-based Metrics)</Label>
                  <Textarea
                    id="context"
                    placeholder="Enter context for evaluation..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hallucination Contexts (DeepEval)</Label>
                  <div className="space-y-2">
                    {hallucinationContexts.map((ctx, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Textarea
                          placeholder={`Context ${idx + 1}`}
                          value={ctx}
                          onChange={(e) => {
                            const next = [...hallucinationContexts];
                            next[idx] = e.target.value;
                            setHallucinationContexts(next);
                          }}
                          className="min-h-[60px] flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const next = hallucinationContexts.filter((_, i) => i !== idx);
                            setHallucinationContexts(next.length ? next : [""]);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHallucinationContexts([...hallucinationContexts, ""])}
                    >
                      Add Context
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expected-output">Expected Output (OpikEval Context Metrics)</Label>
                  <Textarea
                    id="expected-output"
                    placeholder="Enter expected output for precision/recall checks..."
                    value={expectedOutput}
                    onChange={(e) => setExpectedOutput(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sensitivity">Sensitivity Level</Label>
                  <Select value={sensitivity} onValueChange={(value: SensitivityLevel) => setSensitivity(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - More lenient</SelectItem>
                      <SelectItem value="medium">Medium - Balanced</SelectItem>
                      <SelectItem value="high">High - Stricter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evaluation Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Results</CardTitle>
                <CardDescription>
                  Run evaluations using DeepEval and OpikEval metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="deepeval">DeepEval Metrics</TabsTrigger>
                    <TabsTrigger value="opikeval">OpikEval Metrics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="deepeval" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { key: "answer-relevancy", label: "Answer Relevancy", result: results.answerRelevancy },
                        { key: "bias", label: "Bias Detection", result: results.bias },
                        { key: "faithfulness", label: "Faithfulness", result: results.faithfulness },
                        { key: "hallucination", label: "Hallucination", result: results.hallucination },
                        { key: "pii-leakage", label: "PII Leakage", result: results.piiLeakage },
                        { key: "toxicity", label: "Toxicity", result: results.toxicity },
                      ].map(({ key, label, result }) => (
                        <Card key={key} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{label}</h4>
                            <Button
                              size="sm"
                              onClick={() => runEvaluation(key)}
                              disabled={loading}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Run
                            </Button>
                          </div>
                          
                          {result && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className={getLevelColor(getResultLevel(result))}>
                                  {getResultLevel(result)}
                                </Badge>
                                {getResultScore(result) !== null && (
                                  <span className="text-sm text-muted-foreground">
                                    {getResultScore(result)}%
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{getResultReason(result)}</p>
                              
                              {shouldShowAlert(result) && (
                                <AlertCard
                                  type="evaluation"
                                  severity={getResultLevel(result) === "poor" ? "high" : "medium"}
                                  title={`${label} Alert`}
                                  description={`Evaluation scored: ${getResultLevel(result)}`}
                                  timestamp="Just now"
                                />
                              )}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="opikeval" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { key: "answer-relevance", label: "Answer Relevance", result: results.opikAnswerRelevance },
                        { key: "context-precision", label: "Context Precision", result: results.opikContextPrecision },
                        { key: "context-recall", label: "Context Recall", result: results.opikContextRecall },
                        { key: "hallucination", label: "Hallucination", result: results.opikHallucination },
                        { key: "moderation", label: "Moderation", result: results.opikModeration },
                        { key: "usefulness", label: "Usefulness", result: results.opikUsefulness }
                      ].map(({ key, label, result }) => (
                        <Card key={key} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{label}</h4>
                            <Button
                              size="sm"
                              onClick={() => runOpikEvaluation(key)}
                              disabled={loading}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Run
                            </Button>
                          </div>
                          
                          {result && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className={getLevelColor(getResultLevel(result))}>
                                  {getResultLevel(result)}
                                </Badge>
                                {getResultScore(result) !== null && (
                                  <span className="text-sm text-muted-foreground">
                                    {getResultScore(result)}%
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{getResultReason(result)}</p>
                              
                              {shouldShowAlert(result) && (
                                <AlertCard
                                  type="evaluation"
                                  severity={getResultLevel(result) === "poor" ? "high" : "medium"}
                                  title={`${label} Alert`}
                                  description={`Evaluation scored: ${getResultLevel(result)}`}
                                  timestamp="Just now"
                                />
                              )}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => {
                  setUserInput("What is artificial intelligence?");
                  setAiOutput("Artificial intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans.");
                  setContext("AI is a branch of computer science that deals with creating intelligent machines.");
                  setExpectedOutput("AI is a field of computer science focused on creating systems that can perform tasks that typically require human intelligence.");
                }}
              >
                Load Sample Data
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setUserInput("");
                  setAiOutput("");
                  setContext("");
                  setHallucinationContexts([""]);
                  setExpectedOutput("");
                  setResults({});
                }}
              >
                Clear All
              </Button>
              <Button
                onClick={async () => {
                  for (const metric of ["answer-relevancy", "bias", "toxicity"]) {
                    await runEvaluation(metric);
                  }
                }}
                disabled={loading}
              >
                Run All Basic Metrics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
