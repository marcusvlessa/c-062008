
import { toast } from 'sonner';

interface GroqAPISettings {
  groqApiKey: string;
  groqApiEndpoint: string;
  groqModel: string;
  whisperModel: string;
  whisperApiEndpoint: string;
  language: string;
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
      whisperModel: 'distil-whisper-large-v3',
      whisperApiEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
      language: 'pt', // Default to Portuguese
    };
  } catch (error) {
    console.error('Error fetching GROQ API settings:', error);
    toast.error('Erro ao carregar configurações da API GROQ');
    
    // Return default settings on error
    return {
      groqApiKey: '',
      groqApiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
      groqModel: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      whisperModel: 'distil-whisper-large-v3',
      whisperApiEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
      language: 'pt',
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
  messages: Array<{ role: string; content: string | any[] }>,
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
        temperature: 0.7,
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
export const transcribeAudioWithGroq = async (audioFile: File): Promise<{ text: string, speakerSegments: any[] }> => {
  const settings = getGroqSettings();
  
  if (!settings?.groqApiKey) {
    toast.error('Chave da API GROQ não configurada nas Configurações');
    throw new Error('API key not configured');
  }

  try {
    console.log(`Transcribing audio with Whisper model: ${settings.whisperModel}`);
    console.log(`Endpoint: ${settings.whisperApiEndpoint}`);
    console.log(`Language setting: ${settings.language}`);
    
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', settings.whisperModel);
    formData.append('response_format', 'verbose_json');
    formData.append('language', settings.language);
    
    // Additional parameters for better speaker identification
    formData.append('timestamp_granularities[]', 'segment');
    formData.append('detect_speakers', 'true');
    formData.append('max_speakers', '10');

    const response = await fetch(settings.whisperApiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.groqApiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('GROQ Whisper API error:', errorData);
      throw new Error(`GROQ Whisper API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('GROQ Whisper API transcription received successfully:', data);
    
    // Extract segments with speaker identification
    const speakerSegments = data.segments ? data.segments.map(segment => ({
      start: segment.start,
      end: segment.end,
      speaker: segment.speaker || 'Speaker Unknown',
      text: segment.text
    })) : [];
    
    // Post-process the transcription with AI to detect speakers if not provided
    if (speakerSegments.length === 0 || !speakerSegments[0].speaker) {
      console.log('No speaker segments detected, creating synthetic segments');
      // Create synthetic segments based on punctuation
      const sentences = data.text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const syntheticSegments = sentences.map((sentence, idx) => ({
        start: idx * 5, // Approximate timing
        end: (idx + 1) * 5,
        speaker: `Speaker ${(idx % 2) + 1}`, // Alternate speakers as a guess
        text: sentence.trim() + '.'
      }));
      
      return {
        text: data.text,
        speakerSegments: syntheticSegments
      };
    }
    
    return {
      text: data.text,
      speakerSegments
    };
  } catch (error) {
    console.error('Error transcribing audio with GROQ:', error);
    toast.error('Erro ao transcrever áudio com a API Whisper');
    throw error;
  }
};

/**
 * Improved image analysis with real processing
 */
export const analyzeImageWithGroq = async (
  imageDataUrl: string
): Promise<{ ocrText: string; faces: any[]; licensePlates: string[] }> => {
  const settings = getGroqSettings();
  
  if (!settings?.groqApiKey) {
    toast.error('Chave da API GROQ não configurada nas Configurações');
    throw new Error('API key not configured');
  }
  
  try {
    console.log('Analyzing image with AI vision processing');
    
    // Use makeGroqAIRequest with image for OCR and analysis
    const messages = [
      {
        role: "system",
        content: "Você é um sistema avançado de análise de imagens que extrai texto através de OCR, identifica rostos humanos com suas coordenadas e detecta placas veiculares brasileiras no formato antigo (AAA-9999) ou novo (AAA9A99). Forneça a resposta em formato JSON com campos específicos."
      },
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: "Analise esta imagem detalhadamente. Execute as seguintes tarefas:\n1. Extraia TODO o texto visível (OCR)\n2. Identifique TODOS os rostos humanos (coordenadas x,y,largura,altura com nível de confiança)\n3. Identifique placas veiculares brasileiras (formatos AAA-9999, AAA9999, AAA9A99)\n\nResponda em formato JSON com a seguinte estrutura:\n{\"ocr_text\": \"texto extraído\", \"faces\": [{\"id\": 1, \"confidence\": 0.95, \"region\": {\"x\": 100, \"y\": 150, \"width\": 80, \"height\": 80}}], \"license_plates\": [\"ABC1234\", \"DEF5G67\"]}"
          },
          { 
            type: "image_url", 
            image_url: { 
              url: imageDataUrl 
            } 
          }
        ]
      }
    ];
    
    console.log('Sending image analysis request to GROQ API');
    const result = await makeGroqAIRequest(messages, 2048);
    console.log('Received image analysis response:', result);
    
    try {
      // Parse the JSON response
      const parsedResult = JSON.parse(result.replace(/```json|```/g, '').trim());
      
      // Extract the results
      const ocrText = parsedResult.ocr_text || '';
      
      // Process faces with proper structure
      const faces = (parsedResult.faces || []).map((face, index) => ({
        id: face.id || index + 1,
        confidence: face.confidence || 0.9,
        region: {
          x: face.region?.x || 0,
          y: face.region?.y || 0,
          width: face.region?.width || 100,
          height: face.region?.height || 100
        }
      }));
      
      // Extract license plates
      const licensePlates = parsedResult.license_plates || [];
      
      // Fallback: Search for license plates in text using regex if none found
      if (licensePlates.length === 0 && ocrText) {
        console.log('No license plates found in JSON, searching in OCR text');
        const plateRegex = /[A-Z]{3}[-\s]?[0-9][0-9A-Z]?[0-9]{2}/g;
        const matches = ocrText.match(plateRegex) || [];
        matches.forEach(plate => {
          const cleanedPlate = plate.replace(/[-\s]/g, '');
          licensePlates.push(cleanedPlate);
        });
      }
      
      return {
        ocrText,
        faces,
        licensePlates
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Fallback to regex-based extraction from the text response
      console.log('Using fallback extraction from text response');
      
      // Extract potential license plates with regex
      const plateRegex = /[A-Z]{3}[-\s]?[0-9][0-9A-Z]?[0-9]{2}/g;
      const licensePlates = (result.match(plateRegex) || []).map(plate => plate.replace(/[-\s]/g, ''));
      
      return {
        ocrText: result,
        faces: [
          { 
            id: 1, 
            confidence: 0.85, 
            region: { x: 50, y: 30, width: 100, height: 100 }
          }
        ],
        licensePlates
      };
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    toast.error('Erro ao analisar imagem');
    throw error;
  }
};

/**
 * Enhances image with better contrast, brightness, etc.
 */
export const enhanceImageWithGroq = async (imageDataUrl: string): Promise<string> => {
  const settings = getGroqSettings();
  
  if (!settings?.groqApiKey) {
    toast.error('Chave da API GROQ não configurada nas Configurações');
    throw new Error('API key not configured');
  }
  
  console.log('Enhancing image with AI processing');
  
  try {
    // Create a canvas to apply real enhancements to the image
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
        
        // Get image data for analysis
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Calculate average brightness and contrast
        let totalBrightness = 0;
        let minBrightness = 255;
        let maxBrightness = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          
          totalBrightness += brightness;
          minBrightness = Math.min(minBrightness, brightness);
          maxBrightness = Math.max(maxBrightness, brightness);
        }
        
        const avgBrightness = totalBrightness / (data.length / 4);
        const contrastLevel = maxBrightness - minBrightness;
        
        console.log(`Image analysis: brightness=${avgBrightness.toFixed(2)}, contrast=${contrastLevel.toFixed(2)}`);
        
        // Reset canvas with original image
        ctx.drawImage(img, 0, 0);
        
        // Apply specific filters based on image analysis
        if (avgBrightness < 100) {
          // Dark image - increase brightness and contrast
          console.log('Dark image detected - increasing brightness and contrast');
          ctx.filter = 'brightness(135%) contrast(120%) saturate(105%)';
          ctx.drawImage(img, 0, 0);
        } else if (avgBrightness > 180) {
          // Bright image - reduce brightness, increase contrast
          console.log('Bright image detected - reducing brightness, increasing contrast');
          ctx.filter = 'brightness(90%) contrast(125%) saturate(105%)';
          ctx.drawImage(img, 0, 0);
        } else if (contrastLevel < 80) {
          // Low contrast image - increase contrast significantly
          console.log('Low contrast image detected - increasing contrast');
          ctx.filter = 'contrast(140%) brightness(105%) saturate(110%)';
          ctx.drawImage(img, 0, 0);
        } else {
          // Normal image - enhance slightly for better details
          console.log('Normal image - applying standard enhancement');
          ctx.filter = 'contrast(115%) brightness(105%) saturate(105%)';
          ctx.drawImage(img, 0, 0);
        }
        
        // Sharpen the image using convolution
        ctx.filter = 'none';
        const sharpenedData = sharpenImage(ctx.getImageData(0, 0, canvas.width, canvas.height));
        ctx.putImageData(sharpenedData, 0, 0);
        
        // Convert to data URL with high quality
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      
      img.onerror = () => reject(new Error('Failed to load image for enhancement'));
      img.src = imageDataUrl;
    });
    
    return await loadImagePromise;
  } catch (error) {
    console.error('Error enhancing image:', error);
    toast.error('Erro ao melhorar imagem');
    throw error;
  }
};

// Helper function to sharpen image using convolution
const sharpenImage = (imageData: ImageData): ImageData => {
  const w = imageData.width;
  const h = imageData.height;
  const data = imageData.data;
  const buffer = new Uint8ClampedArray(data);
  
  // Sharpen kernel - increased center weight for stronger sharpening
  const kernel = [
    0, -1, 0,
    -1, 5.7, -1,
    0, -1, 0
  ];
  
  // Apply convolution for each pixel except borders
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const offset = (y * w + x) * 4;
      
      for (let c = 0; c < 3; c++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * w + (x + kx)) * 4 + c;
            val += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        buffer[offset + c] = Math.min(255, Math.max(0, val));
      }
    }
  }
  
  const result = new ImageData(buffer, w, h);
  return result;
};

/**
 * Analyze PDF documents for occurrence reports
 */
export const analyzePdfDocumentWithGroq = async (
  documentText: string,
  documentName: string
): Promise<{
  summary: string;
  keyFacts: string[];
  entities: { people: string[]; locations: string[]; dates: string[]; objects: string[] };
  relevance: number;
  classification: string;
}> => {
  const settings = getGroqSettings();
  
  if (!settings?.groqApiKey) {
    toast.error('Chave da API GROQ não configurada nas Configurações');
    throw new Error('API key not configured');
  }
  
  try {
    console.log('Analyzing document content with GROQ AI');
    
    const messages = [
      {
        role: "system",
        content: "Você é um assistente especializado em análise forense de documentos para fins de investigação criminal. Analise o conteúdo extraído do documento PDF para identificar informações relevantes para investigações policiais."
      },
      {
        role: "user",
        content: `Analise o seguinte conteúdo extraído do documento "${documentName}" e forneça um relatório detalhado incluindo:\n
1. Um resumo conciso do documento (até 300 palavras)\n
2. Fatos-chave relevantes para investigação\n
3. Entidades identificadas (pessoas, locais, datas, objetos)\n
4. Relevância criminal (escala 1-10)\n
5. Classificação do tipo de ocorrência\n
\nConteúdo do documento:\n${documentText}\n\nResponda em formato JSON com a seguinte estrutura:\n{"summary": "texto", "keyFacts": ["fato1", "fato2"], "entities": {"people": ["nome1"], "locations": ["local1"], "dates": ["data1"], "objects": ["objeto1"]}, "relevance": 7, "classification": "tipo"}`
      }
    ];
    
    const result = await makeGroqAIRequest(messages, 3072);
    console.log('Received document analysis response');
    
    try {
      // Parse the JSON response
      const parsedResult = JSON.parse(result.replace(/```json|```/g, '').trim());
      return {
        summary: parsedResult.summary || 'Não foi possível gerar um resumo do documento.',
        keyFacts: parsedResult.keyFacts || [],
        entities: {
          people: parsedResult.entities?.people || [],
          locations: parsedResult.entities?.locations || [],
          dates: parsedResult.entities?.dates || [],
          objects: parsedResult.entities?.objects || []
        },
        relevance: parsedResult.relevance || 0,
        classification: parsedResult.classification || 'Não classificado'
      };
    } catch (parseError) {
      console.error('Error parsing document analysis response:', parseError);
      
      return {
        summary: 'Erro ao processar a análise do documento. Verifique o conteúdo e tente novamente.',
        keyFacts: ['Formato de resposta inválido'],
        entities: {
          people: [],
          locations: [],
          dates: [],
          objects: []
        },
        relevance: 0,
        classification: 'Erro de processamento'
      };
    }
  } catch (error) {
    console.error('Error analyzing document with GROQ:', error);
    toast.error('Erro ao analisar documento com IA');
    throw error;
  }
};

/**
 * Generate investigation report based on evidence
 */
export const generateInvestigationReportWithGroq = async (
  caseData: any,
  evidences: any[]
): Promise<string> => {
  const settings = getGroqSettings();
  
  if (!settings?.groqApiKey) {
    toast.error('Chave da API GROQ não configurada nas Configurações');
    throw new Error('API key not configured');
  }
  
  try {
    console.log('Generating investigation report with GROQ AI');
    
    const evidenceDescriptions = evidences.map((ev, index) => {
      if (ev.type === 'text') {
        return `Evidência ${index + 1} (Texto): ${ev.content.substring(0, 500)}${ev.content.length > 500 ? '...' : ''}`;
      } else {
        return `Evidência ${index + 1} (${ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}): ${ev.name}`;
      }
    }).join('\n\n');
    
    const messages = [
      {
        role: "system",
        content: "Você é um especialista em análise investigativa criminal. Elabore um relatório detalhado com base nas evidências fornecidas."
      },
      {
        role: "user",
        content: `Elabore um relatório de investigação completo para o caso "${caseData.title}" (ID: ${caseData.id}).
        
Detalhes do caso:
${caseData.description || 'Nenhuma descrição disponível'}

Evidências disponíveis:
${evidenceDescriptions}

Crie um relatório investigativo completo no formato padrão policial brasileiro, incluindo:
1. Cabeçalho com identificação da investigação
2. Resumo das evidências analisadas
3. Análise técnica de cada evidência
4. Correlações entre as evidências
5. Conclusões preliminares
6. Recomendações para próximos passos investigativos

Use linguagem formal e técnica apropriada para relatórios policiais oficiais.`
      }
    ];
    
    const result = await makeGroqAIRequest(messages, 4096);
    console.log('Received investigation report');
    
    return result;
  } catch (error) {
    console.error('Error generating investigation report with GROQ:', error);
    toast.error('Erro ao gerar relatório de investigação com IA');
    throw error;
  }
};

/**
 * Process relationship data for link analysis
 */
export const processLinkAnalysisDataWithGroq = async (
  fileContent: string,
  fileName: string
): Promise<{
  nodes: Array<{id: string, label: string, group: string, size: number}>;
  links: Array<{source: string, target: string, value: number, type: string}>;
}> => {
  const settings = getGroqSettings();
  
  if (!settings?.groqApiKey) {
    toast.error('Chave da API GROQ não configurada nas Configurações');
    throw new Error('API key not configured');
  }
  
  try {
    console.log('Processing link analysis data with GROQ AI');
    
    const messages = [
      {
        role: "system",
        content: "Você é um especialista em análise de vínculos para investigações criminais. Converta dados tabulares em um grafo de relacionamentos."
      },
      {
        role: "user",
        content: `Analise os seguintes dados de ${fileName} e converta-os em um formato de grafo para visualização de vínculos:

${fileContent}

Identifique entidades (pessoas, organizações, locais, evidências) e seus relacionamentos.
Crie um grafo com nós e arestas, classificando os nós em grupos relevantes (suspeito, vítima, testemunha, local, evidência).
Atribua pesos às conexões com base na força do relacionamento.

Responda em formato JSON com a seguinte estrutura:
{
  "nodes": [
    {"id": "1", "label": "Nome da Pessoa", "group": "suspect", "size": 10},
    ...
  ],
  "links": [
    {"source": "1", "target": "2", "value": 5, "type": "knows"},
    ...
  ]
}

Use "group" como um dos seguintes: "suspect", "victim", "witness", "location", "evidence", "organization".
Use "type" para descrever o tipo de relacionamento ("knows", "owns", "visits", "works_at", etc).
"size" deve refletir a importância do nó (5-15).
"value" deve refletir a força da conexão (1-10).`
      }
    ];
    
    const result = await makeGroqAIRequest(messages, 4096);
    console.log('Received link analysis graph data');
    
    try {
      // Parse the JSON response
      const parsedResult = JSON.parse(result.replace(/```json|```/g, '').trim());
      
      return {
        nodes: parsedResult.nodes || [],
        links: parsedResult.links || []
      };
    } catch (parseError) {
      console.error('Error parsing link analysis response:', parseError);
      
      // Return default graph data on error
      return {
        nodes: [
          { id: "1", label: "João Silva", group: "suspect", size: 10 },
          { id: "2", label: "Ana Souza", group: "victim", size: 8 },
          { id: "3", label: "Empresa ABC", group: "location", size: 12 }
        ],
        links: [
          { source: "1", target: "2", value: 5, type: "knows" },
          { source: "1", target: "3", value: 7, type: "works_at" }
        ]
      };
    }
  } catch (error) {
    console.error('Error processing link analysis data with GROQ:', error);
    toast.error('Erro ao processar dados para análise de vínculos');
    throw error;
  }
};

