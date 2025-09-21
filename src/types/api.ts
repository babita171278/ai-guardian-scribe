// API Types for the Responsible AI Dashboard

export type RelevancyLevel = "excellent" | "good" | "fair" | "poor";
export type SensitivityLevel = "low" | "medium" | "high";
export type SafetyLevel = "safe" | "unsafe" | "uncertain";

// Evaluation Results
export interface EvaluationResult {
  id: string;
  timestamp: string;
  metric: string;
  level: RelevancyLevel;
  score?: number;
  reason: string;
  input: string;
  output: string;
}

export interface GuardrailResult {
  id: string;
  timestamp: string;
  type: string;
  safetyLevel: SafetyLevel;
  reason: string;
  threatsDetected?: string[];
  confidence?: number;
  input: string;
  output?: string;
}

// API Request/Response Types
export interface AnswerRelevancyRequest {
  user_input: string;
  ai_output: string;
  sensitivity: SensitivityLevel;
}

export interface AnswerRelevancyResult {
  relevancy_level: RelevancyLevel;
  relevancy_percentage: number;
  reason: string;
  statements: string[];
  verdicts: Array<{
    verdict: string;
    reason?: string;
  }>;
  relevant_statements_count: number;
  total_statements_count: number;
  sensitivity_level: SensitivityLevel;
}

export interface BiasRequest {
  ai_output: string;
  user_input?: string;
}

export interface BiasEvaluationResult {
  bias_level: RelevancyLevel;
  bias_percentage: number;
  reason: string;
  opinions: string[];
  verdicts: Array<{
    verdict: string;
    reason?: string;
  }>;
  biased_opinions_count: number;
  total_opinions_count: number;
}

export interface FaithfulnessRequest {
  actual_output: string;
  retrieval_context: string;
  user_input?: string;
  sensitivity: SensitivityLevel;
}

export interface FaithfulnessResult {
  faithfulness_level: RelevancyLevel;
  faithfulness_percentage: number;
  reason: string;
  truths: string[];
  claims: string[];
  verdicts: Array<{
    verdict: string;
    reason?: string;
  }>;
  contradictions_count: number;
  total_claims_count: number;
  sensitivity_level: SensitivityLevel;
}

export interface HallucinationRequest {
  actual_output: string;
  contexts: string[];
  user_input?: string;
  sensitivity: SensitivityLevel;
}

export interface HallucinationResult {
  hallucination_level: RelevancyLevel;
  hallucination_percentage: number;
  reason: string;
  contexts: string[];
  verdicts: Array<{
    verdict: string;
    reason?: string;
  }>;
  contradictions_count: number;
  total_contexts_count: number;
  sensitivity_level: SensitivityLevel;
  factual_alignments: string[];
  contradictions: string[];
}

export interface PiiLeakageRequest {
  ai_output: string;
  user_input?: string;
  sensitivity: SensitivityLevel;
}

export interface PiiLeakageResult {
  privacy_level: RelevancyLevel;
  privacy_percentage: number;
  reason: string;
  extracted_pii: string[];
  verdicts: Array<{
    verdict: string;
    reason?: string;
  }>;
  privacy_violations_count: number;
  total_statements_count: number;
  sensitivity_level: SensitivityLevel;
}

export interface ToxicityRequest {
  ai_output: string;
  user_input?: string;
  sensitivity: SensitivityLevel;
}

export interface ToxicityResult {
  toxicity_level: RelevancyLevel;
  toxicity_percentage: number;
  reason: string;
  opinions: string[];
  verdicts: Array<{
    verdict: string;
    reason?: string;
  }>;
  toxic_opinions_count: number;
  total_opinions_count: number;
  sensitivity_level: SensitivityLevel;
}

export interface CybersecurityInputRequest {
  input_text: string;
  categories: string[];
  sensitivity: SensitivityLevel;
  purpose?: string;
}

export interface CybersecurityInputResult {
  safety_level: SafetyLevel;
  reason: string;
  input_text: string;
  categories: string[];
  threats_detected: string[];
  purpose?: string;
  sensitivity_level: SensitivityLevel;
  risk_score: number;
  confidence: number;
}

