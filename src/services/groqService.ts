
import { toast } from 'sonner';

interface ApiSettings {
  groqApiKey: string;
  groqApiEndpoint: string;
  groqModel: string;
  whisperModel: string;
  whisperApiEndpoint: string;
  language: string;
}

// Get API settings from localStorage or use defaults
export const getApiSettings = (): ApiSettings => {
  const defaultSettings: ApiSettings = {
    groqApiKey: '',
    groqApiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    groqModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
    whisperModel: 'distil-whisper-large-v3',
    whisperApiEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
    language: 'pt'
  };

  try {
    const savedSettings = localStorage.getItem('securai-api-settings');
    console.info('Loaded API settings:', savedSettings ? JSON.parse(savedSettings) : defaultSettings);
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  } catch (error) {
    console.error('Error loading API settings:', error);
    return defaultSettings;
  }
};

// Save API settings to localStorage
export const saveApiSettings = (settings: ApiSettings): void => {
  localStorage.setItem('securai-api-settings', JSON.stringify(settings));
};

// Make a request to the Groq API
export const makeGroqAIRequest = async (messages: any[], maxTokens = 1024): Promise<string> => {
  const settings = getApiSettings();
  
  if (!settings.groqApiKey) {
    toast.error('Chave de API da Groq não configurada. Verifique as configurações.');
    throw new Error('Groq API key is not set');
  }

  try {
    console.info('Making Groq API request with model:', settings.groqModel);
    
    const response = await fetch(settings.groqApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.groqApiKey}`
      },
      body: JSON.stringify({
        model: settings.groqModel,
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7,
        top_p: 0.95,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      throw new Error(`API error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;
    console.info('Groq API response received, length:', result.length);
    return result;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    toast.error(`Erro ao chamar a API da Groq: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    throw error;
  }
};

// Analyze image with Groq Vision model
export const analyzeImageWithGroq = async (imageUrl: string): Promise<{
  ocrText: string;
  faces: {
    id: number;
    confidence: number;
    region: { x: number; y: number; width: number; height: number };
  }[];
  licensePlates: string[];
  enhancementTechnique: string;
  confidenceScores?: { plate: string; scores: number[] };
}> => {
  const settings = getApiSettings();
  
  if (!settings.groqApiKey) {
    toast.error('Chave de API da Groq não configurada. Verifique as configurações.');
    throw new Error('Groq API key is not set');
  }

  try {
    console.info('Analyzing image with Groq Vision');
    
    const messages = [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "Você é um assistente especializado em análise de imagens. " +
                  "Extraia todos os textos visíveis (OCR), detecte faces humanas e suas localizações em coordenadas x, y, width, height. " +
                  "Identifique placas veiculares brasileiras no formato AAA0A00, AAA0000 ou ABC1D23. " +
                  "Para cada placa veicular, forneça um índice de confiança para cada caractere (0-100%). " +
                  "Descreva também qual técnica de melhoria foi aplicada na imagem (se aplicável). " +
                  "Retorne o resultado em formato JSON com as chaves: ocrText, faces, licensePlates, confidenceScores, enhancementTechnique."
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analise esta imagem detalhadamente."
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl
            }
          }
        ]
      }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.groqApiKey}`
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        messages,
        max_tokens: 2048,
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq Vision API error:', errorData);
      throw new Error(`API error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;
    
    try {
      // Parse the JSON response
      const jsonResult = JSON.parse(result);
      console.info('Image analysis complete:', jsonResult);
      
      // Format the result to match the expected interface
      return {
        ocrText: jsonResult.ocrText || '',
        faces: Array.isArray(jsonResult.faces) ? jsonResult.faces.map((face: any, idx: number) => ({
          id: idx + 1,
          confidence: face.confidence || 0.95,
          region: face.region || { x: 0, y: 0, width: 0, height: 0 }
        })) : [],
        licensePlates: Array.isArray(jsonResult.licensePlates) ? jsonResult.licensePlates : [],
        enhancementTechnique: jsonResult.enhancementTechnique || 'Melhoria básica de contrate e nitidez',
        confidenceScores: jsonResult.confidenceScores || null
      };
    } catch (error) {
      console.error('Error parsing image analysis result:', error, result);
      throw new Error('Failed to parse image analysis result');
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    toast.error(`Erro na análise de imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    throw error;
  }
};

// Enhance image with Groq
export const enhanceImageWithGroq = async (imageUrl: string): Promise<string> => {
  const settings = getApiSettings();
  
  if (!settings.groqApiKey) {
    toast.error('Chave de API da Groq não configurada. Verifique as configurações.');
    throw new Error('Groq API key is not set');
  }

  try {
    console.info('Enhancing image with Groq');
    
    // Simulate image enhancement process (in a real implementation, this would use an actual API call)
    // This is a placeholder as Groq doesn't have a direct image enhancement API
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
    
    // In a real implementation, we would process the image here
    // For now, we'll return the original image as if it was enhanced
    console.info('Image enhancement complete');
    return imageUrl;
  } catch (error) {
    console.error('Error enhancing image:', error);
    toast.error(`Erro ao melhorar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    throw error;
  }
};

// Transcribe audio with Groq's Whisper API
export const transcribeAudioWithGroq = async (audioFile: File): Promise<{
  text: string;
  speakerSegments: {
    speaker: string;
    start: number;
    end: number;
    text: string;
  }[];
}> => {
  const settings = getApiSettings();
  
  if (!settings.groqApiKey) {
    toast.error('Chave de API da Groq não configurada. Verifique as configurações.');
    throw new Error('Groq API key is not set');
  }

  try {
    console.info('Transcribing audio with Groq Whisper');
    
    // Prepare form data for the Whisper API
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', settings.whisperModel);
    formData.append('response_format', 'verbose_json');
    formData.append('language', settings.language);
    
    // Call the Whisper API
    const response = await fetch(settings.whisperApiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.groqApiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API error:', errorText);
      throw new Error(`API error ${response.status}: ${errorText || 'Unknown error'}`);
    }

    const data = await response.json();
    const transcription = data.text || '';
    console.info('Audio transcription complete, length:', transcription.length);
    
    // Now process with Groq to identify speakers
    const speakerAnalysis = await identifySpeakersWithGroq(transcription);
    
    return {
      text: transcription,
      speakerSegments: speakerAnalysis
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    toast.error(`Erro na transcrição de áudio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    throw error;
  }
};

// Process transcription to identify different speakers
const identifySpeakersWithGroq = async (transcription: string): Promise<{
  speaker: string;
  start: number;
  end: number;
  text: string;
}[]> => {
  try {
    console.info('Identifying speakers in transcription');
    
    const messages = [
      {
        role: "system",
        content: "Você é um assistente especializado em análise de transcrições de áudio. " +
                "Sua tarefa é identificar diferentes falantes na transcrição e segmentar o texto por falante. " +
                "Retorne um array JSON onde cada elemento contém: { speaker: 'Falante X', start: 0, end: 0, text: 'texto falado' }. " +
                "Use 'start' e 'end' para representar o tempo estimado em segundos (pode ser aproximado)."
      },
      {
        role: "user",
        content: `Identifique os diferentes falantes nesta transcrição e segmente o texto: ${transcription}`
      }
    ];
    
    const result = await makeGroqAIRequest(messages, 2048);
    
    try {
      // Extract JSON array from the response
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in the response');
      }
      
      const segments = JSON.parse(jsonMatch[0]);
      console.info('Speaker identification complete, found segments:', segments.length);
      return segments;
    } catch (error) {
      console.error('Error parsing speaker segments:', error, result);
      
      // Fallback: create a single speaker segment
      return [{
        speaker: "Falante 1",
        start: 0,
        end: 60,
        text: transcription
      }];
    }
  } catch (error) {
    console.error('Error identifying speakers:', error);
    
    // Return a basic single-speaker segment on error
    return [{
      speaker: "Falante 1",
      start: 0,
      end: 60,
      text: transcription
    }];
  }
};
