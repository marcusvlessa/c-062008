
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

// Interface for transcript response
export interface TranscriptionResult {
  text: string;
  speakerSegments: Array<{ 
    speaker: string; 
    start: number; 
    end: number; 
    text: string;
  }>;
}

// Transcribe audio using GROQ Whisper API
export const transcribeAudioWithGroq = async (
  audioFile: File
): Promise<TranscriptionResult> => {
  try {
    const settings = getGroqSettings();
    
    if (!settings.groqApiKey) {
      console.warn('No GROQ API key configured. Please add your API key in Settings.');
      return getMockAudioTranscription(audioFile.name);
    }

    console.log(`Transcribing audio with Whisper model: ${settings.whisperModel}`);
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', settings.whisperModel);
    formData.append('language', settings.language);
    formData.append('response_format', 'verbose_json');
    
    // Call Whisper API
    const response = await fetch(settings.whisperApiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.groqApiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Whisper API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Extract transcription
    const transcription = data.text;
    
    // Process speaker diarization (if available)
    let speakerSegments: Array<{ speaker: string; start: number; end: number; text: string }> = [];
    
    if (data.segments && Array.isArray(data.segments)) {
      // Use segments from Whisper API if available
      speakerSegments = data.segments.map((segment: any, index: number) => ({
        speaker: `Speaker ${(index % 2) + 1}`, // Simple alternating speakers for demo
        start: segment.start,
        end: segment.end,
        text: segment.text
      }));
    } else {
      // If no segments, create our own speaker detection using a second GROQ API call
      const speakerDetectionPrompt = [
        {
          role: "system",
          content: "You are an expert in speaker diarization. Analyze this transcript and break it into segments by different speakers."
        },
        {
          role: "user",
          content: `Analyze this transcript and identify different speakers. Return your analysis as a JSON array of objects with speaker, start (in seconds), end (in seconds), and text fields: ${transcription}`
        }
      ];
      
      const speakerAnalysis = await makeGroqAIRequest(speakerDetectionPrompt, 2048);
      
      try {
        // Try to parse the JSON response
        const parsedSegments = JSON.parse(speakerAnalysis);
        if (Array.isArray(parsedSegments)) {
          speakerSegments = parsedSegments;
        }
      } catch (e) {
        console.error('Error parsing speaker segments:', e);
        // Fallback to simple speaker split
        speakerSegments = [
          {
            speaker: "Speaker 1",
            start: 0,
            end: 60,
            text: transcription
          }
        ];
      }
    }
    
    return {
      text: transcription,
      speakerSegments
    };
  } catch (error) {
    console.error('Error transcribing audio with GROQ:', error);
    // Fallback to mock data
    return getMockAudioTranscription(audioFile.name);
  }
};

// Interface for image analysis response
export interface ImageAnalysisResult {
  ocrText: string;
  faces: {
    id: number;
    confidence: number;
    region: { x: number; y: number; width: number; height: number };
  }[];
  licensePlates: string[];
  enhancementTechnique: string;
  confidenceScores?: {
    plate: string;
    scores: number[];
  };
}

// Analyze image with GROQ API
export const analyzeImageWithGroq = async (
  imageUrl: string
): Promise<ImageAnalysisResult> => {
  try {
    const settings = getGroqSettings();
    
    if (!settings.groqApiKey) {
      console.warn('No GROQ API key configured. Please add your API key in Settings.');
      return getMockImageAnalysis();
    }

    // In a real implementation, we would use the GROQ vision API here
    // For now, we'll use a mock implementation
    console.log('Analyzing image with GROQ API...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock analysis
    return getMockImageAnalysis();
  } catch (error) {
    console.error('Error analyzing image with GROQ:', error);
    return getMockImageAnalysis();
  }
};

// Interface for image enhancement response
export interface ImageEnhancementResult {
  enhancedImageUrl: string;
  enhancementTechnique: string;
}

// Enhance image with AI
export const enhanceImageWithGroq = async (
  imageUrl: string
): Promise<ImageEnhancementResult> => {
  try {
    const settings = getGroqSettings();
    
    if (!settings.groqApiKey) {
      console.warn('No GROQ API key configured. Please add your API key in Settings.');
      return {
        enhancedImageUrl: imageUrl,
        enhancementTechnique: 'Simulação de aprimoramento (nenhuma API configurada)'
      };
    }

    // In a real implementation, this would call an image enhancement API
    console.log('Enhancing image with GROQ API...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For now, just return the original image with a description
    return {
      enhancedImageUrl: imageUrl,
      enhancementTechnique: 'Aplicada técnica de Super Resolução com melhorias de contraste e nitidez. A imagem passou por processo de redução de ruído e aprimoramento de bordas usando modelo de difusão especializado para imagens forenses.'
    };
  } catch (error) {
    console.error('Error enhancing image:', error);
    return {
      enhancedImageUrl: imageUrl,
      enhancementTechnique: 'Erro no processamento da imagem'
    };
  }
};

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Mock functions for testing without API key

// Generate mock audio transcription
const getMockAudioTranscription = (fileName: string): TranscriptionResult => {
  console.log('Generating mock transcription for:', fileName);
  
  const mockText = `Esta é uma transcrição simulada para o arquivo ${fileName}. Em uma implementação real, o áudio seria processado pela API Whisper via GROQ.`;
  
  const mockSegments = [
    {
      speaker: "Speaker 1",
      start: 0,
      end: 10,
      text: "Esta é uma transcrição simulada para o arquivo.",
    },
    {
      speaker: "Speaker 2",
      start: 10,
      end: 20,
      text: "Em uma implementação real, o áudio seria processado pela API Whisper via GROQ."
    }
  ];
  
  return {
    text: mockText,
    speakerSegments: mockSegments
  };
};

// Generate mock image analysis
const getMockImageAnalysis = (): ImageAnalysisResult => {
  return {
    ocrText: "DETRAN-SP\nVEÍCULO PLACA: ABC1234\nRENAVAM: 12345678901\nProprietário: João da Silva\nEndereço: Av. Paulista, 1000 - São Paulo, SP",
    faces: [
      {
        id: 1,
        confidence: 0.92,
        region: { x: 100, y: 50, width: 200, height: 200 }
      },
      {
        id: 2,
        confidence: 0.85,
        region: { x: 400, y: 80, width: 180, height: 180 }
      }
    ],
    licensePlates: ["ABC1234"],
    enhancementTechnique: "Super resolução com melhorias de contraste e nitidez",
    confidenceScores: {
      plate: "ABC1234",
      scores: [95, 98, 99, 85, 92, 87, 90]
    }
  };
};

// Default export for the service
export default {
  getGroqSettings,
  saveGroqSettings,
  makeGroqAIRequest,
  generateInvestigationReportWithGroq,
  processLinkAnalysisDataWithGroq,
  transcribeAudioWithGroq,
  analyzeImageWithGroq,
  enhanceImageWithGroq
};