export interface ChatRequest {
  input_text: string;
  selected_guardrails: string[];
}

export interface ChatResponse {
  response: string;
  guardrail_results: GuardrailResult[];
  evaluation_results: EvaluationResult[];
}

// Explainability Types
export interface ExplainabilityModelsResponse {
  models: Record<string, string>;
}

export interface PromptAdherenceItem {
  instruction: string;
  examples: string[];
  adherence_strength: string;
  explanation: string;
}

export interface BehavioralAnalysis {
  tone_analysis: {
    requested_tone: string[];
    actual_tone: string[];
  };
  style_elements: string[];
  persona_consistency: string;
  engagement_techniques: string[];
}

export interface ConstraintCompliance {
  safety_boundaries: string[];
  scope_limitations: string[];
  instruction_conflicts: string[];
  unexpected_behaviors: string[];
}

export interface QuantitativeAssessment {
  instruction_coverage: string;
  response_segments: {
    following_instructions: number;
    persona_maintenance: number;
    constraint_adherence: number;
  };
  deviation_analysis: string[];
}

export interface ExplainabilityAnalysisRequest {
  user_input: string;
  system_prompt: string;
  llm_model: string;
  evaluator_model?: string;
  api_key?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ExplainabilityAnalysisResult {
  user_input: string;
  system_prompt: string;
  llm_model: string;
  llm_response: string;
  prompt_adherence: PromptAdherenceItem[];
  behavioral_analysis: BehavioralAnalysis;
  constraint_compliance: ConstraintCompliance;
  quantitative_assessment: QuantitativeAssessment;
  explainability_score: number;
  explainability_breakdown: Record<string, string[]>;
  improvement_recommendations: string[];
  analysis_timestamp: string;
}

// OpikEval specific types
export interface OpikAnswerRelevanceRequest {
  user_input: string;
  ai_output: string;
  context?: string[];
  sensitivity: SensitivityLevel;
}

export interface OpikAnswerRelevanceResult {
  answer_relevance_score: number;
  relevancy_level: RelevancyLevel;
  reason: string;
  sensitivity_level: SensitivityLevel;
}

export interface OpikContextPrecisionRequest {
  input: string;
  expected_output: string;
  context: string;
  output: string;
  sensitivity: SensitivityLevel;
}

export interface OpikContextPrecisionResult {
  context_precision_score: number;
  precision_level: RelevancyLevel;
  reason: string;
  sensitivity_level: SensitivityLevel;
}

export interface OpikHallucinationRequest {
  output: string;
  context: string; // single string per API examples
  sensitivity: SensitivityLevel;
}

export interface OpikHallucinationResult {
  score: number;
  faithfulness_level: RelevancyLevel;
  reason: string[];
}

export interface OpikContextRecallRequest {
  input: string;
  expected_output: string;
  context: string;
  output: string;
  sensitivity: SensitivityLevel;
}

export interface OpikContextRecallResult {
  context_recall_score: number;
  recall_level: RelevancyLevel;
  reason: string;
  sensitivity_level: SensitivityLevel;
}

export interface OpikModerationRequest {
  text: string;
  sensitivity: SensitivityLevel;
}

export interface OpikModerationResult {
  score: number;
  safety_level: RelevancyLevel;
  reason: string;
  sensitivity_level: SensitivityLevel;
}

export interface OpikUsefulnessRequest {
  user_input: string;
  ai_output: string;
  sensitivity: SensitivityLevel;
}

export interface OpikUsefulnessResult {
  score: number;
  usefulness_level: RelevancyLevel;
  reason: string;
}

export const API_BASE_URL = "http://127.0.0.1:8000";

export const EVALUATION_METRICS = [
  "answer-relevancy",
  "bias", 
  "faithfulness",
  "hallucination",
  "pii-leakage",
  "toxicity"
] as const;

export const GUARDRAIL_TYPES = [
  "cybersecurity",
  "illegal",
  "privacy", 
  "prompt-injection",
  "toxicity"
] as const;

export type EvaluationMetric = typeof EVALUATION_METRICS[number];
export type GuardrailType = typeof GUARDRAIL_TYPES[number];