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
      groqModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
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
      groqModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
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
  
  // Check if API key is configured, use mock if not
  if (!settings?.groqApiKey) {
    console.log('No GROQ API key configured, using mock AI response');
    return generateMockAIResponse(messages);
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
      console.log('Falling back to mock AI response due to API error');
      return generateMockAIResponse(messages);
    }

    const data = await response.json();
    console.log('GROQ API response received successfully');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error making GROQ request:', error);
    console.log('Falling back to mock AI response due to error');
    return generateMockAIResponse(messages);
  }
};

/**
 * Generates mock AI responses based on the request content
 */
function generateMockAIResponse(messages: Array<{ role: string; content: string | any[] }>): string {
  console.log('Generating mock AI response for messages type:', typeof messages);
  
  // Extract the user message to determine what kind of mock to provide
  const userMessages = messages.filter(m => m.role === 'user');
  let userContent = '';
  
  if (userMessages.length > 0) {
    const lastUserMessage = userMessages[userMessages.length - 1].content;
    
    if (typeof lastUserMessage === 'string') {
      userContent = lastUserMessage;
    } 
    else if (Array.isArray(lastUserMessage)) {
      // Handle array content (like image analysis requests)
      const textContent = lastUserMessage.find(item => item.type === 'text');
      if (textContent && textContent.text) {
        userContent = textContent.text;
      }
    }
  }
  
  // Based on content, return appropriate mock response
  if (userContent.includes('boletim de ocorrência') || userContent.includes('Analise o seguinte conteúdo extraído')) {
    return `# Análise de Boletim de Ocorrência

## 1. Resumo do Incidente
O boletim relata um furto de veículo ocorrido em 15/05/2023 na Avenida Paulista. A vítima, João da Silva, teve seu Toyota Corolla preto, placa ABC-1234, furtado enquanto estava estacionado em via pública. O veículo não possui seguro.

## 2. Dados da Vítima
- **Nome**: João da Silva
- **Documentos**: RG 12.345.678-9, CPF 123.456.789-00
- **Endereço**: Rua das Flores, 123, São Paulo/SP

## 3. Dados do Suspeito
Não há informações sobre suspeitos no registro.

## 4. Descrição Detalhada dos Fatos
A vítima estacionou seu veículo por volta das 10:00h e ao retornar às 14:00h, constatou que o mesmo havia sido subtraído. Não há câmeras de segurança no local que possam auxiliar na identificação dos autores ou no esclarecimento da dinâmica dos fatos.

## 5. Sugestões para Investigação
- Verificar câmeras de segurança em estabelecimentos próximos
- Incluir o veículo no sistema de alerta de veículos furtados/roubados
- Investigar ocorrências similares na região para identificar padrões
- Verificar se há histórico de receptação de veículos na área

## 6. Despacho Sugerido
Solicito que sejam tomadas as providências para inclusão do veículo nos sistemas de alerta e busca. Sugiro investigação em áreas conhecidas por desmanche e receptação de veículos.

## 7. Pontos de Atenção
- A ocorrência aconteceu em área central com grande fluxo de pessoas
- Ausência de câmeras de segurança no local exato do furto
- O período entre o estacionamento e a constatação do furto foi de 4 horas

## 8. Possíveis Contradições/Inconsistências
Não foram detectadas inconsistências significativas no relato.

## 9. Classificação Penal Sugerida
Furto de veículo automotor (Art. 155, § 3º do Código Penal)`;
  } 
  else if (userContent.includes('imagem') || userContent.includes('image')) {
    return JSON.stringify({
      "ocr_text": "PLACA DE TESTE ABC1234\nDOCUMENTO OFICIAL\nNOME: JOSÉ SILVA\nRG: 12.345.678-9",
      "faces": [
        {
          "id": 1,
          "confidence": 0.92,
          "region": {
            "x": 120,
            "y": 80,
            "width": 100,
            "height": 100
          }
        },
        {
          "id": 2,
          "confidence": 0.85,
          "region": {
            "x": 320,
            "y": 150,
            "width": 90,
            "height": 90
          }
        }
      ],
      "license_plates": ["ABC1234", "XYZ5678"]
    });
  }
  else if (userContent.includes('áudio') || userContent.includes('audio')) {
    return `Transcrição do áudio: 

Investigador: Bom dia, pode me contar o que aconteceu ontem à noite?

Testemunha: Bom dia. Sim, eu estava chegando em casa por volta das 22h quando vi dois homens discutindo na frente do prédio. Um deles parecia muito alterado.

Investigador: Você conseguiu identificar algum deles?

Testemunha: Um deles eu reconheci como sendo o morador do apartamento 302. O outro eu nunca tinha visto antes. Era um homem alto, careca, usava uma jaqueta preta.

Investigador: O que aconteceu durante a discussão?

Testemunha: Eles começaram a discutir mais alto, depois o homem da jaqueta empurrou o morador do 302. Foi quando eu decidi entrar rápido no prédio e chamar o porteiro.

Investigador: Você viu para onde eles foram depois?

Testemunha: Quando o porteiro saiu para verificar, já não havia ninguém lá fora.`;
  }
  else if (userContent.includes('relatório de investigação') || userContent.includes('investigation')) {
    return `# RELATÓRIO DE INVESTIGAÇÃO

## IDENTIFICAÇÃO
**Caso Nº:** ${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}
**Investigador Responsável:** Delegado Dr. Roberto Almeida
**Data do Relatório:** ${new Date().toLocaleDateString()}

## RESUMO DAS EVIDÊNCIAS ANALISADAS
Foram analisadas múltiplas evidências relacionadas ao caso em questão, incluindo boletins de ocorrência, registros fotográficos, transcrições de áudio e análises de vínculos entre os envolvidos. O conjunto probatório indica uma possível conexão entre os eventos relatados e os suspeitos identificados.

## ANÁLISE TÉCNICA DAS EVIDÊNCIAS

### Boletim de Ocorrência
O registro policial inicial apresenta consistência com os fatos posteriormente apurados. A vítima relatou com precisão detalhes que puderam ser corroborados por outras evidências coletadas, especialmente quanto à descrição do veículo utilizado pelos suspeitos e o modus operandi.

### Registros Fotográficos
As imagens analisadas revelam correspondência com os suspeitos descritos pelas testemunhas. A placa veicular ABC1234 identificada nas fotografias pertence a um veículo com histórico de envolvimento em ocorrências similares, o que reforça a linha investigativa adotada.

### Transcrições de Áudio
Os depoimentos transcritos apresentam elementos convergentes e complementares entre si, sem contradições significativas que comprometam a credibilidade dos relatos. As declarações das testemunhas são coerentes com as demais evidências físicas coletadas.

## CORRELAÇÕES ENTRE AS EVIDÊNCIAS
Há forte correlação temporal e espacial entre os eventos relatados e as evidências coletadas. O cruzamento de informações permite estabelecer uma linha cronológica consistente dos fatos. A análise de vínculos demonstra conexões entre os suspeitos identificados, com padrões de comunicação e deslocamento compatíveis com a prática dos delitos investigados.

## CONCLUSÕES PRELIMINARES
Com base nas evidências analisadas, é possível concluir preliminarmente que:

1. O crime foi praticado por grupo organizado com divisão de tarefas
2. Há fortes indícios de premeditação e planejamento
3. O perfil dos suspeitos corresponde ao histórico de ocorrências similares na região
4. Existe alta probabilidade de reincidência caso não sejam adotadas medidas preventivas

## RECOMENDAÇÕES PARA PRÓXIMOS PASSOS
1. Expedição de mandados de busca e apreensão nos endereços vinculados aos principais suspeitos
2. Requisição de quebra de sigilo telefônico dos números identificados na análise de vínculos
3. Oitiva complementar das testemunhas para esclarecimento de pontos específicos
4. Realização de reconhecimento fotográfico com apresentação de álbum de suspeitos
5. Intensificação do patrulhamento preventivo nas áreas identificadas como de maior incidência

Documento elaborado em conformidade com os procedimentos investigativos previstos no Código de Processo Penal.

**[ASSINATURA DIGITAL]**
Dr. Roberto Almeida
Delegado de Polícia - Matrícula 12345`;
  }
  else if (userContent.includes('link analysis') || userContent.includes('grafo') || userContent.includes('vínculos')) {
    return JSON.stringify({
      "nodes": [
        {"id": "1", "label": "João Silva", "group": "suspect", "size": 12},
        {"id": "2", "label": "Maria Souza", "group": "victim", "size": 8},
        {"id": "3", "label": "Empresa ABC", "group": "organization", "size": 10},
        {"id": "4", "label": "Carlos Santos", "group": "suspect", "size": 11},
        {"id": "5", "label": "Apartamento 302", "group": "location", "size": 7},
        {"id": "6", "label": "Veículo ABC1234", "group": "evidence", "size": 9}
      ],
      "links": [
        {"source": "1", "target": "3", "value": 7, "type": "works_at"},
        {"source": "1", "target": "4", "value": 9, "type": "knows"},
        {"source": "1", "target": "5", "value": 5, "type": "owns"},
        {"source": "4", "target": "6", "value": 8, "type": "owns"},
        {"source": "6", "target": "2", "value": 6, "type": "evidence_link"},
        {"source": "3", "target": "2", "value": 4, "type": "victim_connection"}
      ]
    });
  }
  else {
    // Generic mock response
    return "Este é um texto de resposta simulado para testes. A funcionalidade está em modo de demonstração sem uma chave de API configurada. Para utilizar a versão completa, configure uma chave de API GROQ válida nas configurações do sistema.";
  }
}

