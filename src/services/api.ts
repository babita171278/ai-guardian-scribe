import { 
  API_BASE_URL, 
  AnswerRelevancyRequest, 
  AnswerRelevancyResult,
  BiasRequest,
  BiasEvaluationResult,
  FaithfulnessRequest,
  FaithfulnessResult,
  HallucinationRequest,
  HallucinationResult,
  PiiLeakageRequest,
  PiiLeakageResult,
  ToxicityRequest,
  ToxicityResult,
  CybersecurityInputRequest,
  CybersecurityInputResult,
  ChatRequest,
  EvaluationMetric,
  GuardrailType,
  SensitivityLevel,
  ExplainabilityModelsResponse,
  ExplainabilityAnalysisRequest,
  ExplainabilityAnalysisResult,
  OpikAnswerRelevanceRequest,
  OpikAnswerRelevanceResult,
  OpikContextPrecisionRequest,
  OpikContextPrecisionResult,
  OpikHallucinationRequest,
  OpikHallucinationResult,
  OpikModerationRequest,
  OpikModerationResult,
  OpikUsefulnessRequest,
  OpikUsefulnessResult
} from "@/types/api";

class ApiService {
  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Evaluation Metrics
  async evaluateAnswerRelevancy(data: AnswerRelevancyRequest): Promise<AnswerRelevancyResult> {
    return this.makeRequest<AnswerRelevancyResult>('/deepeval/answer-relevancy', data);
  }

  async evaluateBias(data: BiasRequest): Promise<BiasEvaluationResult> {
    return this.makeRequest<BiasEvaluationResult>('/deepeval/bias', data);
  }

  async evaluateFaithfulness(data: FaithfulnessRequest): Promise<FaithfulnessResult> {
    return this.makeRequest<FaithfulnessResult>('/deepeval/faithfulness', data);
  }

  async evaluateHallucination(data: HallucinationRequest): Promise<HallucinationResult> {
    return this.makeRequest<HallucinationResult>('/deepeval/hallucination', data);
  }

  async evaluatePiiLeakage(data: PiiLeakageRequest): Promise<PiiLeakageResult> {
    return this.makeRequest<PiiLeakageResult>('/deepeval/pii-leakage', data);
  }

  async evaluateToxicity(data: ToxicityRequest): Promise<ToxicityResult> {
    return this.makeRequest<ToxicityResult>('/deepeval/toxicity', data);
  }

  // Guardrails
  async scanCybersecurityInput(data: CybersecurityInputRequest): Promise<CybersecurityInputResult> {
    return this.makeRequest<CybersecurityInputResult>('/guardrail/cybersecurity/scan-input', data);
  }

  async scanCybersecurityOutput(data: {
    input_text: string;
    output_text: string;
    categories: string[];
    sensitivity: SensitivityLevel;
    purpose?: string;
  }) {
    return this.makeRequest('/guardrail/cybersecurity/scan-output', data);
  }

  async scanIllegalInput(data: {
    input_text: string;
    sensitivity: SensitivityLevel;
  }) {
    return this.makeRequest('/guardrail/illegal/scan-input', data);
  }

  async scanIllegalOutput(data: {
    input_text: string;
    output_text: string;
    sensitivity: SensitivityLevel;
  }) {
    return this.makeRequest('/guardrail/illegal/scan-output', data);
  }

  async scanPrivacyInput(data: {
    input_text: string;
    sensitivity: SensitivityLevel;
  }) {
    return this.makeRequest('/guardrail/privacy/scan-input', data);
  }

  async scanPrivacyOutput(data: {
    input_text: string;
    output_text: string;
    sensitivity: SensitivityLevel;
  }) {
    return this.makeRequest('/guardrail/privacy/scan-output', data);
  }

  async scanPromptInjectionInput(data: {
    input_text: string;
  }) {
    return this.makeRequest('/guardrail/prompt-injection/scan-input', data);
  }

  async scanPromptInjectionOutput(data: {
    input_text: string;
    output_text: string;
  }) {
    return this.makeRequest('/guardrail/prompt-injection/scan-output', data);
  }

  async scanToxicityInput(data: {
    input_text: string;
    sensitivity: SensitivityLevel;
  }) {
    return this.makeRequest('/guardrail/toxicity/scan-input', data);
  }

  async scanToxicityOutput(data: {
    input_text: string;
    output_text: string;
    sensitivity: SensitivityLevel;
  }) {
    return this.makeRequest('/guardrail/toxicity/scan-output', data);
  }

  // Chat endpoint
  async chatWithGemini(data: { input_text: string }) {
    return this.makeRequest('/guardrail/chat/gemini', data);
  }

  // Opik Eval endpoints
  async evaluateAnswerRelevance(data: OpikAnswerRelevanceRequest): Promise<OpikAnswerRelevanceResult> {
    return this.makeRequest<OpikAnswerRelevanceResult>('/opikeval/answer-relevance', data);
  }

  async evaluateContextPrecision(data: OpikContextPrecisionRequest): Promise<OpikContextPrecisionResult> {
    return this.makeRequest<OpikContextPrecisionResult>('/opikeval/context-precision', data);
  }

  async evaluateContextRecall(data: {
    input: string;
    expected_output: string;
    context: string;
    output: string;
    sensitivity: SensitivityLevel;
  }) {
    return this.makeRequest('/opikeval/context-recall', data);
  }

  async evaluateOpikHallucination(data: OpikHallucinationRequest): Promise<OpikHallucinationResult> {
    return this.makeRequest<OpikHallucinationResult>('/opikeval/hallucination', data);
  }

  async moderateContent(data: OpikModerationRequest): Promise<OpikModerationResult> {
    return this.makeRequest<OpikModerationResult>('/opikeval/moderation', data);
  }

  async evaluateUsefulness(data: OpikUsefulnessRequest): Promise<OpikUsefulnessResult> {
    return this.makeRequest<OpikUsefulnessResult>('/opikeval/usefulness', data);
  }

  // Explainability endpoints
  async getExplainabilityModels(): Promise<ExplainabilityModelsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/explainability/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed for /explainability/models:', error);
      throw error;
    }
  }

  async runCompleteAnalysis(data: ExplainabilityAnalysisRequest): Promise<ExplainabilityAnalysisResult> {
    return this.makeRequest<ExplainabilityAnalysisResult>('/explainability/complete-analysis', data);
  }
}

export const apiService = new ApiService();