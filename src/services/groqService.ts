
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
export const getGroqSettings = (): GroqAPISettings | null => {
  try {
    const savedSettings = localStorage.getItem('securai-api-settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return null;
  } catch (error) {
    console.error('Error fetching GROQ API settings:', error);
    return null;
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
    const response = await fetch(settings.groqApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.groqApiKey}`
      },
      body: JSON.stringify({
        model: settings.groqModel || "meta-llama/llama-4-maverick-17b-128e-instruct",
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
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', settings.whisperModel || "distil-whisper-large-v3-en");
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
    return data.text;
  } catch (error) {
    console.error('Error transcribing audio with GROQ:', error);
    toast.error('Erro ao transcrever áudio com a API Whisper');
    throw error;
  }
};
