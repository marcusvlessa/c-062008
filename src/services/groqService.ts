
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

// Transcribe audio using GROQ Whisper API
export const transcribeAudioWithGroq = async (
  audioFile: File
): Promise<{ text: string; speakerSegments: Array<{ speaker: string; start: number; end: number; text: string }> }> => {
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

// Analyze image with GROQ API
export const analyzeImageWithGroq = async (
  imageFile: File,
  prompt: string
): Promise<string> => {
  try {
    const settings = getGroqSettings();
    
    if (!settings.groqApiKey) {
      console.warn('No GROQ API key configured. Please add your API key in Settings.');
      return getMockImageAnalysis(imageFile.name);
    }

    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Create messages for image analysis
    const messages = [
      {
        role: "system",
        content: "Você é um especialista em análise de imagens forenses. Sua função é analisar detalhadamente imagens e fornecer informações relevantes para investigações."
      },
      {
        role: "user",
        content: [
          { type: "text", text: prompt || "Analise detalhadamente esta imagem e forneça todas as informações relevantes que possam ser úteis para uma investigação." },
          { type: "image_url", image_url: { url: base64Image } }
        ]
      }
    ];
    
    // Use GROQ API for image analysis
    return await makeGroqAIRequest(messages, 2048);
  } catch (error) {
    console.error('Error analyzing image with GROQ:', error);
    return getMockImageAnalysis(imageFile.name);
  }
};

// Enhance image with AI
export const enhanceImageWithGroq = async (
  imageFile: File, 
  enhancementType: string
): Promise<{ enhancedImageUrl: string; enhancementDetails: string }> => {
  try {
    const settings = getGroqSettings();
    
    if (!settings.groqApiKey) {
      console.warn('No GROQ API key configured. Please add your API key in Settings.');
      return getMockImageEnhancement(imageFile.name, enhancementType);
    }

    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // In a real implementation, this would call an image enhancement API
    // For now, we'll return the original image with a description of the enhancement
    
    const enhancementPrompt = [
      {
        role: "system",
        content: "Você é um especialista em processamento de imagens forenses. Descreva como esta imagem seria melhorada usando a técnica especificada."
      },
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: `Descreva tecnicamente como a técnica de "${enhancementType}" seria aplicada a esta imagem e quais resultados seriam esperados.` 
          },
          { 
            type: "image_url", 
            image_url: { url: base64Image } 
          }
        ]
      }
    ];
    
    // Get enhancement details from GROQ
    const enhancementDetails = await makeGroqAIRequest(enhancementPrompt, 1024);
    
    // Return original image with enhancement description
    return {
      enhancedImageUrl: base64Image,  // In a real implementation, this would be the enhanced image
      enhancementDetails
    };
  } catch (error) {
    console.error('Error enhancing image:', error);
    return getMockImageEnhancement(imageFile.name, enhancementType);
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
const getMockAudioTranscription = (fileName: string): { text: string; speakerSegments: Array<{ speaker: string; start: number; end: number; text: string }> } => {
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
const getMockImageAnalysis = (fileName: string): string => {
  return `## Análise de Imagem (Simulado)

**Arquivo:** ${fileName}

**Observações Gerais:**
- Imagem analisada em ambiente simulado (função mock)
- Para análise real, configure sua chave de API GROQ nas configurações

**Elementos Detectados:**
- Não foi possível realizar detecção real sem API configurada
- Em uma implementação real, seriam detectados objetos, pessoas, textos e outros elementos relevantes

**Recomendações:**
1. Configure sua chave de API GROQ nas configurações do sistema
2. Tente novamente com uma imagem clara e bem iluminada
3. Especifique na solicitação quais elementos você deseja analisar com maior atenção`;
};

// Generate mock image enhancement
const getMockImageEnhancement = (fileName: string, enhancementType: string): { enhancedImageUrl: string; enhancementDetails: string } => {
  const mockDetails = `## Aprimoramento de Imagem: ${enhancementType} (Simulado)

**Arquivo:** ${fileName}

**Técnica Aplicada:** ${enhancementType}

**Processo Técnico (Simulado):**
Na aplicação real desta técnica, a imagem passaria por um processamento específico que inclui ajustes de contraste, nitidez e redução de ruído. A técnica ${enhancementType} é especialmente eficaz para destacar detalhes em condições de iluminação desafiadoras.

**Resultados Esperados:**
- Melhoria na definição de contornos
- Redução de ruídos e artefatos
- Aprimoramento de textos e números presentes na imagem

**Observação:**
Esta é uma simulação. Para resultados reais, configure sua chave de API GROQ nas configurações do sistema.`;

  return {
    enhancedImageUrl: '', // In a mock implementation, we would return a placeholder image
    enhancementDetails: mockDetails
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
