import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Brain, ChevronDown, ChevronRight, Eye, Lightbulb, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import type { ExplainabilityAnalysisRequest, ExplainabilityAnalysisResult, ExplainabilityModelsResponse } from "@/types/api";

export default function Explainability() {
  const [userInput, setUserInput] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [temperature, setTemperature] = useState(0.1);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [models, setModels] = useState<Record<string, string>>({});
  const [analysisResult, setAnalysisResult] = useState<ExplainabilityAnalysisResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await apiService.getExplainabilityModels();
      setModels(response.models);
      if (Object.keys(response.models).length > 0) {
        setSelectedModel(Object.keys(response.models)[0]);
      }
    } catch (error) {
      toast.error("Failed to fetch available models");
      console.error("Failed to fetch models:", error);
    }
  };

  const handleAnalyze = async () => {
    if (!userInput || !systemPrompt || !selectedModel) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const request: ExplainabilityAnalysisRequest = {
        user_input: userInput,
        system_prompt: systemPrompt,
        llm_model: selectedModel,
        temperature: temperature,
        max_tokens: maxTokens
      };

      const result = await apiService.runCompleteAnalysis(request);
      setAnalysisResult(result);
      toast.success("Analysis completed successfully!");
      
      // Auto-expand key sections
      setExpandedSections({
        'prompt_adherence': true,
        'behavioral_analysis': true,
        'quantitative': true
      });
    } catch (error) {
      toast.error("Analysis failed. Please try again.");
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-metric-excellent";
    if (score >= 6) return "text-metric-good";
    if (score >= 4) return "text-metric-fair";
    return "text-metric-poor";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-metric-excellent/10 border-metric-excellent/20";
    if (score >= 6) return "bg-metric-good/10 border-metric-good/20";
    if (score >= 4) return "bg-metric-fair/10 border-metric-fair/20";
    return "bg-metric-poor/10 border-metric-poor/20";
  };

  const getAdherenceColor = (strength: string) => {
    switch (strength.toLowerCase()) {
      case 'strong': return "text-metric-excellent";
      case 'moderate': return "text-metric-good";
      case 'weak': return "text-metric-fair";
      default: return "text-metric-poor";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Explainability Analysis
            </h1>
            <p className="text-muted-foreground">
              Analyze how well AI responses align with system prompts and instructions
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <Card className="col-span-1 transition-all duration-300 hover:shadow-elegant border-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Set up your analysis parameters and model configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userInput">User Input *</Label>
                <Textarea
                  id="userInput"
                  placeholder="Enter the user's question or prompt..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="min-h-[100px] transition-all duration-200 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt *</Label>
                <Textarea
                  id="systemPrompt"
                  placeholder="Enter the system prompt that guides the AI behavior..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[120px] transition-all duration-200 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(models).map(([model, provider]) => (
                        <SelectItem key={model} value={model}>
                          <div className="flex items-center gap-2">
                            <span>{model}</span>
                            <Badge variant="outline" className="text-xs">
                              {provider}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="transition-all duration-200 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="1"
                  max="4000"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="transition-all duration-200 focus:ring-primary/50"
                />
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={loading || !userInput || !systemPrompt || !selectedModel}
                className="w-full transition-all duration-300 hover-scale bg-gradient-primary"
                size="lg"
              >
                {analyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Visualize Analysis
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card className="col-span-1 transition-all duration-300 hover:shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                Comprehensive explainability analysis and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!analysisResult ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Brain className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Configure your parameters and click "Visualize Analysis" to begin
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6 animate-fade-in">
                    {/* Explainability Score */}
                    <div className={`p-4 rounded-lg border ${getScoreBgColor(analysisResult.explainability_score)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Explainability Score</h3>
                        <span className={`text-2xl font-bold ${getScoreColor(analysisResult.explainability_score)}`}>
                          {analysisResult.explainability_score}/10
                        </span>
                      </div>
                      <Progress 
                        value={analysisResult.explainability_score * 10} 
                        className="h-2 transition-all duration-500"
                      />
                    </div>

                    {/* LLM Response */}
                    <div className="space-y-2">
                      <button
                        onClick={() => toggleSection('llm_response')}
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                      >
                        {expandedSections['llm_response'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        AI Response
                      </button>
                      {expandedSections['llm_response'] && (
                        <div className="p-3 bg-muted/50 rounded-lg animate-fade-in">
                          <p className="text-sm whitespace-pre-wrap">{analysisResult.llm_response}</p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Prompt Adherence */}
                    <div className="space-y-3">
                      <button
                        onClick={() => toggleSection('prompt_adherence')}
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                      >
                        {expandedSections['prompt_adherence'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        Prompt Adherence Analysis
                      </button>
                      {expandedSections['prompt_adherence'] && (
                        <div className="space-y-3 animate-fade-in">
                          {analysisResult.prompt_adherence.map((item, index) => (
                            <div key={index} className="border rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">Instruction {index + 1}</h4>
                                <Badge 
                                  variant="outline" 
                                  className={getAdherenceColor(item.adherence_strength)}
                                >
                                  {item.adherence_strength}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground italic">"{item.instruction}"</p>
                              <p className="text-xs">{item.explanation}</p>
                              {item.examples.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs font-medium">Examples:</p>
                                  <ul className="text-xs space-y-1">
                                    {item.examples.map((example, idx) => (
                                      <li key={idx} className="text-muted-foreground">• {example}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Behavioral Analysis */}
                    <div className="space-y-3">
                      <button
                        onClick={() => toggleSection('behavioral_analysis')}
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                      >
                        {expandedSections['behavioral_analysis'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        Behavioral Analysis
                      </button>
                      {expandedSections['behavioral_analysis'] && (
                        <div className="space-y-3 animate-fade-in">
                          <Tabs defaultValue="tone" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="tone" className="text-xs">Tone</TabsTrigger>
                              <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
                              <TabsTrigger value="engagement" className="text-xs">Engagement</TabsTrigger>
                            </TabsList>
                            <TabsContent value="tone" className="space-y-2">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <p className="text-xs font-medium">Requested Tone:</p>
                                  <ul className="text-xs space-y-1">
                                    {analysisResult.behavioral_analysis.tone_analysis.requested_tone.map((tone, idx) => (
                                      <li key={idx} className="text-muted-foreground">• {tone}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xs font-medium">Actual Tone:</p>
                                  <ul className="text-xs space-y-1">
                                    {analysisResult.behavioral_analysis.tone_analysis.actual_tone.map((tone, idx) => (
                                      <li key={idx} className="text-muted-foreground">• {tone}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="style" className="space-y-2">
                              <p className="text-xs font-medium">Style Elements:</p>
                              <ul className="text-xs space-y-1">
                                {analysisResult.behavioral_analysis.style_elements.map((element, idx) => (
                                  <li key={idx} className="text-muted-foreground">• {element}</li>
                                ))}
                              </ul>
                              <div className="mt-3">
                                <p className="text-xs font-medium">Persona Consistency:</p>
                                <p className="text-xs text-muted-foreground">{analysisResult.behavioral_analysis.persona_consistency}</p>
                              </div>
                            </TabsContent>
                            <TabsContent value="engagement" className="space-y-2">
                              <p className="text-xs font-medium">Engagement Techniques:</p>
                              <ul className="text-xs space-y-1">
                                {analysisResult.behavioral_analysis.engagement_techniques.map((technique, idx) => (
                                  <li key={idx} className="text-muted-foreground">• {technique}</li>
                                ))}
                              </ul>
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Quantitative Assessment */}
                    <div className="space-y-3">
                      <button
                        onClick={() => toggleSection('quantitative')}
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                      >
                        {expandedSections['quantitative'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        Quantitative Metrics
                      </button>
                      {expandedSections['quantitative'] && (
                        <div className="space-y-3 animate-fade-in">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-2 bg-muted/50 rounded">
                              <p className="text-lg font-bold text-metric-excellent">
                                {analysisResult.quantitative_assessment.response_segments.following_instructions}%
                              </p>
                              <p className="text-xs text-muted-foreground">Following Instructions</p>
                            </div>
                            <div className="text-center p-2 bg-muted/50 rounded">
                              <p className="text-lg font-bold text-metric-good">
                                {analysisResult.quantitative_assessment.response_segments.persona_maintenance}%
                              </p>
                              <p className="text-xs text-muted-foreground">Persona Maintenance</p>
                            </div>
                            <div className="text-center p-2 bg-muted/50 rounded">
                              <p className="text-lg font-bold text-metric-fair">
                                {analysisResult.quantitative_assessment.response_segments.constraint_adherence}%
                              </p>
                              <p className="text-xs text-muted-foreground">Constraint Adherence</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium mb-2">Coverage: {analysisResult.quantitative_assessment.instruction_coverage}</p>
                            {analysisResult.quantitative_assessment.deviation_analysis.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1">Deviations:</p>
                                <ul className="text-xs space-y-1">
                                  {analysisResult.quantitative_assessment.deviation_analysis.map((deviation, idx) => (
                                    <li key={idx} className="text-muted-foreground flex items-start gap-1">
                                      <AlertCircle className="h-3 w-3 mt-0.5 text-warning flex-shrink-0" />
                                      {deviation}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Improvement Recommendations */}
                    <div className="space-y-3">
                      <button
                        onClick={() => toggleSection('recommendations')}
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                      >
                        {expandedSections['recommendations'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        Improvement Recommendations
                      </button>
                      {expandedSections['recommendations'] && (
                        <div className="space-y-2 animate-fade-in">
                          {analysisResult.improvement_recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-primary/5 rounded border-l-2 border-primary">
                              <Lightbulb className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                              <p className="text-xs">{recommendation}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}