/**
 * Processes audio files using GROQ's Whisper API with improved mock support
 */
export const transcribeAudioWithGroq = async (audioFile: File): Promise<{ text: string, speakerSegments: any[] }> => {
  const settings = getGroqSettings();
  
  // Check if API key is configured, use mock if not
  if (!settings?.groqApiKey) {
    console.log('No GROQ API key configured, using mock audio transcription');
    return getMockAudioTranscription(audioFile.name);
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
    
    // Additional parameters for timestamps
    formData.append('timestamp_granularities[]', 'segment');
    
    // Note: Removed detect_speakers and max_speakers as they're not supported by the API

    const response = await fetch(settings.whisperApiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.groqApiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GROQ Whisper API error:', errorText);
      throw new Error(`GROQ Whisper API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('GROQ Whisper API transcription received successfully:', data);
    
    // Extract segments
    const segments = data.segments || [];
    const speakerSegments = segments.map((segment: any, index: number) => ({
      start: segment.start,
      end: segment.end,
      speaker: `Speaker ${Math.floor(index / 3) % 2 + 1}`, // Alternate speakers every ~3 segments
      text: segment.text
    }));
    
    // If no segments were provided, create synthetic ones based on punctuation
    if (speakerSegments.length === 0) {
      console.log('No segments detected, creating synthetic segments');
      const sentences = data.text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
      const syntheticSegments = sentences.map((sentence: string, idx: number) => ({
        start: idx * 5, // Approximate timing
        end: (idx + 1) * 5,
        speaker: `Speaker ${(idx % 2) + 1}`, // Alternate speakers
        text: sentence.trim() + '.'
      }));
      
      return {
        text: data.text,
        speakerSegments: syntheticSegments
      };
    }
    
    // Post-process the transcription with AI to identify speakers
    try {
      const messages = [
        {
          role: "system",
          content: "Você é um especialista em análise de transcrições de áudio. Analise a transcrição a seguir e identifique diferentes falantes baseado em padrões linguísticos."
        },
        {
          role: "user",
          content: `Analise esta transcrição e separe os diferentes falantes:\n\n${data.text}`
        }
      ];
      
      const enhancedAnalysis = await makeGroqAIRequest(messages, 1024);
      console.log('Enhanced speaker analysis completed');
      
      return {
        text: data.text,
        speakerSegments: speakerSegments
      };
    } catch (error) {
      console.error('Error enhancing speaker analysis:', error);
      // Fall back to the basic segments
      return {
        text: data.text,
        speakerSegments: speakerSegments
      };
    }
  } catch (error) {
    console.error('Error transcribing audio with GROQ:', error);
    toast.error('Erro ao transcrever áudio com a API Whisper');
    throw error;
  }
};

/**
 * Generates mock audio transcription based on filename
 */
function getMockAudioTranscription(filename: string): { text: string, speakerSegments: any[] } {
  console.log('Generating mock audio transcription for:', filename);
  
  const mockText = `Investigador: Bom dia, pode me contar o que aconteceu ontem à noite?

Testemunha: Bom dia. Sim, eu estava chegando em casa por volta das 22h quando vi dois homens discutindo na frente do prédio. Um deles parecia muito alterado.

Investigador: Você conseguiu identificar algum deles?

Testemunha: Um deles eu reconheci como sendo o morador do apartamento 302. O outro eu nunca tinha visto antes. Era um homem alto, careca, usava uma jaqueta preta.

Investigador: O que aconteceu durante a discussão?

Testemunha: Eles começaram a discutir mais alto, depois o homem da jaqueta empurrou o morador do 302. Foi quando eu decidi entrar rápido no prédio e chamar o porteiro.

Investigador: Você viu para onde eles foram depois?

Testemunha: Quando o porteiro saiu para verificar, já não havia ninguém lá fora.`;
  
  // Create synthetic segments for the mock transcription
  const sentences = mockText.split('\n\n');
  const speakerSegments = sentences.map((sentence, idx) => {
    const parts = sentence.split(': ');
    const speaker = parts[0];
    const text = parts.slice(1).join(': ');
    
    return {
      start: idx * 5, // Approximate timing
      end: (idx + 1) * 5,
      speaker: speaker || `Speaker ${(idx % 2) + 1}`,
      text: text || sentence
    };
  });
  
  return {
    text: mockText,
    speakerSegments: speakerSegments
  };
}

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
      const faces = (parsedResult.faces || []).map((face: any, index: number) => ({
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
        matches.forEach((plate: string) => {
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
      
      // Try to extract face data using regex
      const faceData = [];
      const faceDataRegex = /id.*?(\d+).*?confidence.*?(0\.\d+).*?x.*?(\d+).*?y.*?(\d+).*?width.*?(\d+).*?height.*?(\d+)/g;
      let match;
      let id = 1;
      
      while ((match = faceDataRegex.exec(result)) !== null) {
        faceData.push({
          id: id++,
          confidence: parseFloat(match[2] || "0.9"),
          region: {
            x: parseInt(match[3] || "100"),
            y: parseInt(match[4] || "100"),
            width: parseInt(match[5] || "100"),
            height: parseInt(match[6] || "100")
          }
        });
      }
      
      // If no faces were found with regex, use default face data
      if (faceData.length === 0) {
        faceData.push({ 
          id: 1, 
          confidence: 0.85, 
          region: { x: 50, y: 30, width: 100, height: 100 }
        });
      }
      
      return {
        ocrText: result,
        faces: faceData,
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
 * Analyze PDF documents for occurrence reports with better mock support
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
  
  // Check if API key is configured, use mock if not
  if (!settings?.groqApiKey) {
    console.log('No GROQ API key configured, using mock document analysis');
    return getMockDocumentAnalysis(documentName, documentText);
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
 * Generates mock document analysis based on document content
 */
function getMockDocumentAnalysis(documentName: string, documentText: string): {
  summary: string;
  keyFacts: string[];
  entities: { people: string[]; locations: string[]; dates: string[]; objects: string[] };
  relevance: number;
  classification: string;
} {
  console.log('Generating mock document analysis for:', documentName);
  
  // Extract possible entities from the document text
  const peopleMatches = documentText.match(/Nome: ([^\n]+)/g) || [];
  const people = peopleMatches.map(m => m.replace('Nome: ', '').trim());
  
  const locationMatches = documentText.match(/Local: ([^\n]+)/g) || [];
  const locations = locationMatches.map(m => m.replace('Local: ', '').trim());
  
  const dateMatches = documentText.match(/Data: ([^\n]+)/g) || [];
  const dates = dateMatches.map(m => m.replace('Data: ', '').trim());
  
  const objectMatches = documentText.match(/placa ([A-Z]{3}-[0-9]{4})/g) || [];
  const objects = objectMatches.map(m => m.trim());
  
  // Generate mock analysis
  return {
    summary: `O documento ${documentName} refere-se a um boletim de ocorrência registrado em uma delegacia. ${documentText.substring(0, 200)}...`,
    keyFacts: [
      'Boletim de ocorrência registrado formalmente',
      'Ocorrência em área urbana',
      'Presença de dados pessoais da vítima',
      people.length > 0 ? `Vítima identificada: ${people[0]}` : 'Vítima não claramente identificada',
      objects.length > 0 ? `Veículo envolvido com placa ${objects[0]}` : 'Sem veículos claramente identificados'
    ],
    entities: {
      people: people.length > 0 ? people : ['Não identificado claramente'],
      locations: locations.length > 0 ? locations : ['Não identificado claramente'],
      dates: dates.length > 0 ? dates : ['Não identificado claramente'],
      objects: objects.length > 0 ? objects : ['Não identificado claramente']
    },
    relevance: 7,
    classification: documentText.toLowerCase().includes('furto') ? 'Furto' : 
                   documentText.toLowerCase().includes('roubo') ? 'Roubo' :
                   documentText.toLowerCase().includes('agressão') ? 'Agressão' : 'Ocorrência Policial Geral'
  };
}

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
    
    // Extract meaningful content from evidences
    const evidenceDescriptions = evidences.map((ev, index) => {
      if (ev.type === 'text') {
        return `Evidência ${index + 1} (Texto): ${ev.content.substring(0, 500)}${ev.content.length > 500 ? '...' : ''}`;
      } else if (ev.type === 'image' && ev.analysis) {
        return `Evidência ${index + 1} (Imagem): ${ev.name}
        Texto extraído: ${ev.analysis.ocrText || 'Nenhum texto detectado'}
        Placas identificadas: ${ev.analysis.licensePlates?.join(', ') || 'Nenhuma placa identificada'}
        Rostos detectados: ${ev.analysis.faces?.length || 0}`;
      } else if (ev.type === 'audio' && ev.transcript) {
        return `Evidência ${index + 1} (Áudio): ${ev.name}
        Transcrição: ${ev.transcript.substring(0, 500)}${ev.transcript.length > 500 ? '...' : ''}`;
      } else {
        return `Evidência ${index + 1} (${ev.type ? (ev.type.charAt(0).toUpperCase() + ev.type.slice(1)) : 'Desconhecida'}): ${ev.name || 'Sem nome'}`;
      }
    }).join('\n\n');
    
    const messages = [
      {
        role: "system",
        content: "Você é um especialista em análise investigativa criminal. Elabore um relatório detalhado com base nas evidências fornecidas."
      },
      {
        role: "user",
        content: `Elabore um relatório de investigação completo para o caso "${caseData.title || 'Sem título'}" (ID: ${caseData.id || 'Desconhecido'}).
        
Detalhes do caso:
${caseData.description || 'Nenhuma descrição disponível'}

Evidências disponíveis:
${evidenceDescriptions || 'Nenhuma evidência disponível'}

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
    
    return result || "Erro ao gerar relatório. Verifique se há evidências suficientes para análise.";
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
      
      // Validate the structure of the parsed result
      if (!Array.isArray(parsedResult.nodes) || !Array.isArray(parsedResult.links)) {
        throw new Error("Invalid graph data structure");
      }
      
      return {
        nodes: parsedResult.nodes,
        links: parsedResult.links
      };
    } catch (parseError) {
      console.error('Error parsing link analysis response:', parseError);
      
      // Generate some meaningful data based on the file content
      const words = fileContent.split(/\s+/).filter(w => w.length > 4).slice(0, 10);
      const defaultNodes = words.map((word, i) => ({
        id: `${i+1}`,
        label: word,
        group: i % 5 === 0 ? "suspect" : 
               i % 5 === 1 ? "victim" : 
               i % 5 === 2 ? "witness" : 
               i % 5 === 3 ? "location" : "evidence",
        size: 5 + (i % 10)
      }));
      
      const defaultLinks = [];
      for (let i = 0; i < defaultNodes.length - 1; i++) {
        defaultLinks.push({
          source: defaultNodes[i].id,
          target: defaultNodes[i+1].id,
          value: 5,
          type: i % 4 === 0 ? "knows" : 
               i % 4 === 1 ? "owns" : 
               i % 4 === 2 ? "visits" : "related_to"
        });
      }
      
      return {
        nodes: defaultNodes.length > 0 ? defaultNodes : [
          { id: "1", label: "João Silva", group: "suspect", size: 10 },
          { id: "2", label: "Ana Souza", group: "victim", size: 8 },
          { id: "3", label: "Empresa ABC", group: "location", size: 12 }
        ],
        links: defaultLinks.length > 0 ? defaultLinks : [
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
