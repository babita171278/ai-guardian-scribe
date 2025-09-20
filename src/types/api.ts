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