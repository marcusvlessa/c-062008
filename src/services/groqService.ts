
import { toast } from 'sonner';

interface GroqAPISettings {
  groqApiKey: string;
  groqApiEndpoint: string;
  groqModel: string;
  whisperModel: string;
  whisperApiEndpoint: string;
}

/**
 * Fetches the GROQ API settings from localStorage
 */
export const getGroqSettings = (): GroqAPISettings => {
  try {
    const savedSettings = localStorage.getItem('securai-api-settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    
    // Default settings if none are found
    return {
      groqApiKey: '', // Will be checked by calling functions
      groqApiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
      groqModel: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      whisperModel: 'distil-whisper-large-v3-en',
      whisperApiEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions'
    };
  } catch (error) {
    console.error('Error fetching GROQ API settings:', error);
    toast.error('Erro ao carregar configurações da API GROQ');
    
    // Return default settings on error
    return {
      groqApiKey: '',
      groqApiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
      groqModel: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      whisperModel: 'distil-whisper-large-v3-en',
      whisperApiEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions'
    };
  }
};

/**
 * Saves GROQ API settings to localStorage
 */
export const saveGroqSettings = (settings: GroqAPISettings): void => {
  try {
    localStorage.setItem('securai-api-settings', JSON.stringify(settings));
    toast.success('Configurações da API GROQ salvas com sucesso');
  } catch (error) {
    console.error('Error saving GROQ API settings:', error);
    toast.error('Erro ao salvar configurações da API GROQ');
  }
};

/**
 * Makes a request to the GROQ API for AI text completion
 */
export const makeGroqAIRequest = async (
  messages: Array<{ role: string; content: string }>,
  maxTokens = 1024
): Promise<string> => {
  const settings = getGroqSettings();
  
  if (!settings?.groqApiKey) {
    toast.error('Chave da API GROQ não configurada nas Configurações');
    throw new Error('API key not configured');
  }

  try {
    console.log(`Making GROQ API request to model: ${settings.groqModel}`);
    console.log(`Endpoint: ${settings.groqApiEndpoint}`);
    
    const response = await fetch(settings.groqApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.groqApiKey}`
      },
      body: JSON.stringify({
        model: settings.groqModel,
        messages,
        temperature: 1,
        max_tokens: maxTokens,
        top_p: 1,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GROQ API error:', errorData);
      throw new Error(`GROQ API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('GROQ API response received successfully');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error making GROQ request:', error);
    toast.error('Erro ao fazer solicitação para a API GROQ');
    throw error;
  }
};

/**
 * Processes audio files using GROQ's Whisper API
 */
export const transcribeAudioWithGroq = async (audioFile: File): Promise<string> => {
  const settings = getGroqSettings();
  
  if (!settings?.groqApiKey) {
    toast.error('Chave da API GROQ não configurada nas Configurações');
    throw new Error('API key not configured');
  }

  try {
    console.log(`Transcribing audio with Whisper model: ${settings.whisperModel}`);
    console.log(`Endpoint: ${settings.whisperApiEndpoint}`);
    
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', settings.whisperModel);
    formData.append('response_format', 'verbose_json');

    const response = await fetch(settings.whisperApiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.groqApiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GROQ Whisper API error:', errorData);
      throw new Error(`GROQ Whisper API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('GROQ Whisper API transcription received successfully');
    return data.text;
  } catch (error) {
    console.error('Error transcribing audio with GROQ:', error);
    toast.error('Erro ao transcrever áudio com a API Whisper');
    throw error;
  }
};

// Mock function for image enhancement when real API isn't available
export const enhanceImageWithGroq = async (imageDataUrl: string): Promise<string> => {
  const settings = getGroqSettings();
  
  if (!settings?.groqApiKey) {
    toast.error('Chave da API GROQ não configurada nas Configurações');
    throw new Error('API key not configured');
  }
  
  // In a real implementation, we would call a computer vision API
  // For now, we'll simulate image enhancement with a minor adjustment
  console.log('Enhancing image with simulated AI processing');
  
  try {
    // Create a canvas to apply "enhancements" to the image
    const img = new Image();
    const loadImagePromise = new Promise<string>((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Apply simple "enhancements"
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
        
        // Simulate contrast adjustment
        ctx.filter = 'contrast(110%) brightness(105%)';
        ctx.drawImage(img, 0, 0);
        ctx.filter = 'none';
        
        // Convert back to data URL
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageDataUrl;
    });
    
    return await loadImagePromise;
  } catch (error) {
    console.error('Error enhancing image:', error);
    toast.error('Erro ao melhorar imagem');
    throw error;
  }
};

// Mock function for OCR and object detection
export const analyzeImageWithGroq = async (
  imageDataUrl: string
): Promise<{ ocrText: string; faces: any[]; licensePlates: string[] }> => {
  const settings = getGroqSettings();
  
  if (!settings?.groqApiKey) {
    toast.error('Chave da API GROQ não configurada nas Configurações');
    throw new Error('API key not configured');
  }
  
  try {
    console.log('Analyzing image with simulated AI vision processing');
    
    // In a real implementation, this would call an AI vision API
    // For now we'll create smarter mock data based on a delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate some plausible OCR text
    const ocrText = `DOCUMENTO OFICIAL
Número de Registro: AB-12345678
Data de Emissão: 10/05/2023
Nome: João Silva Santos
CPF: 123.456.789-00

INFORMAÇÕES ADICIONAIS
Placa Veicular: ABC-1234
Endereço: Avenida Principal, 123 - Centro
Cidade: São Paulo - SP
Referência: Próximo ao Terminal Rodoviário`;

    // Generate mock facial detection data
    const faces = [
      { 
        id: 1, 
        confidence: 0.94, 
        region: { x: 50, y: 30, width: 100, height: 100 },
        landmarks: [
          { type: "eye_left", x: 80, y: 60 },
          { type: "eye_right", x: 120, y: 60 },
          { type: "nose", x: 100, y: 80 },
        ]
      },
      { 
        id: 2, 
        confidence: 0.87, 
        region: { x: 250, y: 50, width: 90, height: 90 },
        landmarks: [
          { type: "eye_left", x: 275, y: 70 },
          { type: "eye_right", x: 310, y: 70 },
          { type: "nose", x: 290, y: 90 },
        ] 
      }
    ];

    // Extract license plates from the OCR text
    const plateRegex = /[A-Z]{3}-\d{4}/g;
    const licensePlates = ocrText.match(plateRegex) || [];

    return {
      ocrText,
      faces,
      licensePlates
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    toast.error('Erro ao analisar imagem');
    throw error;
  }
};
