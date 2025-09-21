import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, ChevronDown, ChevronRight, Eye, Lightbulb, Target, Zap, Settings, MessageSquare, BarChart3, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import type { ExplainabilityAnalysisRequest, ExplainabilityAnalysisResult } from "@/types/api";

// Mock data for demonstration when API fails or returns an error
const mockAnalysisResult: ExplainabilityAnalysisResult = {
  user_input: "Explain quantum computing to a 10-year-old child.",
  system_prompt: "You are a friendly science teacher who loves explaining complex topics in simple, engaging ways. Always use analogies that children can understand, keep your language simple, and include fun examples. Be encouraging and enthusiastic. End your explanations with a question to keep the child engaged.",
  llm_model: "gemini-1.5-pro",
  llm_response: "Hey there, curious scientist! Imagine you have a magical coin that can be heads AND tails at the same time - that's kind of like what quantum computing is! Regular computers use bits that are either 0 or 1, like a normal coin that's either heads or tails. But quantum computers use 'qubits' that can be 0, 1, or BOTH at once! It's like having a superpower coin that can explore all possibilities simultaneously. This helps quantum computers solve certain puzzles much faster than regular computers. What's the most amazing superpower you wish you could have?",
  explainability_score: 8,
  prompt_adherence: [
    {
      instruction: "You are a friendly science teacher who loves explaining complex topics in simple, engaging ways.",
      examples: ["Uses friendly greeting 'Hey there, curious scientist!'", "Breaks down complex quantum concepts into simple analogies"],
      adherence_strength: "Strong",
      explanation: "The response perfectly embodies a friendly science teacher persona with enthusiastic tone and simple explanations."
    },
    {
      instruction: "Always use analogies that children can understand, keep your language simple, and include fun examples.",
      examples: ["Uses 'magical coin' analogy for quantum superposition", "Compares qubits to 'superpower coin'"],
      adherence_strength: "Strong",
      explanation: "Excellent use of relatable analogies (coins, superpowers) that children can easily understand."
    }
  ],
  behavioral_analysis: {
    tone_analysis: {
      requested_tone: ["friendly science teacher", "encouraging and enthusiastic"],
      actual_tone: ["Enthusiastic and engaging", "Child-friendly and encouraging"]
    },
    style_elements: ["Simple vocabulary", "Question-based interaction"],
    persona_consistency: "Excellent - maintained friendly teacher persona throughout",
    engagement_techniques: ["Direct address", "Analogies", "Ending question"]
  },
  constraint_compliance: {
    safety_boundaries: ["Safe content appropriate for children"],
    scope_limitations: [],
    instruction_conflicts: [],
    unexpected_behaviors: []
  },
  quantitative_assessment: {
    instruction_coverage: "4/4 system prompt elements addressed",
    response_segments: {
      following_instructions: 95,
      persona_maintenance: 90,
      constraint_adherence: 100
    },
    deviation_analysis: ["Minor deviation: Could have included more specific quantum examples"]
  },
  explainability_breakdown: {
    highly_explainable: ["Direct adherence to the 'friendly teacher' persona.", "Use of the 'magical coin' analogy as requested."],
    moderately_explainable: ["The choice of a 'superpower' theme is an implied but logical extension of the prompt's creative tone."],
    poorly_explainable: [],
    unexplained: []
  },
  improvement_recommendations: [
    "Consider adding more concrete examples of quantum computing applications.",
    "Could enhance explanation with more interactive elements.",
    "Perfect adherence to persona and simplification requirements."
  ],
  analysis_timestamp: new Date().toISOString()
};

