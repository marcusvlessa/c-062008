
// GROQ API Service
// This service handles communication with the GROQ API for AI-powered functionalities

// Types for GROQ API settings
export type GroqSettings = {
  groqApiKey: string;
  groqApiEndpoint: string;
  groqModel: string;
  whisperModel: string;
  whisperApiEndpoint: string;
  language: string;
};

// Default GROQ settings
const DEFAULT_GROQ_SETTINGS: GroqSettings = {
  groqApiKey: '',
  groqApiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
  groqModel: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  whisperModel: 'distil-whisper-large-v3',
  whisperApiEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
  language: 'pt'
};

// Get GROQ API settings from localStorage or use defaults
export const getGroqSettings = (): GroqSettings => {
  try {
    const storedSettings = localStorage.getItem('securai-api-settings');
    if (storedSettings) {
      return JSON.parse(storedSettings) as GroqSettings;
    }
    return DEFAULT_GROQ_SETTINGS;
  } catch (error) {
    console.error('Error getting GROQ settings:', error);
    return DEFAULT_GROQ_SETTINGS;
  }
};

// Save GROQ API settings to localStorage
export const saveGroqSettings = (settings: GroqSettings): void => {
  try {
    localStorage.setItem('securai-api-settings', JSON.stringify({
      ...DEFAULT_GROQ_SETTINGS,
      ...settings
    }));
    console.log('GROQ settings saved successfully');
  } catch (error) {
    console.error('Error saving GROQ settings:', error);
  }
};

// Make a request to the GROQ API for text generation
export const makeGroqAIRequest = async (messages: any[], maxTokens: number = 1024): Promise<string> => {
  try {
    const settings = getGroqSettings();
    
    if (!settings.groqApiKey) {
      console.warn('No GROQ API key configured. Please add your API key in Settings.');
      return 'API key not configured. Please add your GROQ API key in Settings.';
    }

    console.log(`Making GROQ API request with model: ${settings.groqModel}`);
    
    const response = await fetch(settings.groqApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.groqApiKey}`
      },
      body: JSON.stringify({
        model: settings.groqModel,
        messages: messages,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GROQ API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling GROQ API:', error);
    throw error;
  }
};

// Generate investigation report analysis with GROQ
export const generateInvestigationReportWithGroq = async (
  caseData: any,
  occurrences: any[]
): Promise<string> => {
  try {
    // Create a prompt for the report generation
    const messages = [
      {
        role: "system",
        content: 
          "Você é um assistente especializado em análise investigativa. " +
          "Sua função é analisar os boletins de ocorrência e gerar um relatório " +
          "de investigação estruturado e detalhado."
      },
      {
        role: "user",
        content: `Gere um relatório de investigação baseado nas seguintes ocorrências:\n\n${
          JSON.stringify(occurrences, null, 2)
        }\n\nDados do caso: ${JSON.stringify(caseData, null, 2)}`
      }
    ];
    
    return await makeGroqAIRequest(messages, 4096);
  } catch (error) {
    console.error('Error generating investigation report:', error);
    throw error;
  }
};

// Process link analysis data with GROQ
export const processLinkAnalysisDataWithGroq = async (
  caseData: any,
  linkData: string
): Promise<any> => {
  try {
    // Create a prompt for link analysis
    const messages = [
      {
        role: "system",
        content: 
          "Você é um assistente especializado em análise de vínculos. " +
          "Sua função é analisar dados de relacionamentos e gerar uma estrutura " +
          "de grafo com nós e arestas para visualização."
      },
      {
        role: "user",
        content: `Processe os seguintes dados para análise de vínculos:\n\n${linkData}\n\nDados do caso: ${JSON.stringify(caseData, null, 2)}`
      }
    ];
    
    const result = await makeGroqAIRequest(messages, 4096);
    
    // Try to parse the result as JSON
    try {
      return JSON.parse(result);
    } catch (e) {
      // If parsing fails, return a formatted response
      return {
        nodes: [],
        edges: [],
        analysis: result
      };
    }
  } catch (error) {
    console.error('Error processing link analysis data:', error);
    throw error;
  }
};

// Default export for the service
export default {
  getGroqSettings,
  saveGroqSettings,
  makeGroqAIRequest,
  generateInvestigationReportWithGroq,
  processLinkAnalysisDataWithGroq
};