// Safe data access functions
const safeGet = (obj: any, path: string, defaultValue: any = null) => {
  try {
    const result = path.split('.').reduce((current, key) => current?.[key], obj);
    return result === undefined || result === null ? defaultValue : result;
  } catch {
    return defaultValue;
  }
};
const safeArray = (arr: any): any[] => Array.isArray(arr) ? arr : [];
const safeString = (str: any, fallback = ''): string => typeof str === 'string' ? str : fallback;
const safeNumber = (num: any, fallback = 0): number => typeof num === 'number' && !isNaN(num) ? num : fallback;
const safeObject = (obj: any, fallback = {}): Record<string, any> => (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : fallback;

// --- Animated Components ---
const FlowingOrb = () => (
    <div className="absolute top-8 left-1/2 w-4 h-4 -translate-x-28">
        <div className="absolute w-4 h-4 bg-primary rounded-full filter blur-md" />
        <div className="absolute w-4 h-4 bg-primary/70 rounded-full" />
    </div>
);

const ProcessingNode = ({
  title,
  subtitle,
  icon: Icon,
  isActive,
  onClick,
  className = ""
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}) => (
  <div
    className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 w-48 text-center group ${
      isActive
        ? 'border-primary bg-primary/10 scale-105 animate-glow'
        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50 hover:shadow-lg'
    } ${className}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-center gap-2 mb-1">
      <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-300 group-hover:text-primary'}`} />
      <h3 className="font-semibold text-sm">{title}</h3>
    </div>
    {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={subtitle}>{subtitle}</p>}
  </div>
);

const ConnectionLine = ({ isActive, vertical = false, className = "" }: {
  isActive: boolean;
  vertical?: boolean;
  className?: string;
}) => (
  <div
    className={`transition-all duration-500 ${
      isActive ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
    } ${vertical ? 'w-0.5 h-8' : 'h-0.5 w-10'} ${className}`}
  />
);


export default function Explainability() {
  const [userInput, setUserInput] = useState("Explain quantum computing to a 10-year-old child.");
  const [systemPrompt, setSystemPrompt] = useState("You are a friendly science teacher who loves explaining complex topics in simple, engaging ways. Always use analogies that children can understand, keep your language simple, and include fun examples. Be encouraging and enthusiastic. End your explanations with a question to keep the child engaged.");
  const [selectedModel, setSelectedModel] = useState("");
  const [temperature, setTemperature] = useState(0.1);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [models, setModels] = useState<Record<string, string>>({});
  const [analysisResult, setAnalysisResult] = useState<ExplainabilityAnalysisResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const steps = ['input', 'prompt', 'model', 'response', 'adherence', 'behavioral', 'quantitative', 'results'];

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await apiService.getExplainabilityModels();
      const availableModels = safeObject(response.models, {});
      setModels(availableModels);
      if (Object.keys(availableModels).length > 0) {
        setSelectedModel(Object.keys(availableModels)[0]);
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
      const fallbackModels = {
        "gemini-1.5-pro": "Google",
        "gpt-4o": "OpenAI",
        "claude-3-opus": "Anthropic"
      };
      setModels(fallbackModels);
      setSelectedModel("gemini-1.5-pro");
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
    setCurrentStep(0);
    try {
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setCurrentStep(i + 1);
      }
      const request: ExplainabilityAnalysisRequest = { user_input: userInput, system_prompt: systemPrompt, llm_model: selectedModel, temperature, max_tokens: maxTokens };
      try {
        const result = await apiService.runCompleteAnalysis(request);
        if (!result) throw new Error("No result received from analysis");
        const isErrorPayload = result.explainability_score === 0 && safeArray(result.improvement_recommendations)[0]?.includes("Analysis failed:");
        if (isErrorPayload) {
          console.warn("Backend returned an error payload. Using mock data.", result);
          toast.info("Analysis failed on the backend. Displaying demo data.");
          setAnalysisResult(mockAnalysisResult);
        } else {
          setAnalysisResult(ensureSafeAnalysisResult(result));
          toast.success("Analysis completed successfully!");
        }
      } catch (apiError) {
        console.warn("API call failed, using mock data:", apiError);
        setAnalysisResult(mockAnalysisResult);
        toast.info("API connection failed. Displaying demo data.");
      }
      setExpandedSections({ 'quantitative': true, 'breakdown': true, 'recommendations': true });
    } catch (error: any) {
      toast.error(error.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const ensureSafeAnalysisResult = (result: any): ExplainabilityAnalysisResult => {
    const behavioralAnalysis = safeObject(result.behavioral_analysis);
    const toneAnalysis = safeObject(behavioralAnalysis.tone_analysis);
    const quantitativeAssessment = safeObject(result.quantitative_assessment);
    const responseSegments = safeObject(quantitativeAssessment.response_segments);
    return {
      user_input: safeString(result.user_input),
      system_prompt: safeString(result.system_prompt),
      llm_model: safeString(result.llm_model),
      llm_response: safeString(result.llm_response),
      prompt_adherence: safeArray(result.prompt_adherence),
      behavioral_analysis: {
        tone_analysis: { requested_tone: safeArray(toneAnalysis.requested_tone), actual_tone: safeArray(toneAnalysis.actual_tone) },
        style_elements: safeArray(behavioralAnalysis.style_elements),
        persona_consistency: safeString(behavioralAnalysis.persona_consistency),
        engagement_techniques: safeArray(behavioralAnalysis.engagement_techniques)
      },
      constraint_compliance: safeObject(result.constraint_compliance),
      quantitative_assessment: {
        instruction_coverage: safeString(quantitativeAssessment.instruction_coverage, 'N/A'),
        response_segments: {
          following_instructions: safeNumber(responseSegments.following_instructions),
          persona_maintenance: safeNumber(responseSegments.persona_maintenance),
          constraint_adherence: safeNumber(responseSegments.constraint_adherence)
        },
        deviation_analysis: safeArray(quantitativeAssessment.deviation_analysis)
      },
      explainability_score: safeNumber(result.explainability_score),
      explainability_breakdown: safeObject(result.explainability_breakdown),
      improvement_recommendations: safeArray(result.improvement_recommendations),
      analysis_timestamp: safeString(result.analysis_timestamp)
    };
  };

  const toggleSection = (section: string) => { setExpandedSections(prev => ({ ...prev, [section]: !prev[section] })); };
  const handleNodeClick = (nodeType: string) => { setSelectedNode(nodeType); setShowDialog(true); };

  const getNodeData = (nodeType: string | null) => {
    if (!analysisResult || !nodeType) return null;
    const { behavioral_analysis, quantitative_assessment } = analysisResult;
    switch (nodeType) {
      case 'input': return { title: 'User Input', content: analysisResult.user_input };
      case 'prompt': return { title: 'System Prompt', content: analysisResult.system_prompt };
      case 'model': return { title: 'Model Configuration', content: `Model: ${analysisResult.llm_model}\nTemperature: ${temperature}\nMax Tokens: ${maxTokens}` };
      case 'response': return { title: 'Generated Response', content: analysisResult.llm_response };
      case 'adherence': return { title: 'Prompt Adherence Analysis', content: safeArray(analysisResult.prompt_adherence).map(item => `Instruction: ${item.instruction}\nStrength: ${item.adherence_strength}\nExplanation: ${item.explanation}`).join('\n\n') || "No adherence data." };
      case 'behavioral': return { title: 'Behavioral Analysis', content: `Tone Analysis:\n- Requested: ${safeArray(behavioral_analysis?.tone_analysis?.requested_tone).join(', ')}\n- Actual: ${safeArray(behavioral_analysis?.tone_analysis?.actual_tone).join(', ')}\n\nPersona Consistency: ${safeString(behavioral_analysis?.persona_consistency)}` };
      case 'quantitative': return { title: 'Quantitative Assessment', content: `Coverage: ${safeString(quantitative_assessment?.instruction_coverage)}\n\nSegments:\n- Following Instructions: ${safeNumber(quantitative_assessment?.response_segments?.following_instructions)}%\n- Persona Maintenance: ${safeNumber(quantitative_assessment?.response_segments?.persona_maintenance)}%` };
      case 'results': return { title: 'Final Results', content: `Explainability Score: ${safeNumber(analysisResult.explainability_score)}/10\n\nRecommendations:\n- ${safeArray(analysisResult.improvement_recommendations).join('\n- ')}` };
      default: return null;
    }
  };

  return (
    <DashboardLayout>
       {/* --- Animation Styles --- */}
      <style jsx>{`
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px hsl(var(--primary)), 0 0 10px hsl(var(--primary) / 0.8);
          }
          50% {
            box-shadow: 0 0 20px hsl(var(--primary) / 0.8), 0 0 30px hsl(var(--primary) / 0.6);
          }
        }
        .animate-glow {
          animation: glow 2.5s ease-in-out infinite;
        }
        @keyframes flow-path {
          0%   { transform: translate(-220px, 0px) scale(0.8); opacity: 0.8; }
          15%  { transform: translate(0px, 0px) scale(1); opacity: 1; }
          30%  { transform: translate(220px, 0px) scale(0.8); opacity: 0.8; }
          40%  { transform: translate(220px, 120px) scale(1); opacity: 1; }
          55%  { transform: translate(0px, 120px) scale(0.8); opacity: 0.8; }
          70%  { transform: translate(-220px, 120px) scale(1); opacity: 1; }
          80%  { transform: translate(-220px, 240px) scale(0.8); opacity: 0.8; }
          90%  { transform: translate(0px, 240px) scale(1); opacity: 1; }
          100% { transform: translate(220px, 240px) scale(0.8); opacity: 0.8; }
        }
        .animate-flow-path {
          animation: flow-path 10s ease-in-out infinite;
        }
        @keyframes bg-pan {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animated-gradient-bg {
            background: linear-gradient(90deg, hsl(var(--background)), hsl(var(--primary) / 0.05), hsl(var(--background)));
            background-size: 200% 200%;
            animation: bg-pan 15s ease-in-out infinite;
        }
      `}</style>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div><h1 className="text-3xl font-bold">AI Explainability Analysis</h1><p className="text-muted-foreground">Analyze how well AI responses align with system prompts and instructions</p></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Configuration</CardTitle><CardDescription>Set up your analysis parameters and model configuration</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="userInput">User Input *</Label><Textarea id="userInput" placeholder="Enter the user's question or prompt..." value={userInput} onChange={(e) => setUserInput(e.target.value)} className="min-h-[100px]" /></div>
              <div className="space-y-2"><Label htmlFor="systemPrompt">System Prompt *</Label><Textarea id="systemPrompt" placeholder="Enter the system prompt..." value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} className="min-h-[120px]" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="model">Model *</Label><Select value={selectedModel} onValueChange={setSelectedModel}><SelectTrigger><SelectValue placeholder="Select a model" /></SelectTrigger><SelectContent>{Object.entries(models).map(([model, provider]) => (<SelectItem key={model} value={model}><div className="flex items-center gap-2"><span>{model}</span><Badge variant="outline" className="text-xs">{provider}</Badge></div></SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="temperature">Temperature</Label><Input id="temperature" type="number" min="0" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="maxTokens">Max Tokens</Label><Input id="maxTokens" type="number" min="1" max="8000" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))} /></div>
              <Button onClick={handleAnalyze} disabled={loading || !userInput || !systemPrompt || !selectedModel} className="w-full" size="lg">
                {analyzing ? (<div className="flex items-center gap-2"><div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />Analyzing...</div>) : (<div className="flex items-center gap-2"><Eye className="h-4 w-4" />Visualize Analysis</div>)}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Analysis Flow Visualization</CardTitle><CardDescription>Interactive visualization of the explainability analysis process</CardDescription></CardHeader>
            <CardContent className="p-6">
              {!analysisResult && !analyzing ? (
                <div className="flex flex-col items-center justify-center py-12 text-center"><Brain className="h-16 w-16 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Configure your parameters and click "Visualize Analysis" to begin</p></div>
              ) : (
                <div className="relative flex flex-col items-center gap-4 p-8 rounded-lg animated-gradient-bg">
                   {/* --- The Flowing Orb --- */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <div className="animate-flow-path"><FlowingOrb /></div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-4 z-10">
                    <ProcessingNode title="Input Processing" subtitle={userInput} icon={MessageSquare} isActive={currentStep >= 1} onClick={() => handleNodeClick('input')} />
                    <ConnectionLine isActive={currentStep >= 2} />
                    <ProcessingNode title="Prompt Analysis" subtitle="System prompt parsing" icon={Settings} isActive={currentStep >= 2} onClick={() => handleNodeClick('prompt')} />
                    <ConnectionLine isActive={currentStep >= 3} />
                    <ProcessingNode title="Model Generation" subtitle={selectedModel} icon={Brain} isActive={currentStep >= 3} onClick={() => handleNodeClick('model')} />
                  </div>
                  <ConnectionLine isActive={currentStep >= 4} vertical className="z-10"/>
                  <div className="flex flex-wrap items-center justify-center gap-4 z-10">
                    <ProcessingNode title="Response Analysis" subtitle="Generated output" icon={MessageSquare} isActive={currentStep >= 4} onClick={() => handleNodeClick('response')} />
                    <ConnectionLine isActive={currentStep >= 5} />
                    <ProcessingNode title="Adherence Check" subtitle="Prompt compliance" icon={Target} isActive={currentStep >= 5} onClick={() => handleNodeClick('adherence')} />
                    <ConnectionLine isActive={currentStep >= 6} />
                    <ProcessingNode title="Behavioral Analysis" subtitle="Tone & style" icon={BarChart3} isActive={currentStep >= 6} onClick={() => handleNodeClick('behavioral')} />
                  </div>
                  <ConnectionLine isActive={currentStep >= 7} vertical className="z-10"/>
                   <div className="flex flex-wrap items-center justify-center gap-4 z-10">
                    <ProcessingNode title="Quantitative Assessment" subtitle="Metrics & scores" icon={BarChart3} isActive={currentStep >= 7} onClick={() => handleNodeClick('quantitative')} />
                    <ConnectionLine isActive={currentStep >= 8} />
                    <ProcessingNode title="Final Results" subtitle={analysisResult ? `Score: ${safeNumber(analysisResult.explainability_score)}/10` : "Score"} icon={Lightbulb} isActive={currentStep >= 8} onClick={() => handleNodeClick('results')} className={analysisResult && safeNumber(analysisResult.explainability_score) > 0 ? '!border-green-500 !bg-green-500/10' : ''} />
                  </div>
                  
                  {analysisResult && !analyzing && (
                    <div className="mt-6 p-4 bg-background/80 backdrop-blur-sm w-full rounded-lg border z-10">
                      <h3 className="font-semibold text-foreground mb-2">Analysis Complete!</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center"><div className="text-2xl font-bold text-green-500">{safeNumber(analysisResult.explainability_score)}/10</div><div className="text-muted-foreground">Explainability Score</div></div>
                        <div className="text-center"><div className="text-2xl font-bold text-blue-500">{safeNumber(safeGet(analysisResult, 'quantitative_assessment.response_segments.following_instructions'))}%</div><div className="text-muted-foreground">Instruction Following</div></div>
                        <div className="text-center"><div className="text-2xl font-bold text-purple-500">{safeArray(analysisResult.prompt_adherence).length}</div><div className="text-muted-foreground">Adherence Checks</div></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {analysisResult && !analyzing && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => toggleSection('quantitative')}><div className="flex justify-between items-center"><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Quantitative Assessment</CardTitle>{expandedSections['quantitative'] ? <ChevronDown /> : <ChevronRight />}</div></CardHeader>
              {expandedSections['quantitative'] && (
                <CardContent className="space-y-4 pt-4">
                  <div><Label className="font-semibold">Instruction Coverage</Label><p className="text-sm text-muted-foreground">{safeString(analysisResult.quantitative_assessment.instruction_coverage, 'N/A')}</p></div>
                  <div className="space-y-2"><Label className="font-semibold">Response Segments</Label><div className="grid gap-4 sm:grid-cols-3"><div><p className="text-sm">Instruction Following ({safeNumber(safeGet(analysisResult, 'quantitative_assessment.response_segments.following_instructions'))}%)</p><Progress value={safeNumber(safeGet(analysisResult, 'quantitative_assessment.response_segments.following_instructions'))} /></div><div><p className="text-sm">Persona Maintenance ({safeNumber(safeGet(analysisResult, 'quantitative_assessment.response_segments.persona_maintenance'))}%)</p><Progress value={safeNumber(safeGet(analysisResult, 'quantitative_assessment.response_segments.persona_maintenance'))} /></div><div><p className="text-sm">Constraint Adherence ({safeNumber(safeGet(analysisResult, 'quantitative_assessment.response_segments.constraint_adherence'))}%)</p><Progress value={safeNumber(safeGet(analysisResult, 'quantitative_assessment.response_segments.constraint_adherence'))} /></div></div></div>
                  <div><Label className="font-semibold">Deviation Analysis</Label><ul className="list-disc pl-5 mt-1">{safeArray(analysisResult.quantitative_assessment.deviation_analysis).map((item, i) => (<li key={i} className="text-sm text-muted-foreground">{item}</li>))}</ul></div>
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader className="cursor-pointer" onClick={() => toggleSection('breakdown')}><div className="flex justify-between items-center"><CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5" />Explainability Breakdown</CardTitle>{expandedSections['breakdown'] ? <ChevronDown /> : <ChevronRight />}</div></CardHeader>
              {expandedSections['breakdown'] && (
                <CardContent className="space-y-4 pt-4">{Object.entries(safeObject(analysisResult.explainability_breakdown)).map(([level, items]) => safeArray(items).length > 0 && (<div key={level}><h4 className="font-semibold capitalize text-sm mb-1">{level.replace(/_/g, ' ')}</h4><ul className="list-disc pl-5 space-y-1">{safeArray(items).map((item, i) => (<li key={i} className="text-sm text-muted-foreground">{item}</li>))}</ul></div>))}</CardContent>
              )}
            </Card>

            <Card>
              <CardHeader className="cursor-pointer" onClick={() => toggleSection('recommendations')}><div className="flex justify-between items-center"><CardTitle className="flex items-center gap-2"><ThumbsUp className="h-5 w-5" />Improvement Recommendations</CardTitle>{expandedSections['recommendations'] ? <ChevronDown /> : <ChevronRight />}</div></CardHeader>
              {expandedSections['recommendations'] && (<CardContent className="pt-4"><ul className="list-disc pl-5 space-y-2">{safeArray(analysisResult.improvement_recommendations).map((rec, i) => (<li key={i} className="text-sm text-muted-foreground">{rec}</li>))}</ul></CardContent>)}
            </Card>
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{getNodeData(selectedNode)?.title}</DialogTitle></DialogHeader><ScrollArea className="max-h-[60vh] mt-4 pr-4"><pre className="whitespace-pre-wrap text-sm font-sans">{getNodeData(selectedNode)?.content}</pre></ScrollArea></DialogContent></Dialog>
      </div>
    </DashboardLayout>
  );
}
